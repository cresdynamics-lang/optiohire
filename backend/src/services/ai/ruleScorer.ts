/**
 * A basic rule-based heuristic fallback to cross-validate AI scoring.
 * Evaluates the CV strictly on keyword presence.
 */
export function calculateRuleBasedScore(cvText: string, jobRequirements: string[]): number {
  if (!jobRequirements || jobRequirements.length === 0) return 0

  const lowerCvText = cvText.toLowerCase()
  let matches = 0

  for (const req of jobRequirements) {
    // Check if the exact requirement or its parts exist in the CV
    const keywords = req.toLowerCase().split(/\\s+/)
    const hasMatch = keywords.some(kw => kw.length > 3 && lowerCvText.includes(kw))
    if (hasMatch || lowerCvText.includes(req.toLowerCase())) {
      matches++
    }
  }

  // Score out of 100
  return Math.round((matches / jobRequirements.length) * 100)
}

/**
 * Checks if the AI score is suspiciously high compared to the rule-based score.
 * A divergence > 40 points usually indicates an anomaly (or a successful prompt injection).
 */
export function checkDivergence(aiScore: number, ruleScore: number): boolean {
  // If AI gave it a 90 but the rule-based heuristic found 0 matching skills
  const divergenceThreshold = 40
  return (aiScore - ruleScore) > divergenceThreshold
}
