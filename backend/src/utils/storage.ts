import './env.js'

import fs from 'fs/promises'
import path from 'path'

const baseDir = process.env.FILE_STORAGE_DIR || './storage'

export async function ensureStorageDir() {
  await fs.mkdir(baseDir, { recursive: true })
}

export async function saveFile(filename: string, data: Buffer): Promise<string> {
  // Local storage
  await ensureStorageDir()
  const filePath = path.join(baseDir, filename)
  
  // Ensure the directory for the file exists (including subdirectories)
  const dirPath = path.dirname(filePath)
  await fs.mkdir(dirPath, { recursive: true })
  
  await fs.writeFile(filePath, data)
  const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/')
  return `/storage/${relativePath}`
}


