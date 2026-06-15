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

export const onboardProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId!
    const { bio, jobCategory } = req.body
    
    let profile = await candidateRepo.getProfileByUserId(userId)
    if (!profile) {
      profile = await candidateRepo.createProfile(userId)
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

    res.status(200).json({
      success: true,
      message: 'Profile onboarding completed successfully.',
      profile: updatedProfile
    })
  } catch (error: any) {
    console.error('Error onboarding profile:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
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
