import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  Camera,
  ImageIcon,
  Check,
  CheckCircle2,
  AlertTriangle,
  X,
  XCircle,
} from "lucide-react"
import LocationSelector from "./LocationSelectorAuth"
import ImagePopup from "../Styles/ImagePopup"

const initialSavedLocations: Location[] = []

interface Location {
  name: string
  lat: number
  lng: number
  distance: number
  price?: number
  id?: string
  zipCode?: string
}

interface CustomerRequirementsProps {
  onClose?: () => void
  parentModal?: boolean
  minimalMode?: boolean // New prop
  accountType: "customer" // Added accountType prop
}

// Define companyLocation outside the component to ensure a stable reference
const companyLocation = {
  lat: 10.3125,
  lng: 123.8924,
}

export default function CustomerRequirements({ onClose, minimalMode = false, accountType }: CustomerRequirementsProps) {
  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("") // New state
  const [confirmPassword, setConfirmPassword] = useState("") // New state
  const [mobileNumber, setMobileNumber] = useState("")
  const [gender, setGender] = useState("")
  const [bio, setBio] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState("next")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const [showWarningModal, setShowWarningModal] = useState(false)
  const [currentFileInputRef, setCurrentFileInputRef] = useState<HTMLInputElement | null>(null)
  const [hasWarningBeenShownOnce, setHasWarningBeenShownOnce] = useState(false)

  // ID document state (only for full mode)
  const [frontIdPreview, setFrontIdPreview] = useState<string | null>(null)
  const [backIdPreview, setBackIdPreview] = useState<string | null>(null)

  // Location state (only for full mode)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)

  // Profile state (only for full mode)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null)

  const [secretQuestion, setSecretQuestion] = useState("")
  const [secretAnswer, setSecretAnswer] = useState("")
  const [secretCode, setSecretCode] = useState<string | null>(null)

  const [showFileExistsModal, setShowFileExistsModal] = useState(false)
  const [showGenericUploadErrorModal, setShowGenericUploadErrorModal] = useState(false)
  const [genericUploadErrorMessage, setGenericUploadErrorMessage] = useState("")

  // Refs for file inputs (only for full mode)
  const frontIdRef = useRef<HTMLInputElement>(null)
  const backIdRef = useRef<HTMLInputElement>(null)
  const profilePictureRef = useRef<HTMLInputElement>(null)
  const coverPhotoRef = useRef<HTMLInputElement>(null)

  // States for image popup
  const [popupImage, setPopupImage] = useState<string | null>(null)
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false)

  // Reset form after successful submission
  useEffect(() => {
    if (success) {
      // Reset all form fields
      setFirstName("")
      setLastName("")
      setMiddleName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setMobileNumber("")
      setGender("")
      setBio("")
      setFrontIdPreview(null)
      setBackIdPreview(null)
      setSelectedLocation(null)
      setProfilePicturePreview(null)
      setCoverPhotoPreview(null)
      setSecretQuestion("")
      setSecretAnswer("")
      setSecretCode(null)

      // Reset to first step
      setCurrentStep(1)
    }
  }, [success])

  // Load warning status from localStorage on mount
  useEffect(() => {
    const warningStatus = localStorage.getItem("v0_id_upload_warning_shown")
    if (warningStatus === "true") {
      setHasWarningBeenShownOnce(true)
    }
  }, [])

  useEffect(() => {
    const generateSecretCode = async () => {
      if (secretQuestion.trim() !== "" && secretAnswer.trim() !== "") {
        const combinedString = secretQuestion.trim() + secretAnswer.trim()
        const textEncoder = new TextEncoder()
        const data = textEncoder.encode(combinedString)
        const hashBuffer = await crypto.subtle.digest("SHA-256", data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
        setSecretCode(hexHash.substring(0, 10)) // Use first 10 characters of the hash
      } else {
        setSecretCode(null) // Clear code if inputs are empty
      }
    }

    generateSecretCode()
  }, [secretQuestion, secretAnswer])

  // Helper function to upload a file to the API
  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await fetch("http://localhost:3000/api/upload/image", {
      method: "POST",
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Failed to upload ${file.name}.`)
    }
    const data = await response.json()
    return data.url
  }

  // Handle file selection, preview, and immediate upload
  const handleActualFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Reset error states before new upload attempt
      setError("")
      setShowFileExistsModal(false)
      setShowGenericUploadErrorModal(false)

      // Create local DataURL preview immediately for quick feedback
      const reader = new FileReader()
      reader.onloadend = () => {
        previewSetter(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Attempt to upload the file immediately to the server
      try {
        const uploadedUrl = await uploadFile(file)
        previewSetter(uploadedUrl) // Update preview to the actual uploaded URL from the server
      } catch (error: any) {
        console.error("Upload error:", error)
        // Check for specific error messages from the server
        if (error.message === "File already exists. Please upload a different file or rename it.") {
          setShowFileExistsModal(true)
        } else {
          setGenericUploadErrorMessage(error.message || "An unknown error occurred during file upload.")
          setShowGenericUploadErrorModal(true)
        }
        previewSetter(null) // Clear the preview if upload fails
        // Optionally, clear the file input value if the upload fails
        if (e.target) {
          e.target.value = ""
        }
      }
    } else {
      previewSetter(null) // Clear preview if no file is selected
    }
  }

  // Function to trigger the warning modal or file input
  const handleIdUploadClick = (element: HTMLInputElement | null) => {
    if (!element) return // Ensure element exists

    if (!hasWarningBeenShownOnce) {
      setCurrentFileInputRef(element) // Store which element to trigger later
      setShowWarningModal(true)
      localStorage.setItem("v0_id_upload_warning_shown", "true")
      setHasWarningBeenShownOnce(true) // Update state immediately
    } else {
      element.click() // Directly trigger the file input
    }
  }

  const handleConfirmUpload = () => {
    if (currentFileInputRef) {
      currentFileInputRef.click() // Trigger the hidden file input
      setShowWarningModal(false)
      setCurrentFileInputRef(null) // Clear the ref
    }
  }

  const handleImageClick = (imageUrl: string | null) => {
    if (imageUrl) {
      setPopupImage(imageUrl)
      setIsImagePopupOpen(true)
    }
  }

  // Validation for each step (only for full mode)
  const isStep1Valid = () => {
    return password === confirmPassword
  }

  const isStep2Valid = () => {
    return true
  }

  const isStep3Valid = () => {
    return true // All fields in this step are now optional
  }

  // Navigation between steps with animation (only for full mode)
  const goToNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      animateStepChange("next", 2)
    } else if (currentStep === 2 && isStep2Valid()) {
      animateStepChange("next", 3)
    } else if (currentStep === 3 && isStep3Valid()) {
      animateStepChange("next", 4)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      animateStepChange("prev", currentStep - 1)
    }
  }

  // Animation function
  const animateStepChange = (direction: "next" | "prev", newStep: number) => {
    setAnimationDirection(direction)
    setIsAnimating(true)

    // After a short delay, change the step
    setTimeout(() => {
      setCurrentStep(newStep)

      // Allow time for the new content to render before removing the animation class
      setTimeout(() => {
        setIsAnimating(false)
      }, 50)
    }, 250)
  }

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)

    // Call onClose if provided (to close the parent modal)
    if (onClose) {
      onClose()
    }
  }

  // Handle form submission (mock implementation without API)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:3000/api/users/register/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName || null,
          lastName: lastName || null,
          middleName: middleName || null, // Send null if empty
          email: email || null,
          password: password || null,
          mobileNumber: mobileNumber || null,
          gender: gender || null,
          bio: bio || null, // Send null if empty
          accountType: accountType, // Use prop here
          minimalMode: false, // Full registration
          idDocuments: {
            front: frontIdPreview || null, // Now holds the uploaded URL or null
            back: backIdPreview || null, // Now holds the uploaded URL or null
          },
          location: selectedLocation,
          profilePicture: profilePicturePreview || null, // Now holds the uploaded URL or null
          coverPhoto: coverPhotoPreview || null, // Now holds the uploaded URL or null
          secretQuestion: secretQuestion || null, // Send null if empty
          secretAnswer: secretAnswer || null, // Send null if empty
          secretCode: secretCode || null, // Send null if empty
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.")
      }

      setSuccess(true)
      setIsSuccessModalOpen(true)
    } catch (error: any) {
      setError(error.message || "An error occurred during registration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle minimal form submission
  const handleMinimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:3000/api/users/register/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName || null,
          lastName: lastName || null,
          middleName: middleName || null, // Send null if empty
          email: email || null,
          password: password || null,
          mobileNumber: mobileNumber || null,
          gender: gender || null,
          bio: bio || null, // Send null if empty
          accountType: accountType, // Use prop here
          minimalMode: true, // Minimal registration
          location: selectedLocation,
          // Explicitly send null for fields not collected in minimal mode
          idDocuments: { front: null, back: null },
          profilePicture: null,
          coverPhoto: null,
          secretQuestion: null,
          secretAnswer: null,
          secretCode: null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.")
      }

      setSuccess(true)
      setIsSuccessModalOpen(true)
    } catch (error: any) {
      setError(error.message || "An error occurred during registration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle location selection with price calculation (only for full mode)
  const handleLocationSelect = (location: Location) => {
    const updatedLocation = {
      ...location,
    }
    setSelectedLocation(updatedLocation)
  }

  return (
    <div className="py-4 px-2 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Include animation keyframes */}
      <style>{`
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
`}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-medium text-gray-700 mb-1">HandyGo</h1>
          <h2 className="text-3xl font-medium text-sky-400">Create Your Account</h2>
        </div>

        {/* Success message */}
        {success && !isSuccessModalOpen && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-3">
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-green-800">Registration Successful!</h3>
            <p className="text-green-600">Your account has been created successfully. You can now log in.</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-medium text-red-800">Registration Failed</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {minimalMode ? (
          <div className="bg-white rounded-xl overflow-hidden p-4">
            <form onSubmit={handleMinimalSubmit}>
              <h3 className="text-lg font-medium mb-4 text-gray-700">Basic Account Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left side: Personal Information */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="first-name" className="mb-1 block text-sm font-medium">
                      First Name (optional)
                    </label>
                    <input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="last-name" className="mb-1 block text-sm font-medium">
                      Last Name (optional)
                    </label>
                    <input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="middle-name" className="mb-1 block text-sm font-medium">
                      Middle Name (optional)
                    </label>
                    <input
                      id="middle-name"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Enter your middle name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium">
                      Email Address (optional)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile-number" className="mb-1 block text-sm font-medium">
                      Mobile Number (optional)
                    </label>
                    <input
                      id="mobile-number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter your mobile number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="mb-1 block text-sm font-medium">
                      Gender (optional)
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Right side: Location and Password */}
                <div className="space-y-4">
                  {/* Location Selection */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-gray-700">Select Your Location (optional)</h4>
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(true)}
                      className="w-full px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                    >
                      Open Location Selector
                    </button>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      {!selectedLocation && (
                        <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-gray-400">No location selected</p>
                        </div>
                      )}
                    </div>
                    {selectedLocation && (
                      <div className="p-4 bg-white border rounded-lg">
                        <h4 className="font-medium mb-2">Selected Location</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500">Location Name</label>
                            <p className="font-medium">{selectedLocation.name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-500">Distance</label>
                              <p className="font-medium">{selectedLocation.distance.toFixed(1)} km</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Zip Code</label>
                              <p className="font-medium">
                                {selectedLocation.zipCode ? (
                                  selectedLocation.zipCode
                                ) : (
                                  <span className="text-gray-400">Not available</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Coordinates</label>
                            <p className="text-sm">
                              Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Password Information */}
                  <div>
                    <div>
                      <label htmlFor="password" className="mb-1 block text-sm font-medium">
                        Password (optional)
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="mt-4">
                      <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">
                        Confirm Password (optional)
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || password !== confirmPassword}
                  className={`px-5 py-2 rounded-full transition-all duration-300 hover:shadow-md flex items-center justify-center w-full ${
                    loading || password !== confirmPassword
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-sky-500 hover:bg-sky-600 text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Create Basic Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          // Full Mode Form (Existing Logic)
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="p-4 relative">
              {/* SwiftUI-inspired progress indicator */}
              <div className="mb-6 px-30 ml-20">
                <div className="flex items-center justify-center gap-1 md:gap-3">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex flex-1 items-center">
                      <div
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          currentStep === step
                            ? "bg-sky-500 text-white scale-110 shadow-md"
                            : currentStep > step
                              ? "bg-sky-500 text-white"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {currentStep > step ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-xs font-medium">{step}</span>
                        )}
                      </div>
                      {step < 4 && (
                        <div
                          className={`flex-1 h-1 transition-all duration-500 ${
                            currentStep > step ? "bg-sky-500" : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 px-5  ml-[-2rem] mr-15">
                  <span className={currentStep >= 1 ? "text-sky-600 font-medium" : ""}>Personal</span>
                  <span className={currentStep >= 2 ? "text-sky-600 font-medium" : ""}>Location</span>
                  <span className={currentStep >= 3 ? "text-sky-600 font-medium" : ""}>Profile</span>
                  <span className={currentStep >= 4 ? "text-sky-600 font-medium" : ""}>Review</span>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div
                  className={`transition-all duration-300 ${
                    isAnimating
                      ? animationDirection === "next"
                        ? "opacity-0 translate-x-10"
                        : "opacity-0 -translate-x-10"
                      : "opacity-100 translate-x-0"
                  }`}
                >
                  {/* Step 1: Personal Information and ID */}
                  {currentStep === 1 && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left side - ID upload */}
                      <div>
                        <h3 className="text-lg font-medium mb-4 text-gray-700">Valid ID Submission</h3>

                        {/* Front ID */}
                        <div className="mb-4">
                          <label htmlFor="front-id" className="mb-2 block text-sm font-medium">
                            Front of ID (optional)
                          </label>
                          <div
                            className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${frontIdPreview ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}
                            onClick={() => handleIdUploadClick(frontIdRef.current)}
                          >
                            {frontIdPreview ? (
                              <div
                                className="relative w-full h-40 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleImageClick(frontIdPreview)
                                }}
                              >
                                <img
                                  src={frontIdPreview || "/placeholder.svg"}
                                  alt="Front ID Preview"
                                  className="object-contain w-full h-full filter blur-sm hover:blur-[2px] transition-all"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                    Click to view
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Upload front of your valid ID</p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF up to 5MB</p>
                              </>
                            )}
                            <input
                              id="front-id"
                              type="file"
                              ref={frontIdRef}
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleActualFileChange(e, setFrontIdPreview)}
                            />
                          </div>
                        </div>

                        {/* Back ID */}
                        <div className="mb-4">
                          <label htmlFor="back-id" className="mb-2 block text-sm font-medium">
                            Back of ID (optional)
                          </label>
                          <div
                            className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${backIdPreview ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}
                            onClick={() => handleIdUploadClick(backIdRef.current)}
                          >
                            {backIdPreview ? (
                              <div
                                className="relative w-full h-40 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleImageClick(backIdPreview)
                                }}
                              >
                                <img
                                  src={backIdPreview || "/placeholder.svg"}
                                  alt="Back ID Preview"
                                  className="object-contain w-full h-full filter blur-sm hover:blur-[2px] transition-all"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                    Click to view
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Upload back of your valid ID</p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF up to 5MB</p>
                              </>
                            )}
                            <input
                              id="back-id"
                              type="file"
                              ref={backIdRef}
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleActualFileChange(e, setBackIdPreview)}
                            />
                          </div>
                        </div>

                        {/* ID Preview */}
                        {(frontIdPreview || backIdPreview) && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">ID Overview</h4>
                            <div className="flex gap-2">
                              {frontIdPreview && (
                                <div className="relative w-20 h-12 border rounded overflow-hidden">
                                  <img
                                    src={frontIdPreview || "/placeholder.svg"}
                                    alt="Front ID"
                                    className="object-cover w-full h-full"
                                  />
                                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <span className="text-xs text-white font-medium">Front</span>
                                  </div>
                                </div>
                              )}
                              {backIdPreview && (
                                <div className="relative w-20 h-12 border rounded overflow-hidden">
                                  <img
                                    src={backIdPreview || "/placeholder.svg"}
                                    alt="Back ID"
                                    className="object-cover w-full h-full"
                                  />
                                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <span className="text-xs text-white font-medium">Back</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right side - Personal information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4 text-gray-700">Personal Information</h3>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="first-name" className="mb-1 block text-sm font-medium">
                              First Name (optional)
                            </label>
                            <input
                              id="first-name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Enter your first name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="last-name" className="mb-1 block text-sm font-medium">
                              Last Name (optional)
                            </label>
                            <input
                              id="last-name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Enter your last name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="middle-name" className="mb-1 block text-sm font-medium">
                              Middle Name (optional)
                            </label>
                            <input
                              id="middle-name"
                              value={middleName}
                              onChange={(e) => setMiddleName(e.target.value)}
                              placeholder="Enter your middle name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="gender" className="mb-1 block text-sm font-medium">
                              Gender (optional)
                            </label>
                            <select
                              id="gender"
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-medium">
                              Email Address (optional)
                            </label>
                            <input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="example@mail.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="password" className="mb-1 block text-sm font-medium">
                              Password (optional)
                            </label>
                            <input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">
                              Confirm Password (optional)
                            </label>
                            <input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm your password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label htmlFor="mobile-number" className="mb-1 block text-sm font-medium">
                              Mobile Number (optional)
                            </label>
                            <input
                              id="mobile-number"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value)}
                              placeholder="Enter your mobile number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Location Selection */}
                  {currentStep === 2 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4 text-gray-700">Select Your Location</h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left side - Location selection and price settings */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowLocationModal(true)}
                            className="w-full mb-4 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                          >
                            Open Location Selector
                          </button>

                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-2">
                              Click the button above to open the location selector. You can search for a location or
                              click on the map to select your service location.
                            </p>

                            {!selectedLocation && (
                              <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-400">No location selected</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right side - Selected location details */}
                        <div>
                          {selectedLocation ? (
                            <div className="p-4 bg-white border rounded-lg">
                              <h4 className="font-medium mb-2">Selected Location</h4>

                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs text-gray-500">Location Name</label>
                                  <p className="font-medium">{selectedLocation.name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs text-gray-500">Distance</label>
                                    <p className="font-medium">{selectedLocation.distance.toFixed(1)} km</p>
                                  </div>

                                  <div>
                                    <label className="text-xs text-gray-500">Zip Code</label>
                                    <p className="font-medium">
                                      {selectedLocation.zipCode ? (
                                        selectedLocation.zipCode
                                      ) : (
                                        <span className="text-gray-400">Not available</span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs text-gray-500">Coordinates</label>
                                  <p className="text-sm">
                                    Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full p-6 border-2 border-dashed border-gray-300 rounded-lg">
                              <p className="text-gray-400 mb-2">No location selected</p>
                              <p className="text-xs text-gray-500 text-center">
                                Please select a location to continue with your registration
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Profile Setup */}
                  {currentStep === 3 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4 text-gray-700">Account Profile Setup</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left side - Bio and Profile Pictures */}
                        <div>
                          {/* Bio */}
                          <div className="mb-6">
                            <label htmlFor="bio" className="mb-2 block text-sm font-medium">
                              Bio (optional)
                            </label>
                            <textarea
                              id="bio"
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Tell us about yourself"
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          {/* Cover Photo */}
                          <div className="mb-4">
                            <label htmlFor="cover-photo" className="mb-2 block text-sm font-medium">
                              Cover Photo (optional)
                            </label>
                            <div
                              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors h-40 ${coverPhotoPreview ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}
                              onClick={() => coverPhotoRef.current?.click()}
                            >
                              {coverPhotoPreview ? (
                                <div className="relative w-full h-full">
                                  <img
                                    src={coverPhotoPreview || "/placeholder.svg"}
                                    alt="Cover Photo Preview"
                                    className="object-cover rounded-md w-full h-full"
                                  />
                                </div>
                              ) : (
                                <>
                                  <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500">Upload a cover photo</p>
                                  <p className="text-xs text-gray-400 mt-1">JPG or PNG up to 5MB</p>
                                </>
                              )}
                              <input
                                id="cover-photo"
                                type="file"
                                ref={coverPhotoRef}
                                className="hidden"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => handleActualFileChange(e, setCoverPhotoPreview)}
                              />
                            </div>
                          </div>

                          {/* Profile Picture */}
                          <div className="mb-4">
                            <label htmlFor="profile-picture" className="mb-2 block text-sm font-medium">
                              Profile Picture (optional)
                            </label>
                            <div
                              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${profilePicturePreview ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"}`}
                              onClick={() => profilePictureRef.current?.click()}
                            >
                              {profilePicturePreview ? (
                                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                                  <img
                                    src={profilePicturePreview || "/placeholder.svg"}
                                    alt="Profile Picture Preview"
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              ) : (
                                <>
                                  <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500">Upload a profile picture</p>
                                  <p className="text-xs text-gray-400 mt-1">JPG or PNG up to 5MB</p>
                                </>
                              )}
                              <input
                                id="profile-picture"
                                type="file"
                                ref={profilePictureRef}
                                className="hidden"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => handleActualFileChange(e, setProfilePicturePreview)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right side - Profile Preview */}
                        <div>
                          <h4 className="text-lg font-medium mb-4 text-gray-700">
                            Secret Question & Answer (optional)
                          </h4>
                          <div className="bg-white border rounded-lg p-6 space-y-4">
                            <div>
                              <label htmlFor="secret-question" className="mb-1 block text-sm font-medium">
                                Secret Question
                              </label>
                              <input
                                id="secret-question"
                                value={secretQuestion}
                                onChange={(e) => setSecretQuestion(e.target.value)}
                                placeholder="e.g., What is your mother's maiden name?"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                            <div>
                              <label htmlFor="secret-answer" className="mb-1 block text-sm font-medium">
                                Secret Answer
                              </label>
                              <input
                                id="secret-answer"
                                value={secretAnswer}
                                onChange={(e) => setSecretAnswer(e.target.value)}
                                placeholder="Enter your secret answer"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>

                            {secretCode && (
                              <div className="mt-6 p-4 bg-sky-50 border border-sky-100 rounded-lg text-center">
                                <h5 className="text-sm font-medium text-sky-800 mb-2">Your Secret Code:</h5>
                                <p className="text-2xl font-bold text-sky-600 tracking-wider select-all">
                                  {secretCode}
                                </p>
                                <p className="mt-2 text-xs text-sky-700">
                                  Note: Use this code only if necessary for account recovery or verification. Keep it
                                  safe.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Account Review */}
                  {currentStep === 4 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4 text-gray-700">Review Your Profile</h3>

                      {/* Profile Header - Similar to MyProfile.tsx */}
                      <div className="bg-white rounded-xl overflow-hidden mb-6 border border-gray-100">
                        {/* Cover Photo */}
                        <div className="relative h-60 overflow-hidden">
                          {coverPhotoPreview ? (
                            <img
                              src={coverPhotoPreview || "/placeholder.svg"}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-sky-400 to-blue-500"></div>
                          )}
                          <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full">
                            <Camera className="h-5 w-5" />
                          </div>
                        </div>

                        {/* Profile Info */}
                        <div className="relative px-6 pb-6">
                          <div className="absolute -top-16 left-6">
                            <div className="relative">
                              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                                {profilePicturePreview ? (
                                  <img
                                    src={profilePicturePreview || "/placeholder.svg"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md">
                                <Camera className="h-4 w-4 text-gray-600" />
                              </div>
                            </div>
                          </div>

                          <div className="pt-20">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h1 className="text-2xl font-medium text-gray-700">
                                    {firstName || "Not provided"} {middleName ? middleName + " " : ""}
                                    {lastName || "Not provided"}
                                  </h1>
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                    Customer
                                  </span>
                                </div>
                                {selectedLocation && (
                                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="lucide lucide-map-pin"
                                    >
                                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span>{selectedLocation.name || "Not provided"}</span>
                                    {selectedLocation.zipCode && (
                                      <span className="ml-1 text-sky-600">({selectedLocation.zipCode})</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {bio && <p className="text-gray-600 max-w-2xl mb-6">{bio}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Tabs Navigation */}
                      <div className="border-b border-gray-200 mb-6">
                        <nav className="flex -mb-px overflow-x-auto">
                          <button
                            type="button"
                            className="py-4 px-6 font-medium text-sm border-b-2 border-sky-500 text-sky-500 flex items-center gap-2 whitespace-nowrap"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-user"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            Personal Info
                          </button>
                        </nav>
                      </div>

                      {/* Personal Information Section */}
                      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-medium text-gray-700">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Full Name</h4>
                            <p className="text-gray-700">
                              {firstName || "Not provided"} {middleName ? middleName + " " : ""}
                              {lastName || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                            <p className="text-gray-700">{email || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                            <p className="text-gray-700">{mobileNumber || "Not provided"}</p>
                          </div>
                          {selectedLocation && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                              <p className="text-gray-700 flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4 text-gray-400 mr-1"
                                >
                                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                                {selectedLocation.name || "Not provided"}
                                {selectedLocation.zipCode && (
                                  <span className="ml-1 text-sky-600">({selectedLocation.zipCode})</span>
                                )}
                              </p>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Gender</h4>
                            <p className="text-gray-700 capitalize">{gender || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Account Type</h4>
                            <p className="text-gray-700">
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                Customer
                              </span>
                              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                Pending
                              </span>
                            </p>
                          </div>
                        </div>
                        {bio && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                            <p className="text-gray-700">{bio}</p>
                          </div>
                        )}
                      </div>

                      {/* ID Documents Section */}
                      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
                        <h2 className="text-xl font-medium text-gray-700 mb-6">ID Documents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Front of ID</h5>
                            {frontIdPreview ? (
                              <div
                                className="relative w-full h-32 cursor-pointer"
                                onClick={() => handleImageClick(frontIdPreview)}
                              >
                                <img
                                  src={frontIdPreview || "/placeholder.svg"}
                                  alt="Front ID Preview"
                                  className="object-contain w-full h-full filter blur-sm hover:blur-[2px] transition-all"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                    Click to view
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">Not uploaded</p>
                            )}
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Back of ID</h5>
                            {backIdPreview ? (
                              <div
                                className="relative w-full h-32 cursor-pointer"
                                onClick={() => handleImageClick(backIdPreview)}
                              >
                                <img
                                  src={backIdPreview || "/placeholder.svg"}
                                  alt="Back ID Preview"
                                  className="object-contain w-full h-full filter blur-sm hover:blur-[2px] transition-all"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                    Click to view
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">Not uploaded</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-sky-50 border border-sky-100 rounded-lg">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-sky-500"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h5 className="text-sm font-medium text-sky-800">Please review your information</h5>
                            <p className="mt-1 text-sm text-sky-700">
                              This is how your profile will appear to others. Make sure all the information is correct
                              before creating your account. You can go back to previous steps to make changes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation buttons with SwiftUI-like design */}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    disabled={currentStep === 1}
                    className={`group px-4 py-2 flex items-center rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 ${
                      currentStep === 1 ? "opacity-0 pointer-events-none" : "hover:shadow-sm"
                    }`}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                    <span>Back</span>
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={goToNextStep}
                      disabled={(currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())}
                      className={`group px-4 py-2 flex items-center rounded-full text-white transition-all duration-300 ${
                        (currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())
                          ? "bg-sky-300 cursor-not-allowed"
                          : "bg-sky-500 hover:bg-sky-600 hover:shadow-md"
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-5 py-2 rounded-full transition-all duration-300 hover:shadow-md flex items-center ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600 text-white"
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Warning Modal */}
        {showWarningModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            <div
              className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20"
              style={{ animation: "slideInUp 0.4s ease-out" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-700">Confidential Information</h3>
                </div>
                <button
                  onClick={() => {
                    setShowWarningModal(false)
                    if (currentFileInputRef) {
                      currentFileInputRef.value = "" // Clear the file input value
                    }
                    setCurrentFileInputRef(null) // Clear the ref
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  The document you are about to upload contains sensitive business information. We want to assure you
                  that:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Your documents are stored securely with enterprise-grade encryption</li>
                  <li>Access is strictly limited to verification personnel only</li>
                  <li>Documents will only be used for business verification purposes</li>
                  <li>We comply with all data protection regulations</li>
                </ul>
                <p className="mt-4 text-gray-600">
                  We value your trust and are committed to protecting your confidential information.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowWarningModal(false)
                    if (currentFileInputRef) {
                      currentFileInputRef.value = "" // Clear the file input value
                    }
                    setCurrentFileInputRef(null) // Clear the ref
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                >
                  Proceed with Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal - Similar to the one in Transaction.tsx */}
        {isSuccessModalOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            <div
              className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
              style={{ animation: "fadeIn 0.5s ease-out" }}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
                  style={{ animation: "pulse 2s ease-in-out infinite" }}
                >
                  <CheckCircle2 className="h-10 w-10 text-green-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
                </div>

                <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
                  Registration Successful!
                </h3>

                <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                  Your account has been created successfully. You can now log in to access all features.
                </p>

                <button
                  onClick={handleSuccessModalClose}
                  className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium shadow-sm hover:bg-blue-600 active:scale-95 transition-all duration-200"
                  style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Already Exists Modal */}
        {showFileExistsModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            <div
              className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20"
              style={{ animation: "slideInUp 0.4s ease-out" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-700">File Already Exists</h3>
                </div>
                <button onClick={() => setShowFileExistsModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">
                  A file with the same name has already been uploaded. Please upload a different file or rename the file
                  you are trying to upload.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowFileExistsModal(false)}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generic Upload Error Modal */}
        {showGenericUploadErrorModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            <div
              className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20"
              style={{ animation: "slideInUp 0.4s ease-out" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <XCircle className="h-6 w-6 text-red-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-700">Upload Failed</h3>
                </div>
                <button
                  onClick={() => setShowGenericUploadErrorModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">
                  {genericUploadErrorMessage || "There was an issue uploading your file. Please try again."}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowGenericUploadErrorModal(false)}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location selection modal */}
        {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" onClick={() => setShowLocationModal(false)}></div>
            <div className="relative bg-white rounded-xl w-full max-w-3xl max-h-[80vh] overflow-auto p-4 z-10">
              <LocationSelector
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                onSelectLocation={(location) => {
                  handleLocationSelect(location)
                  setShowLocationModal(false)
                }}
                companyLocation={companyLocation}
                savedLocations={initialSavedLocations}
                previousLocation={selectedLocation}
              />
            </div>
          </div>
        )}
      </div>

      <ImagePopup imageUrl={popupImage} isOpen={isImagePopupOpen} onClose={() => setIsImagePopupOpen(false)} />
    </div>
  )
}