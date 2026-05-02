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

// File filter for candidate documents (CV/resume/portfolio docs)
const candidateDocumentFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Invalid file type. Allowed: PDF, DOC, DOCX, TXT, RTF, ODT, JPEG, PNG, WebP.'
      )
    )
  }
}

export const uploadCandidateDocumentMiddleware = multer({
  storage,
  fileFilter: candidateDocumentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
})

/**
 * Upload company logo image
 * POST /api/upload/company-logo
 */
export async function uploadCompanyLogo(req: Request, res: Response) {
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

    // Validate file size (already checked by multer, but double-check)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' })
    }

    // Generate unique filename
    const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg'
    const uniqueId = crypto.randomBytes(16).toString('hex')
    const filename = `company-logos/${userId}/${uniqueId}${fileExt}`

    // Save file to storage (local or S3)
    const fileUrl = await saveFile(filename, file.buffer)

    logger.info('Company logo uploaded successfully', {
      userId,
      filename,
      size: file.size,
      mimetype: file.mimetype,
    })

    // Return the URL or path
    // If it's a local path, convert to URL
    const publicUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${process.env.PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/storage/${filename}`

    return res.json({
      success: true,
      url: publicUrl,
      filename,
    })
  } catch (error: any) {
    logger.error('Error uploading company logo:', error)
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
      : `${process.env.PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/storage/${filename}`

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
