import { Request, Response } from 'express'
import { query } from '../db/index.js'
import { CandidateProfileRepository } from '../repositories/candidateProfileRepository.js'
import { CertificateRepository } from '../repositories/certificateRepository.js'
import { SkillAnalysisService } from '../services/ai/skillAnalysisService.js'
import { LearningRoadmapService } from '../services/ai/learningRoadmapService.js'

const candidateRepo = new CandidateProfileRepository()
const certRepo = new CertificateRepository()
const skillAnalysisService = new SkillAnalysisService()
const roadmapService = new LearningRoadmapService()

function isMissingRelation(error: any): boolean {
  return error?.code === '42P01' || String(error?.message || '').includes('does not exist')
}

async function ensureCandidateFeatureTables() {
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
      level text,
      overall_score integer NOT NULL DEFAULT 0,
      clarity_score integer NOT NULL DEFAULT 0,
      relevance_score integer NOT NULL DEFAULT 0,
      depth_score integer NOT NULL DEFAULT 0,
      feedback text,
      recommendations jsonb DEFAULT '[]'::jsonb,
      transcript jsonb DEFAULT '[]'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_candidate_interview_sessions_profile ON candidate_interview_sessions(profile_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_candidate_interview_sessions_created ON candidate_interview_sessions(created_at DESC)`)
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

export const getCandidateDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    
    // Get or create profile
    let profile = await candidateRepo.getProfileByUserId(userId)
    if (!profile) {
      profile = await candidateRepo.createProfile(userId)
    }
    await ensureCandidateFeatureTables()

    // Get skills
    const skills = await candidateRepo.getSkills(profile.profile_id)
    
    // Get recommendations
    await skillAnalysisService.matchJobsToCandidate(profile.profile_id)
    const recommendations = await candidateRepo.getRecommendations(profile.profile_id)
    
    // Get missing skills analysis
    const gapAnalysis = await skillAnalysisService.getSkillGapRecommendations(profile.profile_id)

    res.status(200).json({
      success: true,
      data: {
        profile,
        skills,
        recommendations,
        gapAnalysis,
        missions: await ensureCandidateMissions(profile.profile_id, gapAnalysis),
        interviewSessions: await getInterviewSessions(profile.profile_id)
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
    await ensureCandidateFeatureTables()

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

export const submitMockInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    const { interviewType = 'Behavioural', targetRole = null, level = 'Mid-level', answers = [] } = req.body || {}
    const profile = await candidateRepo.getProfileByUserId(userId) || await candidateRepo.createProfile(userId)
    await ensureCandidateFeatureTables()
    const cleanAnswers = Array.isArray(answers) ? answers.map(String) : []
    const report = scoreInterviewAnswers(cleanAnswers)
    const transcript = cleanAnswers.map((answer, index) => ({ question: index + 1, answer }))

    let session: any = {
      session_id: null,
      profile_id: profile.profile_id,
      interview_type: interviewType,
      target_role: targetRole,
      level,
      overall_score: report.overall,
      clarity_score: report.clarity,
      relevance_score: report.relevance,
      depth_score: report.depth,
      feedback: report.feedback,
      recommendations: report.recommendations,
      transcript,
      created_at: new Date().toISOString(),
    }

    try {
      const { rows } = await query(
        `INSERT INTO candidate_interview_sessions
          (profile_id, interview_type, target_role, level, overall_score, clarity_score, relevance_score, depth_score, feedback, recommendations, transcript)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          profile.profile_id,
          interviewType,
          targetRole,
          level,
          report.overall,
          report.clarity,
          report.relevance,
          report.depth,
          report.feedback,
          JSON.stringify(report.recommendations),
          JSON.stringify(transcript),
        ]
      )
      session = rows[0]
      await query(
        `UPDATE candidate_profiles SET total_score = total_score + $2 WHERE profile_id = $1`,
        [profile.profile_id, report.overall >= 80 ? 20 : 10]
      )
    } catch (error: any) {
      if (!isMissingRelation(error)) throw error
    }

    res.status(201).json({ success: true, session })
  } catch (error: any) {
    console.error('Error submitting mock interview:', error)
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

    const roadmapHtml = await roadmapService.generateRoadmap(skillName)
    res.status(200).json({ success: true, html: roadmapHtml })
  } catch (error: any) {
    console.error('Error generating roadmap:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const uploadCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skillId } = req.body
    let certificateUrl = req.body.certificateUrl

    if (!skillId) {
      res.status(400).json({ success: false, error: 'Skill ID is required' })
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

    const approval = await certRepo.submitForApproval(skillId, certificateUrl)
    
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
