import fs from 'fs'
import path from 'path'

const file = path.join(process.cwd(), 'src/api/uploadController.ts')
let content = fs.readFileSync(file, 'utf8')

if (!content.includes('uploadJobPoster')) {
  const code = `
/**
 * Upload job poster image
 * POST /api/upload/job-poster
 */
export async function uploadJobPoster(req: Request, res: Response) {
  try {
    const authReq = req as any
    const userId = authReq.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const file = req.file

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' })
    }

    const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg'
    const uniqueId = crypto.randomBytes(16).toString('hex')
    const filename = \`job-posters/\${userId}/\${uniqueId}\${fileExt}\`

    const fileUrl = await saveFile(filename, file.buffer)

    logger.info('Job poster uploaded successfully', {
      userId,
      filename,
      size: file.size,
      mimetype: file.mimetype,
    })

    return res.status(200).json({ url: fileUrl })
  } catch (error) {
    logger.error('Error uploading job poster:', error)
    return res.status(500).json({ error: 'Failed to upload job poster' })
  }
}
`
  content += '\n' + code
  fs.writeFileSync(file, content)
  console.log('Added uploadJobPoster to uploadController.ts')
}
