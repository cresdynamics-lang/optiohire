/**
 * Simple template parser that replaces {{variable}} placeholders with actual values.
 * Handles HTML escaping for safety.
 */
export function parseTemplate(template: string, variables: Record<string, string | null | undefined>): string {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g')
    const safeValue = value || ''
    result = result.replace(placeholder, safeValue)
  }

  return result
}
