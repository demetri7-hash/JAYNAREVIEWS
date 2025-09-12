'use client'

import React, { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Camera, Upload, X, Image as ImageIcon, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PhotoUploadProps {
  onPhotosChange: (urls: string[]) => void
  existingPhotos?: string[]
  maxPhotos?: number
  bucket?: string
  folder?: string
  required?: boolean
  className?: string
}

interface UploadedPhoto {
  url: string
  file?: File
  name: string
  size: number
  uploading?: boolean
}

export default function PhotoUpload({
  onPhotosChange,
  existingPhotos = [],
  maxPhotos = 5,
  bucket = 'task-photos',
  folder = 'uploads',
  required = false,
  className = ''
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>(
    existingPhotos.map(url => ({
      url,
      name: url.split('/').pop() || 'image',
      size: 0
    }))
  )
  const [uploading, setUploading] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxPhotos - photos.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    if (filesToProcess.length < files.length) {
      toast.warning(`Only uploading ${filesToProcess.length} photos (max ${maxPhotos} allowed)`)
    }

    setUploading(true)

    try {
      const newPhotos: UploadedPhoto[] = []

      for (const file of filesToProcess) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`)
          continue
        }

        // Create temporary photo entry
        const tempPhoto: UploadedPhoto = {
          url: URL.createObjectURL(file),
          file,
          name: file.name,
          size: file.size,
          uploading: true
        }
        newPhotos.push(tempPhoto)
      }

      // Add temporary photos to state
      setPhotos(prev => [...prev, ...newPhotos])

      // Upload each file
      const uploadedUrls: string[] = []
      for (let i = 0; i < newPhotos.length; i++) {
        const photo = newPhotos[i]
        if (!photo.file) continue

        try {
          const fileExt = photo.file.name.split('.').pop()
          const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, photo.file, {
              cacheControl: '3600',
              upsert: false
            })

          if (error) {
            throw error
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path)

          uploadedUrls.push(publicUrl)

          // Update photo with actual URL
          setPhotos(prev => prev.map((p, index) => 
            p === photo ? { ...p, url: publicUrl, uploading: false } : p
          ))

        } catch (error) {
          console.error('Upload error:', error)
          toast.error(`Failed to upload ${photo.name}`)
          
          // Remove failed upload
          setPhotos(prev => prev.filter(p => p !== photo))
        }
      }

      // Update parent component
      const allUrls = [...existingPhotos, ...uploadedUrls]
      onPhotosChange(allUrls)

      if (uploadedUrls.length > 0) {
        toast.success(`Successfully uploaded ${uploadedUrls.length} photo(s)`)
      }

    } catch (error) {
      console.error('Upload process error:', error)
      toast.error('Failed to process photos')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async (photoToRemove: UploadedPhoto) => {
    try {
      // If it's an uploaded photo (not just a local preview), try to delete from storage
      if (photoToRemove.url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '')) {
        const urlParts = photoToRemove.url.split('/')
        const fileName = urlParts.slice(-2).join('/') // Get folder/filename
        
        await supabase.storage
          .from(bucket)
          .remove([fileName])
      }

      // Remove from local state
      const updatedPhotos = photos.filter(p => p !== photoToRemove)
      setPhotos(updatedPhotos)

      // Update parent component
      const urls = updatedPhotos.map(p => p.url).filter(url => !url.startsWith('blob:'))
      onPhotosChange(urls)

      toast.success('Photo removed')
    } catch (error) {
      console.error('Remove photo error:', error)
      toast.error('Failed to remove photo')
    }
  }

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openCamera}
          disabled={uploading || photos.length >= maxPhotos}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Camera className="h-4 w-4 mr-2" />
          Take Photo
        </button>

        <button
          type="button"
          onClick={openFileSelector}
          disabled={uploading || photos.length >= maxPhotos}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Photos
        </button>

        <div className="flex items-center text-sm text-gray-500">
          {photos.length}/{maxPhotos} photos
          {required && photos.length === 0 && (
            <span className="text-red-500 ml-2">*Required</span>
          )}
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {photo.uploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewPhoto(photo.url)}
                  />
                )}
              </div>

              {/* Photo Controls */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(photo.url)}
                  className="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                  title="Preview"
                >
                  <Eye className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(photo)}
                  className="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                  title="Remove"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {/* File Info */}
              <div className="mt-1 text-xs text-gray-500 truncate">
                {photo.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No photos uploaded</p>
          <p className="text-sm text-gray-400">
            Take photos or upload images to document your work
          </p>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={previewPhoto}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Uploading photos...
          </div>
        </div>
      )}
    </div>
  )
}