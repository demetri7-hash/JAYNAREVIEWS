'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Check } from 'lucide-react'
import Image from 'next/image'

interface PhotoUploadProps {
  onPhotoChange: (file: File | null, preview: string | null) => void
  currentPhoto?: string | null
  disabled?: boolean
}

export function PhotoUpload({ onPhotoChange, currentPhoto, disabled = false }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        setPreview(previewUrl)
        onPhotoChange(file, previewUrl)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Failed to process image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removePhoto = () => {
    setPreview(null)
    onPhotoChange(null, null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  if (disabled) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Photo Documentation
        </label>
        {preview ? (
          <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Task completion photo"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <span className="text-gray-400">No photo provided</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Photo Documentation (Optional)
      </label>
      
      {preview ? (
        <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden group">
          <Image
            src={preview}
            alt="Task completion photo"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={removePhoto}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Processing image...</p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload File</span>
                </button>
                
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Camera className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Take Photo</span>
                </button>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Drag and drop an image here, or click to select</p>
                <p>Maximum file size: 5MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
        className="hidden"
      />
    </div>
  )
}

interface PhotoViewerProps {
  photos: string[]
  onClose: () => void
}

export function PhotoViewer({ photos, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (photos.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-full p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X className="h-8 w-8" />
        </button>
        
        <div className="relative">
          <Image
            src={photos[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            width={800}
            height={600}
            className="max-w-full max-h-full object-contain"
          />
          
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
