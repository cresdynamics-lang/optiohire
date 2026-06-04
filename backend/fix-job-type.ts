import fs from 'fs'
import path from 'path'

const file = path.join(process.cwd(), '../frontend/src/types/index.ts')
let content = fs.readFileSync(file, 'utf8')

// Fix Job type
if (content.includes('export interface Job {') && !content.includes('job_poster_url?: string')) {
  content = content.replace(
    /export interface Job \{([\s\S]*?)\}/,
    (match, inner) => {
      return \`export interface Job {\${inner}  job_poster_url?: string\\n}\`
    }
  )
  fs.writeFileSync(file, content)
  console.log('Fixed Job type')
} else {
  console.log('Job type already fixed or not found')
}
