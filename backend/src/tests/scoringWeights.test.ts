import { computeScores, ExtractedData, DEFAULT_SCORING_WEIGHTS } from '../lib/scoringWeights.js';

function assertEqual(actual: number, expected: number, msg: string) {
  if (Math.round(actual) !== Math.round(expected)) {
    throw new Error(`FAIL: ${msg} | Expected ${expected}, got ${actual}`);
  }
}

function runTests() {
  console.log("Running scoringWeights tests...");

  // Test 1: Perfect candidate
  const perfectExtracted: ExtractedData = {
    found_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
    missing_skills: [],
    partial_skills: [],
    experience_years_found: 5,
    education_found: 'BS Computer Science',
    education_meets_requirement: true
  };
  const requiredSkills = ['JavaScript', 'React', 'Node.js', 'PostgreSQL'];
  const reqYears = 4;
  const vectorSim = 0.95;

  let result = computeScores(perfectExtracted, reqYears, requiredSkills, vectorSim, DEFAULT_SCORING_WEIGHTS);
  
  assertEqual(result.skill_score, 100, "Perfect skill score");
  assertEqual(result.experience_score, 83.3333, "Experience score (1.25x req)");
  assertEqual(result.education_score, 100, "Perfect education score");
  assertEqual(result.vector_score, 95, "Vector score matches");
  assertEqual(result.final_score, 94, "Final score is ~94");
  console.log("✅ Test 1: Perfect candidate passed");

  // Test 2: The Education Waiver (Self-taught with lots of experience)
  const selfTaughtExtracted: ExtractedData = {
    found_skills: ['JavaScript', 'React', 'Node.js'],
    missing_skills: ['PostgreSQL'],
    partial_skills: [],
    experience_years_found: 8, // 2x required experience
    education_found: 'High School',
    education_meets_requirement: false // Missing degree
  };

  result = computeScores(selfTaughtExtracted, reqYears, requiredSkills, vectorSim, DEFAULT_SCORING_WEIGHTS);
  
  // They should get 75% for skills (3/4)
  assertEqual(result.skill_score, 75, "Partial skill score");
  // 8 years vs 4 required = max experience points (100)
  assertEqual(result.experience_score, 100, "Max experience score");
  // The education waiver should trigger! Education score should be neutral (50) instead of punitive (0)
  assertEqual(result.education_score, 50, "Education waiver triggered (50 instead of 0)");
  if (!result.waived) throw new Error("Waiver flag should be true");
  console.log("✅ Test 2: Education Waiver triggered correctly");

  // Test 3: Unqualified candidate
  const unqualifiedExtracted: ExtractedData = {
    found_skills: ['HTML'],
    missing_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
    partial_skills: [],
    experience_years_found: 1,
    education_found: 'None',
    education_meets_requirement: false
  };

  result = computeScores(unqualifiedExtracted, reqYears, requiredSkills, 0.20, DEFAULT_SCORING_WEIGHTS);
  
  // They should be in the weak tier
  if (result.tier !== 'weak') throw new Error(`Expected weak tier, got ${result.tier}`);
  console.log("✅ Test 3: Unqualified candidate rejected");

  console.log("🎉 All tests passed!");
}

runTests();
