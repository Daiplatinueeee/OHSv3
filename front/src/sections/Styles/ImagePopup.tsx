import type React from "react"

import { X, FolderOpen } from "lucide-react"
import { useEffect, useRef } from "react"

interface ImagePopupProps {
  imageUrl: string | null
  isOpen: boolean
  onClose: () => void
  onImageChange?: (file: File) => void
}

export default function ImagePopup({ imageUrl, isOpen, onClose, onImageChange }: ImagePopupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageChange) {
      onImageChange(file)
    }
  }

  const handleChangeImage = () => {
    fileInputRef.current?.click()
  }

  if (!isOpen || !imageUrl) {
    return null
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        <div className="absolute top-4 sm:top-21 right-2 sm:right-6 z-10 flex gap-2">
          {/* Change image button */}
          {onImageChange && (
            <button
              onClick={handleChangeImage}
              className="p-2 bg-gray-500 hover:bg-gray-600 backdrop-blur-sm text-white rounded-full transition-all duration-200 hover:scale-110"
              title="Change image"
            >
              <FolderOpen className="h-6 w-6" />
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 bg-gray-500 hover:bg-gray-600 backdrop-blur-sm text-white rounded-full transition-all duration-200 hover:scale-110"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        {/* Image container */}
        <div
          className="relative bg-white rounded-lg shadow-2xl overflow-hidden max-w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Document preview"
            className="w-[90vw] sm:w-[80vw] max-w-full h-[70vh] sm:h-[75vh] max-h-[80vh] object-contain sm:object-fill"
            onLoad={(e) => {
              // Ensure image is properly sized
              const img = e.target as HTMLImageElement
              if (img.naturalWidth > window.innerWidth * 0.9) {
                img.style.width = "90vw"
                img.style.height = "auto"
              }
              if (img.naturalHeight > window.innerHeight * 0.8) {
                img.style.height = "80vh"
                img.style.width = "auto"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}