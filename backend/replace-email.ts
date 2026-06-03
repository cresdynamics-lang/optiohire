import fs from 'fs'
import path from 'path'

function replaceInFile(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath)
  if (!fs.existsSync(fullPath)) return
  let content = fs.readFileSync(fullPath, 'utf8')
  if (content.includes('noreply@optiohire.com')) {
    content = content.replace(/noreply@optiohire\.com/g, 'applicationsoptiohire@gmail.com')
    fs.writeFileSync(fullPath, content)
    console.log('Updated ' + filePath)
  }
}

const files = [
  'src/services/emailService.ts',
  'src/services/resendService.ts',
  'src/services/sendGridService.ts',
  'src/email/mailer.ts',
  'src/email/templates.ts',
  'src/config/emailDefaults.ts'
]

files.forEach(replaceInFile)
