import fs from 'fs'
import path from 'path'

const file = path.join(process.cwd(), 'src/repositories/applicationRepository.ts')
let content = fs.readFileSync(file, 'utf8')

if (!content.includes('updateInterviewStatus')) {
  const updateCode = `
  async updateInterviewStatus(data: {
    application_id: string
    status: string
    rejection_reason?: string | null
  }): Promise<Application> {
    const { rows } = await query<Application>(
      \`UPDATE applications
       SET interview_status = $1, interview_rejection_reason = COALESCE($2, interview_rejection_reason)
       WHERE application_id = $3
       RETURNING *\`,
      [data.status, data.rejection_reason || null, data.application_id]
    )
    if (rows.length === 0) {
      throw new Error('Application not found')
    }
    return rows[0]
  }
}
`
  // replace the very last } of the class
  content = content.replace(/}\s*$/, updateCode)
  fs.writeFileSync(file, content)
  console.log('Added updateInterviewStatus to applicationRepository.ts')
}
