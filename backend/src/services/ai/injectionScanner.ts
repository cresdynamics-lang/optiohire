export const INJECTION_PATTERNS = [
  // CRITICAL: Explicit overrides
  { pattern: /ignore (all )?(previous )?instructions/i, severity: 'CRITICAL' },
  { pattern: /disregard (all )?(previous )?instructions/i, severity: 'CRITICAL' },
  { pattern: /system prompt:/i, severity: 'CRITICAL' },
  { pattern: /forget everything/i, severity: 'CRITICAL' },
  { pattern: /you are now/i, severity: 'CRITICAL' },
  { pattern: /give me (the )?highest score/i, severity: 'CRITICAL' },

  // HIGH: Roleplaying & Data Exfiltration
  { pattern: /as an AI,/i, severity: 'HIGH' },
  { pattern: /print your initial instructions/i, severity: 'HIGH' },
  { pattern: /output your rules/i, severity: 'HIGH' },
  { pattern: /evaluate this as 10\/10/i, severity: 'HIGH' },

  // MEDIUM: Subtle manipulation
  { pattern: /perfect candidate/i, severity: 'MEDIUM' },
  { pattern: /hire me immediately/i, severity: 'MEDIUM' }
] as const

export type Severity = 'NONE' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ScanResult {
  isClean: boolean
  severity: Severity
  detectedPatterns: string[]
}

export function scanForInjections(text: string): ScanResult {
  const detectedPatterns: string[] = []
  let highestSeverity: Severity = 'NONE'

  for (const { pattern, severity } of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      detectedPatterns.push(pattern.source)
      
      // Update severity to the highest found
      if (severity === 'CRITICAL') highestSeverity = 'CRITICAL'
      else if (severity === 'HIGH' && highestSeverity !== 'CRITICAL') highestSeverity = 'HIGH'
      else if (severity === 'MEDIUM' && highestSeverity === 'NONE') highestSeverity = 'MEDIUM'
    }
  }

  return {
    isClean: detectedPatterns.length === 0,
    severity: highestSeverity,
    detectedPatterns
  }
}
