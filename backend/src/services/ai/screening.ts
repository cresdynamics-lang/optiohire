type ParsedResume = {
  skills?: string[]
  experience?: Array<{ company?: string; role?: string; summary?: string }>
  textContent?: string
  note?: string
  links?: Record<string, unknown>
  [key: string]: unknown
}

type JobRequirements = {
  jobTitle: string
  description: string
  responsibilities: string
  skills: string[]
}

function normalizeToken(t: string): string {
  return t
    .toLowerCase()
    .replace(/\.(js|ts|tsx|jsx)$/i, '')
    .trim()
}

/** Haystack: resume text + skills array + experience summaries + note + stringified links */
function buildResumeHaystack(parsed: ParsedResume): string {
  const parts: string[] = []
  if (parsed.textContent) parts.push(String(parsed.textContent))
  if (parsed.note) parts.push(String(parsed.note))
  if (Array.isArray(parsed.skills)) parts.push(parsed.skills.join(' '))
  if (Array.isArray(parsed.experience)) {
    for (const e of parsed.experience) {
      if (e?.summary) parts.push(String(e.summary))
      if (e?.role) parts.push(String(e.role))
      if (e?.company) parts.push(String(e.company))
    }
  }
  try {
    parts.push(JSON.stringify(parsed.links || {}))
  } catch {
    /* ignore */
  }
  return parts.join('\n').toLowerCase()
}

function skillMatchStrength(haystack: string, skillPhrase: string): number {
  const phrase = skillPhrase.toLowerCase().trim()
  if (!phrase) return 0
  if (haystack.includes(phrase)) return 1
  const tokens = phrase
    .split(/[/,]+|\s+/)
    .map(normalizeToken)
    .filter((t) => t.length >= 2)
  if (tokens.length === 0) return 0
  let hits = 0
  for (const t of tokens) {
    if (t.length >= 3 && haystack.includes(t)) hits++
  }
  if (hits === tokens.length) return 1
  if (hits > 0) return 0.5 + (0.5 * hits) / tokens.length
  return 0
}

function jobTextOverlap(haystack: string, job: JobRequirements): number {
  const blob = `${job.description || ''}\n${job.responsibilities || ''}\n${job.jobTitle || ''}`.toLowerCase()
  const words = blob.split(/[^a-z0-9+]+/i).filter((w) => w.length > 5)
  const unique = Array.from(new Set(words)).slice(0, 60)
  let n = 0
  for (const w of unique) {
    if (haystack.includes(w)) n++
  }
  return n
}

/**
 * Heuristic screening when full AI pipeline is unavailable (e.g. cron batch).
 * Uses full parsed payload + fuzzy skills + job-text overlap — not only parsed.skills[].
 */
export async function scoreCandidate(
  parsed: ParsedResume,
  job: JobRequirements
): Promise<{ score: number; status: 'SHORTLIST' | 'FLAG' | 'REJECT'; reasoning: string }> {
  const haystack = buildResumeHaystack(parsed)
  const required = (job.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean)

  let weighted = 0
  for (const skill of required) {
    weighted += skillMatchStrength(haystack, skill)
  }
  const skillCoverage = required.length ? weighted / required.length : 0.5

  const overlap = jobTextOverlap(haystack, job)
  const overlapBoost = Math.min(0.15, overlap * 0.004)

  const hasExp = Array.isArray(parsed.experience) && parsed.experience.length > 0
  const expWeight = hasExp ? 0.12 : 0.04

  const thin = haystack.trim().length < 500
  const thinPenalty = thin ? -0.06 : 0

  let score = Math.round((skillCoverage * 0.62 + overlapBoost + expWeight + thinPenalty) * 100)
  score = Math.max(0, Math.min(100, score))

  // Thin applications: avoid harsh reject if any plausible signal
  if (thin && score >= 38 && score < 50 && (overlap >= 3 || skillCoverage >= 0.25)) {
    score = 50
  }

  let status: 'SHORTLIST' | 'FLAG' | 'REJECT'
  if (score >= 80) status = 'SHORTLIST'
  else if (score >= 50) status = 'FLAG'
  else status = 'REJECT'

  const strong = required.filter((s) => skillMatchStrength(haystack, s) >= 0.85).length
  const partial = required.filter((s) => {
    const m = skillMatchStrength(haystack, s)
    return m >= 0.35 && m < 0.85
  }).length

  const reasoning = `Heuristic match: weighted skill coverage ${Math.round(skillCoverage * 100)}% vs ${required.length} listed skills (${strong} strong / ${partial} partial overlaps). Job-description keyword overlap: ${overlap}. ${thin ? 'Limited structured resume data — scores favor human review.' : ''}`

  return { score, status, reasoning }
}
