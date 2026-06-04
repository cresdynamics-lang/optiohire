import { describe, it, expect } from 'vitest';
import { computeScores, ExtractedData, DEFAULT_SCORING_WEIGHTS } from '../lib/scoringWeights.js';

describe('Scoring Weights Logic', () => {
  it('should compute scores for a perfect candidate', () => {
    const extracted: ExtractedData = {
      found_skills: ['JS', 'React', 'Node'],
      missing_skills: [],
      partial_skills: [],
      experience_years_found: 5,
      education_found: 'BS CS',
      education_meets_requirement: true
    };
    const requiredSkills = ['JS', 'React', 'Node'];
    
    const result = computeScores(extracted, 4, requiredSkills, 0.9, DEFAULT_SCORING_WEIGHTS);
    
    expect(result.skill_score).toBe(100);
    expect(result.education_score).toBe(100);
    expect(result.final_score).toBeGreaterThan(80);
  });

  it('should apply education waiver for experienced candidates', () => {
    const extracted: ExtractedData = {
      found_skills: ['JS'],
      missing_skills: [],
      partial_skills: [],
      experience_years_found: 10,
      education_found: 'None',
      education_meets_requirement: false
    };
    
    const result = computeScores(extracted, 3, ['JS'], 0.8, DEFAULT_SCORING_WEIGHTS);
    
    expect(result.waived).toBe(true);
    expect(result.education_score).toBe(50); // Waived score
  });

  it('should identify weak candidates', () => {
    const extracted: ExtractedData = {
      found_skills: [],
      missing_skills: ['JS'],
      partial_skills: [],
      experience_years_found: 0,
      education_found: 'None',
      education_meets_requirement: false
    };
    
    const result = computeScores(extracted, 5, ['JS'], 0.1, DEFAULT_SCORING_WEIGHTS);
    
    expect(result.tier).toBe('weak');
  });
});
