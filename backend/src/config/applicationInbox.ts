export const APPLICATION_INBOX_EMAIL =
  (process.env.APPLICATION_INBOX_EMAIL || process.env.IMAP_USER || 'applicationsoptiohire@gmail.com')
    .toLowerCase()
    .trim()

export function getRecommendedApplicationSubject(jobTitle: string, companyName: string): string {
  const cleanTitle = String(jobTitle || '').trim()
  const cleanCompany = String(companyName || '').trim()
  return `${cleanTitle} at ${cleanCompany}`.replace(/\s+/g, ' ').trim()
}
