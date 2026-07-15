import type { Request, Response } from 'express'
import multer from 'multer'
import { authenticate } from '../middleware/auth.js'
import { saveFile } from '../utils/storage.js'
import { logger } from '../utils/logger.js'
import path from 'path'
import crypto from 'crypto'


// Configure multer for memory storage (we'll save to disk/S3 after validation)
const storage = multer.memoryStorage()

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
})

const candidateDocumentFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
    cb(new Error('Invalid file type. Audio and video formats are not allowed.'))
  } else {
    cb(null, true)
  }
}

export const uploadCandidateDocumentMiddleware = multer({
  storage,
  fileFilter: candidateDocumentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
})

async function saveUploadedImage(req: Request, folder: string) {
  const authReq = req as any
  const userId = authReq.userId as string | undefined

  if (!userId) {
    return { status: 401 as const, body: { error: 'Unauthorized' } }
  }

  if (!req.file) {
    return { status: 400 as const, body: { error: 'No file uploaded' } }
  }

  const file = req.file

  if (file.size > 5 * 1024 * 1024) {
    return { status: 400 as const, body: { error: 'File size exceeds 5MB limit' } }
  }

  const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg'
  const uniqueId = crypto.randomBytes(16).toString('hex')
  const filename = `${folder}/${userId}/${uniqueId}${fileExt}`
  const fileUrl = await saveFile(filename, file.buffer)

  const publicBaseUrl =
    process.env.PUBLIC_APP_URL ||
    process.env.FRONTEND_URL ||
    `${req.protocol}://${req.get('host')}`
  const publicUrl = fileUrl.startsWith('http')
    ? fileUrl
    : `${publicBaseUrl.replace(/\/$/, '')}/storage/${filename}`

  return {
    status: 200 as const,
    body: {
      success: true,
      url: publicUrl,
      filename,
    },
    meta: { userId, filename, size: file.size, mimetype: file.mimetype },
  }
}

/**
 * Upload company logo image
 * POST /api/upload/company-logo
 */
export async function uploadCompanyLogo(req: Request, res: Response) {
  try {
    const result = await saveUploadedImage(req, 'company-logos')
    if (result.status !== 200) {
      return res.status(result.status).json(result.body)
    }
    logger.info('Company logo uploaded successfully', result.meta)
    return res.json(result.body)
  } catch (error: any) {
    logger.error('Error uploading company logo:', error)
    return res.status(500).json({
      error: 'Failed to upload image',
      details: error.message,
    })
  }
}

/**
 * Upload profile / brand image (candidates, HR, institutions)
 * POST /api/upload/profile-image
 */
export async function uploadProfileImage(req: Request, res: Response) {
  try {
    const folder = typeof req.query.folder === 'string' && /^[a-z0-9-]+$/i.test(req.query.folder)
      ? req.query.folder
      : 'profile-images'
    const result = await saveUploadedImage(req, folder)
    if (result.status !== 200) {
      return res.status(result.status).json(result.body)
    }
    logger.info('Profile image uploaded successfully', result.meta)
    return res.json(result.body)
  } catch (error: any) {
    logger.error('Error uploading profile image:', error)
    return res.status(500).json({
      error: 'Failed to upload image',
      details: error.message,
    })
  }
}

/**
 * Upload candidate document
 * POST /api/upload/candidate-document
 */
export async function uploadCandidateDocument(req: Request, res: Response) {
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
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' })
    }

    const safeExt = path.extname(file.originalname).toLowerCase() || '.pdf'
    const uniqueId = crypto.randomBytes(16).toString('hex')
    const filename = `candidate-documents/${userId}/${uniqueId}${safeExt}`

    const fileUrl = await saveFile(filename, file.buffer)

    logger.info('Candidate document uploaded successfully', {
      userId,
      filename,
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
    })

    const publicUrl = fileUrl.startsWith('http')
      ? fileUrl
      : `https://optiohire.com/storage/${filename}`

    return res.json({
      success: true,
      url: publicUrl,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })
  } catch (error: any) {
    logger.error('Error uploading candidate document:', error)
    return res.status(500).json({
      error: 'Failed to upload candidate document',
      details: error.message,
    })
  }
}

/**
 * Upload candidate document publicly (no auth required)
 * POST /api/upload/public-candidate-document
 */
export async function uploadPublicCandidateDocument(req: Request, res: Response) {
  try {
    const captchaToken = req.headers['x-captcha-token'] as string | undefined
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const file = req.file
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' })
    }

    const safeExt = path.extname(file.originalname).toLowerCase() || '.pdf'
    const uniqueId = crypto.randomBytes(16).toString('hex')
    const filename = `candidate-documents/public/${uniqueId}${safeExt}`

    const fileUrl = await saveFile(filename, file.buffer)

    logger.info('Public candidate document uploaded successfully', {
      filename,
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
    })

    const publicUrl = fileUrl.startsWith('http')
      ? fileUrl
      : `https://optiohire.com/storage/${filename}`

    return res.json({
      success: true,
      url: publicUrl,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })
  } catch (error: any) {
    logger.error('Error uploading public candidate document:', error)
    return res.status(500).json({
      error: 'Failed to upload candidate document',
      details: error.message,
    })
  }
}



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
    const filename = `job-posters/${userId}/${uniqueId}${fileExt}`

    const fileUrl = await saveFile(filename, file.buffer)

    logger.info('Job poster uploaded successfully', {
      userId,
      filename,
      size: file.size,
      mimetype: file.mimetype,
    })

    const publicBaseUrl =
      process.env.PUBLIC_APP_URL ||
      process.env.FRONTEND_URL ||
      `${req.protocol}://${req.get('host')}`
    const publicUrl = fileUrl.startsWith('http')
      ? fileUrl
      : `${publicBaseUrl.replace(/\/$/, '')}/storage/${filename}`

    return res.status(200).json({ url: publicUrl })
  } catch (error) {
    logger.error('Error uploading job poster:', error)
    return res.status(500).json({ error: 'Failed to upload job poster' })
  }
}
