'use client'
import { useState } from 'react'
import { ImageUploadProps } from '../models/model'
import imageCompression from "browser-image-compression";


export default function ImageUpload({ 
  onImageSelect, 
  currentImage, 
  altText = '', 
  onAltTextChange 
}: ImageUploadProps) {
  
  const [preview, setPreview] = useState<string>(currentImage || '')
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        onImageSelect(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // compression options
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      // compress the file
      const compressedFile = await imageCompression(file, options);
      console.log("Original size:", (file.size / 1024 / 1024).toFixed(2), "MB");
      console.log("Compressed size:", (compressedFile.size / 1024 / 1024).toFixed(2), "MB");

      // change to file if you want to remove compression
      handleFileChange(compressedFile)
    } catch (error) {
      console.error("Image compression error:", error);
    }




    // const file = e.target.files?.[0]
    // if (file) handleFileChange(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileChange(file)
  }

  const handleRemove = () => {
    setPreview('')
    onImageSelect('')
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          id="image-upload"
        />
        
        {preview ? (
          <div className="space-y-3">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-64 mx-auto rounded-lg shadow-sm"
            />
            <div className="flex gap-2 justify-center">
              <label 
                htmlFor="image-upload"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer text-sm font-semibold"
              >
                Change Image
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor="image-upload" className="cursor-pointer block">
            <div className="space-y-3">
              <svg 
                className="w-16 h-16 mx-auto text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
              <div>
                <p className="text-base font-medium text-gray-900">
                  {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </label>
        )}
      </div>

      {preview && onAltTextChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Alt Text (for accessibility)
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => onAltTextChange(e.target.value)}
            placeholder="Describe the image..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      )}
    </div>
  )
}