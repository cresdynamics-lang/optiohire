'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  label?: string
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 5,
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to backend
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const formData = new FormData()
      formData.append('image', file)

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/upload/company-logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      onChange(data.url)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }, [maxSizeMB, onChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleRemove = useCallback(() => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-gray-700 dark:text-gray-300 font-medium">
        {label}
      </Label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        {preview ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              disabled={uploading}
              className="hidden"
            />
            <Button
              type="button"
              onClick={handleClick}
              disabled={uploading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Choose Image
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload from your device (phone, laptop, etc.). Max size: {maxSizeMB}MB. Supported: JPEG, PNG, GIF, WebP
          </p>
        </div>
      </div>

      {/* URL Input (fallback) */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <Label htmlFor="logo-url-fallback" className="text-xs text-gray-500 dark:text-gray-400">
          Or paste image URL:
        </Label>
        <Input
          id="logo-url-fallback"
          type="url"
          value={value || ''}
          onChange={(e) => {
            const url = e.target.value.trim() || null
            onChange(url)
            if (url) {
              setPreview(url)
            }
          }}
          placeholder="https://example.com/logo.png"
          className="mt-1 text-sm"
        />
      </div>
    </div>
  )
}
