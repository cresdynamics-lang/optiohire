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
   */
  async getSkillGapRecommendations(profileId: string): Promise<any> {
    // Get candidate's current skills
    const candidateSkills = await this.candidateRepo.getSkills(profileId)
    const candidateSkillNames = candidateSkills.map(s => s.skill_name.toLowerCase())

    // Fetch some active jobs (e.g. latest 20)
    // Normally this would be a more complex ML match, but we use a simpler database + AI prompt approach
    const { rows: jobs } = await query(`
      SELECT job_posting_id, job_title, skills_required 
      FROM job_postings 
      WHERE status = 'ACTIVE' 
      ORDER BY created_at DESC 
      LIMIT 20
    `)

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

    // Use AI to generate a quick insight reason why this skill is needed
    const prompt = `
      A candidate is missing the skill "${topMissingSkill}" which appeared in ${missingSkills[0].count} recent job postings.
      Write a short, encouraging 2-sentence paragraph telling them why learning this skill will massively boost their chances of getting hired, and suggesting they start learning it today.
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
