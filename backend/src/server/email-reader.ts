import '../utils/env.js'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { query } from '../db/index.js'
import { CompanyRepository } from '../repositories/companyRepository.js'
import { ApplicationRepository } from '../repositories/applicationRepository.js'
import { saveFile } from '../utils/storage.js'
import { logger } from '../utils/logger.js'
import { aiQueue } from '../queues/aiQueue.js'

type EmailReaderStatus = {
  enabled: boolean
  running: boolean
  disabledReason: string | null
  inboxAddress: string | null
  lastProcessedAt: string | null
  lastError: string | null
  consecutiveFailures: number
  reconnectDelayMs: number
  lastFailureCategory: 'imap_limit' | 'auth' | 'network' | 'unknown' | null
}

export const emailReaderStatus: EmailReaderStatus = {
  enabled: process.env.ENABLE_EMAIL_READER !== 'false',
  running: false,
  disabledReason: null,
  inboxAddress: process.env.IMAP_USER || null,
  lastProcessedAt: null,
  lastError: null,
  consecutiveFailures: 0,
  reconnectDelayMs: 30000,
  lastFailureCategory: null
}

export class EmailReader {
  private client: ImapFlow | null = null
  private isRunning = false
  private isStarting = false
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectDelayMs = 30000
  private readonly maxReconnectDelayMs = 300000
  private consecutiveImapFailures = 0
  private readonly circuitBreakerThreshold = 5
  private readonly circuitBreakerCooldownMs = 600000
  private companyRepo = new CompanyRepository()
  private applicationRepo = new ApplicationRepository()

  private scheduleReconnect(delayMs: number = 30000) {
    if (this.reconnectTimer) return
    const nextDelay = Math.min(Math.max(delayMs, this.reconnectDelayMs), this.maxReconnectDelayMs)
    this.reconnectDelayMs = Math.min(nextDelay * 2, this.maxReconnectDelayMs)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (emailReaderStatus.enabled && process.env.ENABLE_EMAIL_READER !== 'false') {
        this.start().catch(err => logger.error('❌ Reconnect failed:', err))
      }
    }, nextDelay)
  }

  private handleFailure(error: any) {
    const msg = (error?.message || String(error || '')).toLowerCase()
    const isLimit = msg.includes('too many simultaneous connections')
    this.consecutiveImapFailures = isLimit ? this.consecutiveImapFailures + 1 : 0
    emailReaderStatus.consecutiveFailures = this.consecutiveImapFailures
    
    if (this.consecutiveImapFailures >= this.circuitBreakerThreshold) {
      this.consecutiveImapFailures = 0
      this.reconnectDelayMs = this.circuitBreakerCooldownMs
      this.scheduleReconnect(this.circuitBreakerCooldownMs)
      return
    }
    this.scheduleReconnect(30000)
  }

  async start() {
    if (this.isRunning || this.isStarting) return
    this.isStarting = true

    const config = {
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT || '993', 10),
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS,
      secure: process.env.IMAP_SECURE !== 'false',
      pollMs: parseInt(process.env.IMAP_POLL_MS || '10000', 10)
    }

    if (!config.host || !config.user || !config.pass) {
      emailReaderStatus.disabledReason = 'IMAP credentials missing'
      this.isStarting = false
      return
    }

    try {
      this.client = new ImapFlow({ host: config.host, port: config.port, secure: config.secure, auth: { user: config.user, pass: config.pass }, logger: false })
      this.client.on('error', async (err: any) => {
        logger.error('❌ IMAP Error:', err.message)
        this.isRunning = false
        emailReaderStatus.running = false
        await this.client?.logout().catch(() => {})
        this.client = null
        this.scheduleReconnect(10000)
      })

      await this.client.connect()
      for (const folder of ['Processed', 'Failed']) {
        await this.client.mailboxOpen(folder).catch(() => this.client?.mailboxCreate(folder))
      }

      this.isRunning = true
      emailReaderStatus.running = true
    } catch (error) {
      this.isRunning = false
      this.handleFailure(error)
    } finally {
      this.isStarting = false
    }
  }

  private async reconnect(): Promise<boolean> {
    if (this.client) await this.client.logout().catch(() => {})
    this.client = null
    await this.start()
    return !!this.client?.authenticated
  }

  public async processNewEmails() {
    if (!this.isRunning) return
    if (!this.client?.authenticated && !(await this.reconnect())) return

    const lock = await this.client!.getMailboxLock('INBOX')
    try {
      const { rows: jobs } = await query<{ job_title: string; created_at: Date; application_deadline: Date }>(
        "SELECT DISTINCT job_title, created_at, application_deadline FROM job_postings WHERE status = 'ACTIVE' OR status IS NULL OR status = ''"
      )
      if (jobs.length === 0) return

      const seen = new Set<number>()
      for (const job of jobs) {
        const criteria: any = { seen: false, subject: job.job_title }
        
        if (job.created_at) {
          criteria.since = new Date(job.created_at)
        }
        
        if (job.application_deadline) {
          // IMAP BEFORE is exclusive, so add 1 day to include the deadline day
          const before = new Date(job.application_deadline)
          before.setDate(before.getDate() + 1)
          criteria.before = before
        }

        for await (const msg of this.client!.fetch(criteria, { envelope: true })) {
          if (seen.has(msg.seq)) continue
          seen.add(msg.seq)

          try {
            const full = await this.client!.fetchOne(msg.seq, { source: true, envelope: true })
            if (!full || typeof full === 'boolean' || !full.source) continue

            const match = await this.findJob(msg.envelope.subject || '')
            if (!match) {
              await this.move(msg.seq, 'Failed')
              continue
            }

            const targets = Array.isArray(match) ? match : [match]
            let ok = false
            for (const t of targets) {
              if (await this.handleEmail(full.source, full.envelope as any, msg.seq, t)) ok = true
            }

            if (ok) {
              await this.client!.messageFlagsAdd(msg.seq, ['\\\\Seen'])
              await this.move(msg.seq, 'Processed')
            } else {
              await this.move(msg.seq, 'Failed')
            }
          } catch (err) {
            await this.move(msg.seq, 'Failed')
          }
        }
      }
      emailReaderStatus.lastProcessedAt = new Date().toISOString()
    } finally {
      lock.release()
    }
  }

  private async move(seq: number, folder: string) {
    await this.client?.messageMove(seq, folder).catch(e => logger.warn(`Move failed ${seq} -> ${folder}`, e))
  }

  private async findJob(subject: string): Promise<any> {
    const sub = subject.toLowerCase().trim().replace(/\s+/g, ' ')
    const { rows: all } = await query("SELECT jp.*, c.company_name, c.company_domain, c.company_email, c.hr_email FROM job_postings jp JOIN companies c ON c.company_id = jp.company_id WHERE jp.status = 'ACTIVE' OR jp.status IS NULL OR jp.status = ''")
    
    if (all.length === 0) return null

    const matches = all.filter(j => sub.includes(j.job_title.toLowerCase().trim()))
    if (matches.length === 0) return null
    return matches.length === 1 ? matches[0] : matches
  }

  private async handleEmail(source: Buffer, envelope: any, seq: number, job: any): Promise<boolean> {
    const parsed = await simpleParser(source)
    const email = parsed.from?.value[0]?.address || envelope.from[0]?.address || ''
    const name = parsed.from?.text || envelope.from[0]?.name || 'Unknown'

    const company = await this.companyRepo.findById(job.company_id)
    if (!company) return false

    let cvUrl: string | null = null, cvBuf: Buffer | null = null
    for (const att of parsed.attachments || []) {
      const fn = att.filename?.toLowerCase() || ''
      if (fn.endsWith('.pdf') || fn.endsWith('.docx') || fn.endsWith('.doc')) {
        cvBuf = att.content as Buffer
        cvUrl = await saveFile(`cvs/${job.job_posting_id}_${Date.now()}_${att.filename}`, cvBuf)
        break
      }
    }

    const app = await this.applicationRepo.create({ 
      job_posting_id: job.job_posting_id, 
      company_id: company.company_id, 
      candidate_name: name, 
      email, 
      resume_url: cvUrl 
    })

    await aiQueue.add('profile-application', { applicationId: app.application_id })
    logger.info(`📤 Enqueued application ${app.application_id} for AI profiling`)

    return true
  }
}

export let reader: EmailReader | null = null
export async function startEmailReader() {
  if (process.env.ENABLE_EMAIL_READER === 'false') return
  if (!reader) {
    reader = new EmailReader()
    await reader.start().catch(err => logger.error('Start failed', err))
  }
  return reader
}
