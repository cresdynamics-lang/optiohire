import { query } from '../db/index.js'

export interface CandidateProfile {
  profile_id: string
  user_id: string
  total_score: number
  active_learning_path: string | null
  metadata: any
  bio: string | null
  job_category: string | null
  cv_url: string | null
  cover_letter_url: string | null
  recommendation_letter_url: string | null
  university_id: string | null
  is_returning: boolean
  created_at: string
  updated_at: string
  university?: {
    university_id: string
    name: string
    short_name: string | null
    type: string
  } | null
}

export interface CandidateSkill {
  skill_id: string
  profile_id: string
  skill_name: string
  proficiency_score: number
  is_verified: boolean
  verified_at: string | null
  certificate_url: string | null
  created_at: string
  updated_at: string
  certificate_status?: string | null
  certificate_rejection_reason?: string | null
}

export interface JobRecommendation {
  recommendation_id: string
  profile_id: string
  job_posting_id: string
  match_score: number
  match_reason: string | null
  missing_skills: any
  created_at: string
}

export class CandidateProfileRepository {
  async getProfileByUserId(userId: string): Promise<CandidateProfile | null> {
    try {
      const { rows } = await query<CandidateProfile & {
        university_name?: string | null
        university_short_name?: string | null
        university_type?: string | null
      }>(
        `SELECT cp.*,
                u.name AS university_name,
                u.short_name AS university_short_name,
                u.type AS university_type
         FROM candidate_profiles cp
         LEFT JOIN universities u ON u.university_id = cp.university_id
         WHERE cp.user_id = $1
         LIMIT 1`,
        [userId]
      )
      if (!rows[0]) return null
      const row = rows[0]
      return {
        ...row,
        university: row.university_id
          ? {
              university_id: row.university_id,
              name: row.university_name || '',
              short_name: row.university_short_name ?? null,
              type: row.university_type || 'public',
            }
          : null,
      }
    } catch (err: any) {
      if (err?.code === '42P01' || err?.code === '42703') {
        const { rows } = await query<CandidateProfile>(
          `SELECT * FROM candidate_profiles WHERE user_id = $1 LIMIT 1`,
          [userId]
        )
        return rows[0] || null
      }
      throw err
    }
  }

  async createProfile(userId: string): Promise<CandidateProfile> {
    const { rows } = await query<CandidateProfile>(
      `INSERT INTO candidate_profiles (user_id, total_score)
       VALUES ($1, 0)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [userId]
    )
    return rows[0]
  }

  async getSkills(profileId: string): Promise<CandidateSkill[]> {
    const { rows } = await query<CandidateSkill>(
      `SELECT cs.*, 
              ca.status AS certificate_status, 
              ca.rejection_reason AS certificate_rejection_reason
       FROM candidate_skills cs
       LEFT JOIN (
           SELECT DISTINCT ON (skill_id) *
           FROM certificate_approvals
           ORDER BY skill_id, submitted_at DESC
       ) ca ON cs.skill_id = ca.skill_id
       WHERE cs.profile_id = $1 
       ORDER BY cs.proficiency_score DESC`,
      [profileId]
    )
    return rows
  }

  async addSkill(profileId: string, skillName: string, score: number = 0): Promise<CandidateSkill> {
    const { rows } = await query<CandidateSkill>(
      `INSERT INTO candidate_skills (profile_id, skill_name, proficiency_score)
       VALUES ($1, $2, $3)
       ON CONFLICT (profile_id, skill_name) DO UPDATE SET
         proficiency_score = EXCLUDED.proficiency_score,
         updated_at = NOW()
       RETURNING *`,
      [profileId, skillName, score]
    )
    return rows[0]
  }

  async updateSkillScore(skillId: string, additionalScore: number, isVerified: boolean = false, certificateUrl: string | null = null): Promise<CandidateSkill> {
    const { rows } = await query<CandidateSkill>(
      `UPDATE candidate_skills
       SET proficiency_score = proficiency_score + $2,
           is_verified = $3,
           verified_at = CASE WHEN $3 = true THEN NOW() ELSE verified_at END,
           certificate_url = COALESCE($4, certificate_url),
           updated_at = NOW()
       WHERE skill_id = $1
       RETURNING *`,
      [skillId, additionalScore, isVerified, certificateUrl]
    )
    if (rows.length === 0) throw new Error('Skill not found')
    
    // Also boost total profile score
    await query(`UPDATE candidate_profiles SET total_score = total_score + $2 WHERE profile_id = $1`, [rows[0].profile_id, additionalScore])
    
    return rows[0]
  }

  async getRecommendations(profileId: string): Promise<JobRecommendation[]> {
    const { rows } = await query<JobRecommendation>(
      `SELECT * FROM job_recommendations WHERE profile_id = $1 ORDER BY match_score DESC LIMIT 10`,
      [profileId]
    )
    return rows
  }

  async updateProfileOnboarding(
    profileId: string, 
    data: { bio?: string, job_category?: string, cv_url?: string, cover_letter_url?: string, recommendation_letter_url?: string }
  ): Promise<CandidateProfile> {
    try {
      const { rows } = await query<CandidateProfile>(
        `UPDATE candidate_profiles
         SET bio = COALESCE($2, bio),
             job_category = COALESCE($3, job_category),
             cv_url = COALESCE($4, cv_url),
             cover_letter_url = COALESCE($5, cover_letter_url),
             recommendation_letter_url = COALESCE($6, recommendation_letter_url),
             updated_at = NOW()
         WHERE profile_id = $1
         RETURNING *`,
        [
          profileId, 
          data.bio !== undefined ? data.bio : null, 
          data.job_category !== undefined ? data.job_category : null, 
          data.cv_url !== undefined ? data.cv_url : null, 
          data.cover_letter_url !== undefined ? data.cover_letter_url : null, 
          data.recommendation_letter_url !== undefined ? data.recommendation_letter_url : null
        ]
      )
      if (rows.length === 0) throw new Error('Profile not found')
      return rows[0]
    } catch (err: any) {
      if (err?.code === '42703' || String(err?.message || '').includes('does not exist')) {
        // Fallback for when the new columns haven't been added to the database yet
        const { rows } = await query<CandidateProfile>(
          `UPDATE candidate_profiles
           SET bio = COALESCE($2, bio),
               job_category = COALESCE($3, job_category),
               cv_url = COALESCE($4, cv_url),
               updated_at = NOW()
           WHERE profile_id = $1
           RETURNING *`,
          [
            profileId, 
            data.bio !== undefined ? data.bio : null, 
            data.job_category !== undefined ? data.job_category : null, 
            data.cv_url !== undefined ? data.cv_url : null
          ]
        )
        if (rows.length === 0) throw new Error('Profile not found')
        return rows[0]
      }
      throw err
    }
  }

  async setInitialAlternativeScore(profileId: string, score: number): Promise<void> {
    await query(`UPDATE candidate_profiles SET total_score = $2 WHERE profile_id = $1`, [profileId, score])
  }

  async updateProfileAlumni(
    profileId: string, 
    data: { cv_url?: string, metadata_projects?: any }
  ): Promise<CandidateProfile> {
    // We update is_returning to true, update cv_url, and merge metadata_projects into metadata
    const { rows } = await query<CandidateProfile>(
      `UPDATE candidate_profiles
       SET is_returning = true,
           cv_url = COALESCE($2, cv_url),
           metadata = CASE 
             WHEN $3::jsonb IS NOT NULL THEN jsonb_set(metadata, '{projects}', $3::jsonb)
             ELSE metadata 
           END,
           updated_at = NOW()
       WHERE profile_id = $1
       RETURNING *`,
      [profileId, data.cv_url !== undefined ? data.cv_url : null, JSON.stringify(data.metadata_projects || null)]
    )
    if (rows.length === 0) throw new Error('Profile not found')
    return rows[0]
  }

  async updateProfileSettings(
    profileId: string,
    data: {
      university_id?: string | null
      linkedin_url?: string | null
      github_url?: string | null
      portfolio_url?: string | null
      avatar_url?: string | null
      job_category?: string | null
      target_role_count?: number | null
      target_roles?: Array<{ id: string; title: string; group?: string | null }> | null
    }
  ): Promise<CandidateProfile> {
    const metaPatches: Record<string, unknown> = {}
    if (data.linkedin_url !== undefined) metaPatches.linkedin_url = data.linkedin_url
    if (data.github_url !== undefined) metaPatches.github_url = data.github_url
    if (data.portfolio_url !== undefined) metaPatches.portfolio_url = data.portfolio_url
    if (data.avatar_url !== undefined) metaPatches.avatar_url = data.avatar_url
    if (data.target_role_count !== undefined) metaPatches.target_role_count = data.target_role_count
    if (data.target_roles !== undefined) metaPatches.target_roles = data.target_roles

    const sets: string[] = ['updated_at = NOW()']
    const params: unknown[] = [profileId]
    let idx = 2

    if (data.university_id !== undefined) {
      sets.push(`university_id = $${idx++}`)
      params.push(data.university_id)
    }
    if (data.job_category !== undefined) {
      sets.push(`job_category = $${idx++}`)
      params.push(data.job_category)
    }
    if (Object.keys(metaPatches).length > 0) {
      sets.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${idx++}::jsonb`)
      params.push(JSON.stringify(metaPatches))
    }

    const { rows } = await query<CandidateProfile>(
      `UPDATE candidate_profiles SET ${sets.join(', ')} WHERE profile_id = $1 RETURNING user_id`,
      params
    )
    if (rows.length === 0) throw new Error('Profile not found')
    const refreshed = await this.getProfileByUserId((rows[0] as any).user_id)
    if (!refreshed) throw new Error('Profile not found after update')
    return refreshed
  }
}
