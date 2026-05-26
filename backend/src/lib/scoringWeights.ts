import { SKILL_TAXONOMY } from './skillTaxonomy.js';

export interface ScoringWeights {
  skill: number;
  experience: number;
  education: number;
  vector: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  skill: 0.35,
  experience: 0.30,
  education: 0.15,
  vector: 0.20
};

export interface ExtractedData {
  found_skills: string[];
  missing_skills: string[];
  partial_skills: string[];
  experience_years_found: number;
  education_found: string;
  education_meets_requirement: boolean;
}

export interface ComputedScores {
  skill_score: number;
  experience_score: number;
  education_score: number;
  vector_score: number;
  final_score: number;
  tier: "strong" | "good" | "partial" | "weak";
  waived: boolean;
  waiver_reason?: string;
  bonus_skills: string[];
}

export function computeScores(
  extracted: ExtractedData,
  requiredYears: number,
  requiredSkills: string[],
  vectorSimilarity: number,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): ComputedScores {
  
  // 1. Skill Score
  const totalRequired = Math.max(requiredSkills.length, 1);
  const exactCount = extracted.found_skills.length;
  const partialCount = extracted.partial_skills.length;
  
  let rawSkillScore = ((exactCount * 1.0) + (partialCount * 0.6)) / totalRequired * 100;
  
  // Bonus skills (skills found that weren't strictly required, max 10 points)
  const bonus_skills = extracted.found_skills.filter(s => !requiredSkills.includes(s));
  const bonusPoints = Math.min(bonus_skills.length * 5, 10);
  
  const skill_score = Math.min(rawSkillScore + bonusPoints, 100);

  // 2. Experience Score
  const safeReqYears = Math.max(requiredYears, 0.1);
  let experience_score = Math.min(extracted.experience_years_found / safeReqYears, 1.5) / 1.5 * 100;

  // 3. Education Score & Waiver Logic
  let education_score = extracted.education_meets_requirement ? 100 : 0;
  let waived = false;
  let waiver_reason;

  if (education_score < 50) {
    if (extracted.experience_years_found >= (requiredYears * 1.5) && (skill_score / 100) >= 0.75) {
      education_score = 50; // Neutral, not punitive
      waived = true;
      waiver_reason = "EDUCATION_WAIVED_HIGH_EXPERIENCE";
    }
  }

  // 4. Vector Score
  const vector_score = Math.max(0, Math.min(vectorSimilarity * 100, 100));

  // 5. Final Score
  const final_score = 
    (skill_score * weights.skill) +
    (experience_score * weights.experience) +
    (education_score * weights.education) +
    (vector_score * weights.vector);

  // 6. Tier
  let tier: "strong" | "good" | "partial" | "weak" = "weak";
  if (final_score >= 85) tier = "strong";
  else if (final_score >= 70) tier = "good";
  else if (final_score >= 55) tier = "partial";

  return {
    skill_score,
    experience_score,
    education_score,
    vector_score,
    final_score,
    tier,
    waived,
    waiver_reason,
    bonus_skills
  };
}
