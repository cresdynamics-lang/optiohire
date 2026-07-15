import { Request, Response } from 'express'
import { query } from '../db/index.js'
import { CandidateProfileRepository } from '../repositories/candidateProfileRepository.js'
import { CertificateRepository } from '../repositories/certificateRepository.js'
import { SkillAnalysisService } from '../services/ai/skillAnalysisService.js'
import { LearningRoadmapService } from '../services/ai/learningRoadmapService.js'
import crypto from 'crypto'
import path from 'path'
import { saveFile } from '../utils/storage.js'
import { cache, cacheKeys } from '../utils/redis.js'
const candidateRepo = new CandidateProfileRepository()
const certRepo = new CertificateRepository()
const skillAnalysisService = new SkillAnalysisService()
const roadmapService = new LearningRoadmapService()

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function isMissingRelation(error: any): boolean {
  return error?.code === '42P01' || String(error?.message || '').includes('does not exist')
}

async function ensureCandidateFeatureTables() {
  try {
    await query(`
      ALTER TABLE candidate_profiles 
      ADD COLUMN IF NOT EXISTS cover_letter_url text,
      ADD COLUMN IF NOT EXISTS recommendation_letter_url text;
    `)
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS candidate_missions (
        mission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
        mission_title text NOT NULL,
        mission_description text NOT NULL,
        target_skill text NOT NULL,
        learning_resources jsonb DEFAULT '[]'::jsonb,
        status text NOT NULL DEFAULT 'PENDING',
        completed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `)
    await query(`CREATE INDEX IF NOT EXISTS idx_candidate_missions_profile ON candidate_missions(profile_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_candidate_missions_status ON candidate_missions(status)`)

    await query(`
      CREATE TABLE IF NOT EXISTS candidate_interview_sessions (
        session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
        interview_type text NOT NULL,
        target_role text,
        score integer,
        feedback text,
        ai_analysis jsonb,
        status text NOT NULL DEFAULT 'COMPLETED',
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `)
    await query(`CREATE INDEX IF NOT EXISTS idx_candidate_interview_sessions_profile ON candidate_interview_sessions(profile_id)`)

    await query(`
      CREATE TABLE IF NOT EXISTS candidate_career_goals (
        goal_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
        target_role text NOT NULL,
        timeline_months integer,
        milestones jsonb DEFAULT '[]'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `)

    await query(`CREATE INDEX IF NOT EXISTS idx_candidate_interview_sessions_created ON candidate_interview_sessions(created_at DESC)`)

    await query(`
      CREATE TABLE IF NOT EXISTS recruiter_profile_views (
        view_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
        hr_user_id uuid NOT NULL,
        viewed_at timestamptz NOT NULL DEFAULT now()
      )
    `)
    await query(`CREATE INDEX IF NOT EXISTS idx_recruiter_profile_views_profile ON recruiter_profile_views(profile_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_recruiter_profile_views_viewed_at ON recruiter_profile_views(viewed_at DESC)`)

    await query(`
      CREATE TABLE IF NOT EXISTS candidate_score_history (
        history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
        total_score integer NOT NULL,
        recorded_at date NOT NULL DEFAULT CURRENT_DATE,
        UNIQUE (profile_id, recorded_at)
      )
    `)
    await query(`CREATE INDEX IF NOT EXISTS idx_candidate_score_history_profile ON candidate_score_history(profile_id)`)
  } catch (err) {
    console.warn('Failed in ensureCandidateFeatureTables:', err)
  }
}

async function ensureCandidateMissions(profileId: string, gapAnalysis: any) {
  try {
    const { rows: existing } = await query(
      `SELECT * FROM candidate_missions WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [profileId]
    )
    if (existing.length > 0) return existing

    const topSkill = gapAnalysis?.topMissingSkill || 'interview confidence'
    const missions = [
      {
        title: `Practice one ${topSkill} interview answer`,
        description: `Record or write a concise answer that explains how you would use ${topSkill} on a real project.`,
        skill: topSkill,
        resources: [{ label: 'Mock interview', type: 'practice' }],
      },
      {
        title: `Complete a focused ${topSkill} learning sprint`,
        description: `Spend 30 minutes learning the core concepts recruiters expect for ${topSkill}.`,
        skill: topSkill,
        resources: [{ label: 'Learning roadmap', type: 'course' }],
      },
      {
        title: 'Refresh your public candidate profile',
        description: 'Add one measurable achievement, project link, or certificate so recruiters see stronger proof.',
        skill: 'profile positioning',
        resources: [{ label: 'Profile', type: 'portfolio' }],
      },
    ]

    for (const mission of missions) {
      await query(
        `INSERT INTO candidate_missions (profile_id, mission_title, mission_description, target_skill, learning_resources)
         VALUES ($1, $2, $3, $4, $5)`,
        [profileId, mission.title, mission.description, mission.skill, JSON.stringify(mission.resources)]
      )
    }

    const { rows } = await query(
      `SELECT * FROM candidate_missions WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [profileId]
    )
    return rows
  } catch (error: any) {
    if (isMissingRelation(error)) return []
    throw error
  }
}

async function getInterviewSessions(profileId: string) {
  try {
    const { rows } = await query(
      `SELECT * FROM candidate_interview_sessions WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 8`,
      [profileId]
    )
    return rows
  } catch (error: any) {
    if (isMissingRelation(error)) return []
    throw error
  }
}

function scoreInterviewAnswers(answers: string[]) {
  const totalLength = answers.reduce((sum, answer) => sum + answer.trim().length, 0)
  const answered = answers.filter((answer) => answer.trim().length > 0).length
  const avgLength = answered ? totalLength / answered : 0
  const clarity = Math.min(95, Math.max(35, Math.round(45 + avgLength / 8)))
  const relevance = Math.min(95, Math.max(35, Math.round(40 + answered * 14 + avgLength / 18)))
  const depth = Math.min(95, Math.max(35, Math.round(38 + avgLength / 6)))
  const overall = Math.round((clarity + relevance + depth) / 3)

  return {
    overall,
    clarity,
    relevance,
    depth,
    feedback:
      overall >= 80
        ? 'Strong interview readiness. Your answers are detailed and credible; keep tightening examples with measurable outcomes.'
        : overall >= 65
          ? 'Good foundation. Add more concrete examples, metrics, and trade-off explanations to make your answers stronger.'
          : 'More practice needed. Use the STAR structure, give specific project examples, and connect each answer to the target role.',
    recommendations:
      overall >= 80
        ? ['Prepare two senior-level examples with numbers', 'Practice concise closing summaries']
        : ['Use STAR: situation, task, action, result', 'Add measurable outcomes to every answer', 'Practice one mock interview again this week'],
  }
}

export const getCandidateJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await query(
      `SELECT
         jp.job_posting_id,
         jp.job_title,
         jp.job_description,
         jp.skills_required,
         jp.application_deadline,
         jp.created_at,
         jp.job_poster_url,
         c.company_name
       FROM job_postings jp
       LEFT JOIN companies c ON c.company_id = jp.company_id
       WHERE UPPER(COALESCE(jp.status, 'ACTIVE')) = 'ACTIVE'
         AND (jp.application_deadline IS NULL OR jp.application_deadline::date >= CURRENT_DATE)
       ORDER BY jp.created_at DESC
       LIMIT 100`
    )

    res.status(200).json({ jobs: rows })
  } catch (error) {
    console.error('Candidate jobs fetch error:', error)
    res.status(500).json({ error: 'Failed to load jobs' })
  }
}

export const getCandidateApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any
    const email = authReq.userEmail
    
    if (!email) {
      res.status(400).json({ error: 'Missing candidate email in token' })
      return
    }

    const { rows } = await query(
      `SELECT
         a.application_id,
         a.created_at,
         a.updated_at,
         a.ai_score,
         a.ai_status,
         a.interview_status,
         a.reasoning,
         a.resume_url,
         a.parsed_resume_json,
         a.phone,
         jp.job_posting_id,
         jp.job_title,
         c.company_name,
         CASE
           WHEN upper(coalesce(a.interview_status::text,'')) = 'HIRED'
             OR upper(coalesce(a.ai_status::text,'')) = 'HIRED' THEN 'placed'
           WHEN upper(coalesce(a.ai_status::text,'')) = 'OFFER' THEN 'offer'
           WHEN upper(coalesce(a.interview_status::text,'')) IN ('SCHEDULED','COMPLETED','INTERVIEWING')
             OR a.interview_time IS NOT NULL THEN 'interviewing'
           WHEN upper(coalesce(a.ai_status::text,'')) IN ('SHORTLIST','SHORTLISTED') THEN 'shortlisted'
           ELSE lower(coalesce(a.ai_status, 'applied'))
         END AS pipeline_status
       FROM applications a
       JOIN job_postings jp ON jp.job_posting_id = a.job_posting_id
       LEFT JOIN companies c ON c.company_id = a.company_id
       WHERE LOWER(a.email) = LOWER($1)
       ORDER BY COALESCE(a.updated_at, a.created_at) DESC
       LIMIT 100`,
      [email]
    )

    res.status(200).json({
      applications: rows.map((r: any) => ({
        ...r,
        employer: r.company_name,
        role: r.job_title,
        placement_aligned: ['placed', 'offer'].includes(r.pipeline_status),
      })),
    })
  } catch (error) {
    console.error('Candidate applications fetch error:', error)
    res.status(500).json({ error: 'Failed to load application history', details: String(error?.stack || error?.message || error) })
  }
}

export const submitCandidateApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any
    const authEmail = authReq.userEmail
    const authName = authReq.userName

    const body = req.body
    const jobPostingId = body?.jobPostingId ? String(body.jobPostingId) : ''
    const resumeUrl = body?.resumeUrl ? String(body.resumeUrl).trim() : ''
    const resumeFileName = body?.resumeFileName ? String(body.resumeFileName).trim() : ''
    const resumeMimeType = body?.resumeMimeType ? String(body.resumeMimeType).trim() : ''
    const linkedinUrl = body?.linkedinUrl ? String(body.linkedinUrl).trim() : ''
    const githubUrl = body?.githubUrl ? String(body.githubUrl).trim() : ''
    const otherUrl = body?.otherUrl ? String(body.otherUrl).trim() : ''
    const phone = body?.phone ? String(body.phone).trim() : ''
    const message = body?.message ? String(body.message).trim() : ''
    const bodyEmail = body?.email ? String(body.email).toLowerCase().trim() : ''
    const bodyName = body?.name ? String(body.name).trim() : ''

    if (!jobPostingId) {
      res.status(400).json({ error: 'jobPostingId is required' })
      return
    }
    // Application evidence (CV, LinkedIn, etc.) is now optional as requested.

    const email = (authEmail || bodyEmail || '').toLowerCase().trim()
    if (!email) {
      res.status(400).json({ error: 'A valid applicant email is required.' })
      return
    }
    const candidateName = authName || bodyName || email.split('@')[0] || null

    const { rows: jobs } = await query<{ job_posting_id: string; company_id: string }>(
      `SELECT job_posting_id, company_id
       FROM job_postings
       WHERE job_posting_id = $1
       LIMIT 1`,
      [jobPostingId]
    )
    const job = jobs[0]
    if (!job) {
      res.status(404).json({ error: 'Job not found' })
      return
    }

    const parsedResume = {
      source: 'candidate_portal',
      links: {
        resumeUrl: resumeUrl || null,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        otherUrl: otherUrl || null,
      },
      document: {
        name: resumeFileName || null,
        mimeType: resumeMimeType || null,
      },
      note: message || null,
    }

    const externalId = sha256Hex(`${jobPostingId}|${email}`)

    const writeParams = [
      candidateName,
      phone || null,
      resumeUrl || linkedinUrl || githubUrl || otherUrl || null,
      JSON.stringify(parsedResume),
      externalId,
      job.job_posting_id,
      email,
      job.company_id,
    ]

    const updateResult = await query<{ application_id: string }>(
      `UPDATE applications
       SET candidate_name = $1,
           phone = $2,
           resume_url = $3,
           parsed_resume_json = $4::jsonb,
           external_id = $5,
           company_id = $8,
           updated_at = NOW()
       WHERE job_posting_id = $6
         AND LOWER(email) = LOWER($7)
       RETURNING application_id`,
      writeParams
    )

    let applicationId = updateResult.rows[0]?.application_id || null

    if (!applicationId) {
      const insertResult = await query<{ application_id: string }>(
        `INSERT INTO applications
          (job_posting_id, company_id, candidate_name, email, phone, resume_url, parsed_resume_json, external_id)
         VALUES
          ($6, $8, $1, $7, $2, $3, $4::jsonb, $5)
         RETURNING application_id`,
        writeParams
      )
      applicationId = insertResult.rows[0]?.application_id || null
    }

    // Trigger scoring pipeline
    if (applicationId) {
      try {
        const { aiQueue } = await import('../queues/aiQueue.js')
        await aiQueue.add('profile-application', { applicationId })
      } catch (queueErr) {
        console.warn('Background scoring trigger failed in backend:', queueErr)
      }
    }

    res.status(200).json({
      success: true,
      applicationId,
      scoringQueued: Boolean(applicationId),
    })
  } catch (error) {
    console.error('Candidate application submit error:', error)
    res.status(500).json({ error: 'Failed to submit application', details: String(error?.stack || error?.message || error) })
  }
}

export const getCandidateDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    
    // Get or create profile
    let profile = await candidateRepo.getProfileByUserId(userId)
    if (!profile) {
      profile = await candidateRepo.createProfile(userId)
    }
    try {
      try {
      await ensureCandidateFeatureTables()
    } catch (e) {
      console.warn('ensureCandidateFeatureTables error:', e)
    }
    } catch (e) {
      console.warn('ensureCandidateFeatureTables error:', e)
    }

    // Get skills
    const skills = await candidateRepo.getSkills(profile.profile_id)
    
    // Get recommendations
    await skillAnalysisService.matchJobsToCandidate(profile.profile_id)
    const recommendations = await candidateRepo.getRecommendations(profile.profile_id)
    
    // Get missing skills analysis
    const gapAnalysis = await skillAnalysisService.getSkillGapRecommendations(profile.profile_id)

    // Snapshot current score for today
    await query(`
      INSERT INTO candidate_score_history (profile_id, total_score, recorded_at)
      VALUES ($1, $2, CURRENT_DATE)
      ON CONFLICT (profile_id, recorded_at) 
      DO UPDATE SET total_score = EXCLUDED.total_score
    `, [profile.profile_id, profile.total_score])

    // Get score history
    const { rows: scoreHistory } = await query(
      `SELECT total_score, recorded_at::text as recorded_at 
       FROM candidate_score_history 
       WHERE profile_id = $1 
       ORDER BY recorded_at ASC`,
      [profile.profile_id]
    )

    // Get recruiter views count
    const { rows: viewsResult } = await query(
      `SELECT count(*) as count 
       FROM recruiter_profile_views 
       WHERE profile_id = $1`,
      [profile.profile_id]
    )
    const recruiterViewsCount = parseInt(viewsResult[0]?.count || '0', 10)

    // Check if candidate is a returning alumni
    const { rows: alumniCheck } = await query(
      `SELECT 1 FROM applications a 
       JOIN users u ON LOWER(a.email) = LOWER(u.email) 
       WHERE u.user_id = $1 
         AND a.interview_status = 'HIRED' 
         AND a.updated_at < NOW() - INTERVAL '6 months'
       LIMIT 1`,
      [userId]
    )
    const needsAlumniUpdate = (alumniCheck.length > 0 && !profile.is_returning)

    res.status(200).json({
      success: true,
      data: {
        profile,
        skills,
        recommendations,
        gapAnalysis,
        missions: await ensureCandidateMissions(profile.profile_id, gapAnalysis),
        interviewSessions: await getInterviewSessions(profile.profile_id),
        scoreHistory,
        recruiterViewsCount,
        needsAlumniUpdate
      }
    })
  } catch (error: any) {
    console.error('Error fetching candidate dashboard:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const completeMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    const { missionId } = req.params
    const profile = await candidateRepo.getProfileByUserId(userId)
    if (!profile) {
      res.status(404).json({ success: false, error: 'Candidate profile not found' })
      return
    }
    try {
      await ensureCandidateFeatureTables()
    } catch (e) {
      console.warn('ensureCandidateFeatureTables error:', e)
    }

    const { rows } = await query(
      `UPDATE candidate_missions
       SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW()
       WHERE mission_id = $1 AND profile_id = $2
       RETURNING *`,
      [missionId, profile.profile_id]
    )

    if (rows.length === 0) {
      res.status(404).json({ success: false, error: 'Mission not found' })
      return
    }

    await query(
      `UPDATE candidate_profiles SET total_score = total_score + 10 WHERE profile_id = $1`,
      [profile.profile_id]
    )

    res.status(200).json({ success: true, mission: rows[0] })
  } catch (error: any) {
    console.error('Error completing mission:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { time = 'all_time', category = 'all' } = req.query

    // Basic leaderboard query
    // Join candidate_profiles with users to get the candidate_name or email
    let timeFilter = ''
    if (time === 'this_week') {
      timeFilter = 'AND cp.updated_at >= NOW() - INTERVAL \'7 days\''
    } else if (time === 'this_month') {
      timeFilter = 'AND cp.updated_at >= NOW() - INTERVAL \'30 days\''
    }

    const { rows } = await query(
      `SELECT 
         cp.profile_id, 
         cp.total_score, 
         u.name as candidate_name, 
         u.email 
       FROM candidate_profiles cp
       JOIN users u ON cp.user_id = u.user_id
       WHERE u.role = 'candidate' ${timeFilter}
       ORDER BY cp.total_score DESC
       LIMIT 50`
    )

    // Mask the email for privacy on a public leaderboard
    const formattedLeaderboard = rows.map((row: any) => ({
      profile_id: row.profile_id,
      total_score: row.total_score,
      candidate_name: row.candidate_name || row.email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.profile_id}`
    }))

    res.status(200).json({ success: true, leaderboard: formattedLeaderboard })
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const getLearningRoadmap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skillName } = req.query
    if (!skillName || typeof skillName !== 'string') {
      res.status(400).json({ success: false, error: 'Skill name is required' })
      return
    }

    const roadmapData = await roadmapService.generateRoadmap(skillName)
    res.status(200).json({ success: true, steps: roadmapData })
  } catch (error: any) {
    console.error('Error generating roadmap:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const uploadCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skillId } = req.body
    let certificateUrl = req.body.certificateUrl

    if (!skillId && !req.body.skillName) {
      res.status(400).json({ success: false, error: 'Skill ID or Skill Name is required' })
      return
    }

    let actualSkillId = skillId
    if (skillId === '00000000-0000-0000-0000-000000000000' && req.body.skillName) {
      const authReq = req as any
      const userId = authReq.userId!
      const { CandidateProfileRepository } = await import('../repositories/candidateProfileRepository.js')
      const repo = new CandidateProfileRepository()
      const profile = await repo.getProfileByUserId(userId)
      if (profile) {
        const { query } = await import('../db/index.js')
        const { rows } = await query(
          `INSERT INTO candidate_skills (profile_id, skill_name, proficiency_score, is_verified)
           VALUES ($1, $2, 0, false)
           RETURNING skill_id`,
          [profile.profile_id, req.body.skillName]
        )
        actualSkillId = rows[0].skill_id
      }
    }

    if (actualSkillId === '00000000-0000-0000-0000-000000000000') {
      res.status(400).json({ success: false, error: 'Valid Skill ID or Skill Name is required' })
      return
    }

    if (req.file) {
      const file = req.file
      if (file.size > 10 * 1024 * 1024) {
        res.status(400).json({ success: false, error: 'File size exceeds 10MB limit' })
        return
      }

      const { saveFile } = await import('../utils/storage.js')
      const path = await import('path')
      const crypto = await import('crypto')

      const safeExt = path.extname(file.originalname).toLowerCase() || '.pdf'
      const uniqueId = crypto.randomBytes(16).toString('hex')
      const authReq = req as any
      const userId = authReq.userId || 'unknown'
      const filename = `certificates/${userId}/${uniqueId}${safeExt}`

      const fileUrl = await saveFile(filename, file.buffer)
      const publicBaseUrl =
        process.env.PUBLIC_APP_URL ||
        process.env.FRONTEND_URL ||
        `${req.protocol}://${req.get('host')}`
      certificateUrl = fileUrl.startsWith('http')
        ? fileUrl
        : `${publicBaseUrl.replace(/\/$/, '')}/storage/${filename}`
    }

    if (!certificateUrl) {
      res.status(400).json({ success: false, error: 'Certificate URL or file is required' })
      return
    }

    const approval = await certRepo.submitForApproval(actualSkillId, certificateUrl)
    
    // Notify admins
    try {
      const { query } = await import('../db/index.js');
      const { rows: admins } = await query(`SELECT email FROM users WHERE role IN ('admin', 'superadmin')`);
      const authReq = req as any;
      const userId = authReq.userId;
      const { rows: userRows } = await query(`SELECT name FROM users WHERE user_id = $1`, [userId]);
      const candidateName = userRows[0]?.name || 'A candidate';
      const frontendUrl = process.env.FRONTEND_URL || 'https://optiohire.com';
      
      const { EmailService } = await import('../services/emailService.js');
      const emailService = new EmailService();
      
      for (const admin of admins) {
        emailService.sendAdminUploadNotificationEmail({
          adminEmail: admin.email,
          candidateName,
          documentType: 'Certificate',
          dashboardLink: `${frontendUrl}/admin/certificates`
        }).catch((err: any) => console.warn('Failed to send admin notification for certificate upload', err));
      }
    } catch (err) {
      console.warn('Failed to send admin notification for certificate upload', err);
    }
    
    res.status(201).json({
      success: true,
      message: 'Certificate submitted for admin review.',
      approval
    })
  } catch (error: any) {
    console.error('Error uploading certificate:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const onboardProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    
    try {
      await ensureCandidateFeatureTables()
    } catch (e) {
      console.warn('ensureCandidateFeatureTables error:', e)
    }

    const { bio, jobCategory } = req.body
    
    let profile = await candidateRepo.getProfileByUserId(userId)
    if (!profile) {
      profile = await candidateRepo.createProfile(userId)
    }


    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {}
    
    const uploadSingleFile = async (fileArray: Express.Multer.File[] | undefined, folder: string) => {
      if (!fileArray || fileArray.length === 0) return null
      const file = fileArray[0]
      const safeExt = path.extname(file.originalname).toLowerCase() || '.pdf'
      const uniqueId = crypto.randomBytes(16).toString('hex')
      const filename = `candidate_docs/${userId}/${folder}/${uniqueId}${safeExt}`
      const fileUrl = await saveFile(filename, file.buffer)
      const publicBaseUrl = process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`
      return fileUrl.startsWith('http') ? fileUrl : `${publicBaseUrl.replace(/\/$/, '')}/storage/${filename}`
    }

    const cvUrl = await uploadSingleFile(files['cv'], 'cv')
    const coverLetterUrl = await uploadSingleFile(files['coverLetter'], 'cover_letters')
    const recommendationLetterUrl = await uploadSingleFile(files['recommendationLetter'], 'recommendations')

    // Initial Scoring Logic
    let score = profile.total_score || 0
    if (bio && !profile.bio) score += 10
    if (jobCategory && !profile.job_category) score += 10
    if (cvUrl && !profile.cv_url) score += 30
    if (coverLetterUrl && !profile.cover_letter_url) score += 10
    if (recommendationLetterUrl && !profile.recommendation_letter_url) score += 10

    const updatedProfile = await candidateRepo.updateProfileOnboarding(profile.profile_id, {
      bio,
      job_category: jobCategory,
      cv_url: cvUrl || undefined,
      cover_letter_url: coverLetterUrl || undefined,
      recommendation_letter_url: recommendationLetterUrl || undefined
    })

    await candidateRepo.setInitialAlternativeScore(profile.profile_id, score)
    updatedProfile.total_score = score

    // Trigger AI background parsing and Talent Pool Sync
    if (cvUrl || bio) {
      try {
        const { rows: userRows } = await query('SELECT email, name FROM users WHERE user_id = $1', [userId])
        if (userRows.length > 0) {
          const { aiQueue } = await import('../queues/aiQueue.js')
          await aiQueue.add('parse-candidate-profile', { 
            profileId: profile.profile_id, 
            userId, 
            cvUrl: cvUrl || profile.cv_url, 
            bio: bio || profile.bio, 
            jobCategory: jobCategory || profile.job_category,
            email: userRows[0].email,
            name: userRows[0].name
          })

          // Notify admins of new profile document upload
          if (cvUrl || coverLetterUrl || recommendationLetterUrl) {
            const { EmailService } = await import('../services/emailService.js')
            const emailService = new EmailService()
            const frontendUrl = process.env.FRONTEND_URL || 'https://optiohire.com'
            const { rows: admins } = await query("SELECT email FROM users WHERE role = 'admin' AND is_active = true")
            
            for (const admin of admins) {
              emailService.sendAdminUploadNotificationEmail({
                adminEmail: admin.email,
                candidateName: userRows[0].name || userRows[0].email.split('@')[0],
                documentType: 'Profile Documents (CV/Cover Letter/Rec Letter)',
                dashboardLink: `${frontendUrl}/admin/candidates`
              }).catch(err => console.warn('Failed to send admin notification for profile upload', err))
            }
          }
        }
      } catch (err) {
        console.warn('Failed to enqueue parse-candidate-profile job or notify admins', err)
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile onboarding completed successfully. Parsing is queued.',
      profile: updatedProfile
    })
  } catch (error: any) {
    console.error('Error onboarding profile:', error)
    res.status(500).json({ success: false, error: 'Internal server error', details: String(error.stack || error.message || error) })
  }
}

export const alumniUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    const { newSkills, projects } = req.body
    
    let profile = await candidateRepo.getProfileByUserId(userId)
    if (!profile) {
      res.status(404).json({ success: false, error: 'Candidate profile not found' })
      return
    }

    const { saveFile } = await import('../utils/storage.js')
    const path = await import('path')
    const crypto = await import('crypto')

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {}
    
    const uploadSingleFile = async (fileArray: Express.Multer.File[] | undefined, folder: string) => {
      if (!fileArray || fileArray.length === 0) return null
      const file = fileArray[0]
      const safeExt = path.extname(file.originalname).toLowerCase() || '.pdf'
      const uniqueId = crypto.randomBytes(16).toString('hex')
      const filename = `candidate_docs/${userId}/${folder}/${uniqueId}${safeExt}`
      const fileUrl = await saveFile(filename, file.buffer)
      const publicBaseUrl = process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`
      return fileUrl.startsWith('http') ? fileUrl : `${publicBaseUrl.replace(/\/$/, '')}/storage/${filename}`
    }

    const cvUrl = await uploadSingleFile(files['cv'], 'cv')
    
    // Parse projects
    let parsedProjects = []
    if (projects) {
      try {
        parsedProjects = JSON.parse(projects)
      } catch (e) {
        // Handle invalid JSON
      }
    }

    // Parse new skills and update them if needed (here we might just add to candidate_skills but let's keep it simple and just do the profile update)
    let parsedSkills = []
    if (newSkills) {
      try {
        parsedSkills = JSON.parse(newSkills)
      } catch (e) {
        // Handle invalid JSON
      }
    }

    // Add +50 Alumni Bonus and score for new skills and projects
    let score = profile.total_score || 0
    score += 50 // Alumni Bonus
    score += parsedSkills.length * 5 // +5 points per new skill
    score += parsedProjects.length * 10 // +10 points per new project

    const updatedProfile = await candidateRepo.updateProfileAlumni(profile.profile_id, {
      cv_url: cvUrl || undefined,
      metadata_projects: parsedProjects.length > 0 ? parsedProjects : undefined
    })

    await candidateRepo.setInitialAlternativeScore(profile.profile_id, score)
    updatedProfile.total_score = score

    res.status(200).json({
      success: true,
      message: 'Alumni profile updated successfully.',
      profile: updatedProfile
    })
  } catch (error: any) {
    console.error('Error updating alumni profile:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const getProfileSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    const { rows: userRows } = await query<{ user_id: string; name: string | null; email: string }>(
      `SELECT user_id, name, email FROM users WHERE user_id = $1 LIMIT 1`,
      [userId]
    )
    if (userRows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }

    let profile = await candidateRepo.getProfileByUserId(userId)
    if (!profile) {
      profile = await candidateRepo.createProfile(userId)
      profile = await candidateRepo.getProfileByUserId(userId)
    }

    const metadata = profile?.metadata || {}
    const skills = profile ? await candidateRepo.getSkills(profile.profile_id) : []
    res.status(200).json({
      success: true,
      settings: {
        name: userRows[0].name || '',
        email: userRows[0].email,
        universityId: profile?.university_id || null,
        university: profile?.university || null,
        linkedinUrl: metadata.linkedin_url || '',
        githubUrl: metadata.github_url || '',
        portfolioUrl: metadata.portfolio_url || '',
        avatarUrl: metadata.avatar_url || '',
        jobCategory: profile?.job_category || '',
        targetRoleCount: Number(metadata.target_role_count) || 0,
        targetRoles: Array.isArray(metadata.target_roles) ? metadata.target_roles : [],
        skills: skills.map((s) => ({
          name: s.skill_name,
          score: s.proficiency_score,
          verified: s.is_verified,
        })),
      },
    })
  } catch (error: any) {
    console.error('Error loading profile settings:', error)
    res.status(500).json({ success: false, error: 'Failed to load profile settings' })
  }
}

export const updateProfileSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    const {
      name, universityId, linkedinUrl, githubUrl, portfolioUrl, avatarUrl,
      jobCategory, targetRoleCount, targetRoles,
    } = req.body || {}

    if (name !== undefined && typeof name !== 'string') {
      res.status(400).json({ success: false, error: 'Invalid name' })
      return
    }

    if (targetRoleCount !== undefined) {
      const n = Number(targetRoleCount)
      if (!Number.isFinite(n) || n < 0 || n > 20) {
        res.status(400).json({ success: false, error: 'targetRoleCount must be between 0 and 20' })
        return
      }
    }

    if (targetRoles !== undefined && !Array.isArray(targetRoles)) {
      res.status(400).json({ success: false, error: 'targetRoles must be an array' })
      return
    }

    if (universityId) {
      const { rows: uniRows } = await query(
        `SELECT university_id FROM universities WHERE university_id = $1 AND is_active = true AND country = 'KE'`,
        [universityId]
      )
      if (uniRows.length === 0) {
        res.status(400).json({ success: false, error: 'Invalid university selected' })
        return
      }
    }

    let profile = await candidateRepo.getProfileByUserId(userId)
    if (!profile) {
      profile = await candidateRepo.createProfile(userId)
    }

    if (name !== undefined) {
      await query(`UPDATE users SET name = $2, updated_at = NOW() WHERE user_id = $1`, [userId, name.trim() || null])
    }

    const normalizedRoles = Array.isArray(targetRoles)
      ? targetRoles.slice(0, 20).map((r: any) => ({
          id: String(r.id || r.slug || '').trim(),
          title: String(r.title || r.label || '').trim(),
          group: r.group || r.group_name || null,
        })).filter((r: any) => r.id && r.title)
      : undefined

    if (normalizedRoles && targetRoleCount !== undefined && normalizedRoles.length > Number(targetRoleCount)) {
      res.status(400).json({
        success: false,
        error: `You set ${targetRoleCount} target roles but selected ${normalizedRoles.length}. Reduce selections or increase the count.`,
      })
      return
    }

    const primaryCategory = jobCategory !== undefined
      ? (jobCategory || null)
      : (normalizedRoles?.[0]?.title || undefined)

    const updatedProfile = await candidateRepo.updateProfileSettings(profile.profile_id, {
      university_id: universityId !== undefined ? (universityId || null) : undefined,
      linkedin_url: linkedinUrl !== undefined ? (linkedinUrl || null) : undefined,
      github_url: githubUrl !== undefined ? (githubUrl || null) : undefined,
      portfolio_url: portfolioUrl !== undefined ? (portfolioUrl || null) : undefined,
      avatar_url: avatarUrl !== undefined ? (avatarUrl || null) : undefined,
      job_category: primaryCategory,
      target_role_count: targetRoleCount !== undefined ? Number(targetRoleCount) : undefined,
      target_roles: normalizedRoles,
    })

    try {
      await cache.del(cacheKeys.user(userId))
    } catch {
      // ignore cache failures
    }

    const metadata = updatedProfile.metadata || {}
    const { rows: userRows } = await query<{ name: string | null; email: string }>(
      `SELECT name, email FROM users WHERE user_id = $1`,
      [userId]
    )
    const skills = await candidateRepo.getSkills(updatedProfile.profile_id)

    res.status(200).json({
      success: true,
      message: 'Profile settings saved',
      settings: {
        name: userRows[0]?.name || '',
        email: userRows[0]?.email || '',
        universityId: updatedProfile.university_id,
        university: updatedProfile.university || null,
        linkedinUrl: metadata.linkedin_url || '',
        githubUrl: metadata.github_url || '',
        portfolioUrl: metadata.portfolio_url || '',
        avatarUrl: metadata.avatar_url || '',
        jobCategory: updatedProfile.job_category || '',
        targetRoleCount: Number(metadata.target_role_count) || 0,
        targetRoles: Array.isArray(metadata.target_roles) ? metadata.target_roles : [],
        skills: skills.map((s) => ({
          name: s.skill_name,
          score: s.proficiency_score,
          verified: s.is_verified,
        })),
      },
    })
  } catch (error: any) {
    console.error('Error updating profile settings:', error)
    res.status(500).json({ success: false, error: 'Failed to save profile settings' })
  }
}

/**
 * POST /api/candidate/profile/suggest-roles
 * Suggests roles from the catalog based on candidate skills (+ optional AI ranking).
 */
export const suggestTargetRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    const requestedCount = Math.min(10, Math.max(1, Number(req.body?.count || 3)))

    let profile = await candidateRepo.getProfileByUserId(userId)
    if (!profile) profile = await candidateRepo.createProfile(userId)

    const skills = await candidateRepo.getSkills(profile.profile_id)
    let skillNames = skills.map((s) => s.skill_name).filter(Boolean)

    // Fallback: talent_pool / metadata
    if (skillNames.length === 0) {
      const meta = profile.metadata || {}
      if (Array.isArray(meta.skills)) skillNames = meta.skills.map(String)
      if (Array.isArray(meta.parsed_cv?.skills)) {
        skillNames = [...skillNames, ...meta.parsed_cv.skills.map(String)]
      }
      try {
        const { rows } = await query<{ skills: string[] }>(
          `SELECT skills FROM talent_pool WHERE lower(email) = (SELECT lower(email) FROM users WHERE user_id = $1) LIMIT 1`,
          [userId]
        )
        if (rows[0]?.skills?.length) skillNames = [...skillNames, ...rows[0].skills]
      } catch { /* ignore */ }
    }

    skillNames = Array.from(new Set(skillNames.map((s) => s.trim()).filter(Boolean)))

    await query(`
      CREATE TABLE IF NOT EXISTS job_roles (
        role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        group_name TEXT,
        keywords TEXT[] NOT NULL DEFAULT '{}',
        related_skills TEXT[] NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`)

    const { rows: roleCount } = await query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM job_roles`)
    if (Number(roleCount[0]?.n || 0) === 0) {
      const { SKILL_TAXONOMY } = await import('../lib/skillTaxonomy.js')
      for (const cat of SKILL_TAXONOMY) {
        const keywords = Array.from(new Set([...(cat.keywords || []), cat.label, ...cat.skills.slice(0, 5)]))
        await query(
          `INSERT INTO job_roles (slug, title, group_name, keywords, related_skills)
           VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO NOTHING`,
          [cat.id, cat.label, cat.group, keywords, cat.skills]
        )
      }
    }

    // Score roles by skill / keyword overlap
    const { rows: allRoles } = await query(
      `SELECT slug, title, group_name, keywords, related_skills FROM job_roles WHERE is_active`
    )

    const skillLower = skillNames.map((s) => s.toLowerCase())
    const scored = allRoles.map((r: any) => {
      const hay = [
        r.title,
        ...(r.keywords || []),
        ...(r.related_skills || []),
      ].map((x: string) => String(x).toLowerCase())
      let score = 0
      for (const sk of skillLower) {
        for (const h of hay) {
          if (h.includes(sk) || sk.includes(h) || h.split(/[^a-z0-9]+/).includes(sk)) score += 2
        }
      }
      if (profile.job_category && String(r.title).toLowerCase().includes(String(profile.job_category).toLowerCase())) {
        score += 3
      }
      return {
        id: r.slug,
        title: r.title,
        group: r.group_name,
        relatedSkills: r.related_skills || [],
        score,
      }
    }).filter((r) => r.score > 0 || skillNames.length === 0)
      .sort((a, b) => b.score - a.score)

    let suggestions = scored.slice(0, requestedCount)

    // If few skill matches, fill from popular Software & IT / default groups
    if (suggestions.length < requestedCount) {
      const fillers = allRoles
        .filter((r: any) => !suggestions.some((s) => s.id === r.slug))
        .slice(0, requestedCount - suggestions.length)
        .map((r: any) => ({
          id: r.slug,
          title: r.title,
          group: r.group_name,
          relatedSkills: r.related_skills || [],
          score: 0,
        }))
      suggestions = [...suggestions, ...fillers]
    }

    // Optional AI re-rank / explain
    let aiNote: string | null = null
    try {
      const { openRouterService } = await import('../services/ai/openRouterService.js')
      if (openRouterService.isAvailable() && skillNames.length > 0) {
        const catalog = suggestions.map((s) => s.title).join(', ')
        const prompt = `A job seeker has these skills: ${skillNames.slice(0, 20).join(', ')}.
They want to pursue approximately ${requestedCount} target role(s).
From this catalog shortlist: ${catalog}.
Reply with 1 short encouragement sentence (max 40 words) explaining why these roles fit. No bullet list.`
        aiNote = await openRouterService.generateText(prompt, undefined, {
          temperature: 0.5,
          maxTokens: 120,
          systemPrompt: 'You are an OptioHire career coach for Kenyan graduates. Be concrete and brief.',
        })
      }
    } catch {
      aiNote = null
    }

    res.status(200).json({
      success: true,
      count: requestedCount,
      skillsUsed: skillNames.slice(0, 30),
      suggestions: suggestions.slice(0, requestedCount).map(({ id, title, group, relatedSkills, score }) => ({
        id, title, group, relatedSkills: relatedSkills.slice(0, 8), matchScore: score,
      })),
      aiNote,
    })
  } catch (error: any) {
    console.error('suggestTargetRoles error:', error)
    res.status(500).json({ success: false, error: 'Failed to suggest roles' })
  }
}
