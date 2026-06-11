import { query } from '../../db/index.js'
import { openRouterService } from './openRouterService.js'
import { JobPostingRepository } from '../../repositories/jobPostingRepository.js'
import { CandidateProfileRepository } from '../../repositories/candidateProfileRepository.js'

export class SkillAnalysisService {
  private jobRepo = new JobPostingRepository()
  private candidateRepo = new CandidateProfileRepository()

  private parseSkills(value: any): string[] {
    if (!value) return []
    if (Array.isArray(value)) return value.map(String).filter(Boolean)
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
      } catch {}
      return value
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
    }
    return []
  }

  /**
   * Analyzes active jobs to find the most common skills that the candidate is missing.
   * Prioritizes jobs the candidate has applied to or matched with.
   */
  async getSkillGapRecommendations(profileId: string): Promise<any> {
    // Get candidate's current skills
    const candidateSkills = await this.candidateRepo.getSkills(profileId)
    const candidateSkillNames = candidateSkills.map(s => s.skill_name.toLowerCase())

    // Fetch jobs relevant to the candidate (applied or recommended)
    let { rows: jobs } = await query(`
      SELECT j.job_posting_id, j.job_title, j.skills_required
      FROM job_postings j
      LEFT JOIN job_applications a ON a.job_posting_id = j.job_posting_id 
        AND a.candidate_id = (SELECT candidate_id FROM candidate_profiles WHERE profile_id = $1)
      LEFT JOIN job_recommendations r ON r.job_posting_id = j.job_posting_id 
        AND r.profile_id = $1
      WHERE j.status = 'ACTIVE' 
        AND (a.application_id IS NOT NULL OR r.recommendation_id IS NOT NULL)
      ORDER BY j.created_at DESC
      LIMIT 20
    `, [profileId])

    // Fallback to recent active jobs if no relevant jobs found
    if (jobs.length === 0) {
      const { rows: activeJobs } = await query(`
        SELECT job_posting_id, job_title, skills_required 
        FROM job_postings 
        WHERE status = 'ACTIVE' 
        ORDER BY created_at DESC 
        LIMIT 20
      `)
      jobs = activeJobs
    }

    // Count skills from jobs
    const skillCounts: Record<string, number> = {}
    for (const job of jobs) {
      const reqSkills = this.parseSkills(job.skills_required)
      
      for (const skill of reqSkills) {
        const s = skill.trim().toLowerCase()
        if (!candidateSkillNames.includes(s)) {
          skillCounts[s] = (skillCounts[s] || 0) + 1
        }
      }
    }

    // Sort missing skills by frequency
    const missingSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    if (missingSkills.length === 0) {
      return { recommendations: [], topMissingSkill: null }
    }

    const topMissingSkill = missingSkills[0].skill
    const jobTitles = jobs.map(j => j.job_title).slice(0, 3).join(', ')

    // Use AI to generate a highly personalized insight reason
    const prompt = `
      A candidate is interested in roles like ${jobTitles || 'various tech roles'}. 
      Based on their profile, they are missing the skill "${topMissingSkill}" which is highly requested in these roles.
      Write a highly personalized, short, encouraging 2-sentence paragraph telling them why learning "${topMissingSkill}" will massively boost their chances of getting hired for roles like ${jobTitles}, and suggesting they start learning it today. Avoid generic corporate speak. Be specific about the impact in their field.
    `
    const insight = await openRouterService.generateText(prompt)

    return {
      topMissingSkill,
      insight: insight.trim(),
      allMissingSkills: missingSkills
    }
  }

  /**
   * AI-based job match score calculation
   */
  async matchJobsToCandidate(profileId: string): Promise<void> {
    const candidateSkills = await this.candidateRepo.getSkills(profileId)
    if (candidateSkills.length === 0) return // Cannot match without skills

    const candidateSkillNames = candidateSkills.map(s => s.skill_name.toLowerCase())

    // Fetch active jobs
    const { rows: jobs } = await query(`
      SELECT job_posting_id, job_title, skills_required
      FROM job_postings 
      WHERE UPPER(COALESCE(status, 'ACTIVE')) = 'ACTIVE'
        AND (application_deadline IS NULL OR application_deadline::date >= CURRENT_DATE)
      ORDER BY created_at DESC
      LIMIT 100
    `)

    for (const job of jobs) {
      const reqSkills = this.parseSkills(job.skills_required)
      
      let matchCount = 0
      const missing: string[] = []
      
      for (const skill of reqSkills) {
        if (candidateSkillNames.includes(skill.toLowerCase())) {
          matchCount++
        } else {
          missing.push(skill)
        }
      }

      const totalReq = reqSkills.length || 1
      const matchScore = Math.round((matchCount / totalReq) * 100)

      if (matchScore >= 50) {
        // High enough match, save recommendation
        const reason = `You are a ${matchScore}% match for this role because you possess ${matchCount} out of the ${totalReq} required skills.`
        await query(`
          INSERT INTO job_recommendations (profile_id, job_posting_id, match_score, match_reason, missing_skills)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (profile_id, job_posting_id) DO UPDATE SET
            match_score = EXCLUDED.match_score,
            match_reason = EXCLUDED.match_reason,
            missing_skills = EXCLUDED.missing_skills
        `, [profileId, job.job_posting_id, matchScore, reason, JSON.stringify(missing)])
      }
    }
  }
}
