import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import ImagePopup from "./ImagePopup"

interface Account {
  id: number | string // Allow both number and string for MongoDB ObjectId compatibility
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  lastLogin: string
  avatar: string
  phone: string
  location: string
  rating: number
  paymentMethod: string
  verificationStatus: string
  // Customer specific fields
  gender?: string
  bio?: string
  frontIdPreview?: string | null
  backIdPreview?: string | null
  profilePicturePreview?: string | null
  coverPhoto?: string | null
  selectedLocation?: {
    name: string
    lat: number
    lng: number
    distance: number
    zipCode?: string
  } | null
  // Customer anomaly status fields
  frontIdAnomaly?: boolean
  backIdAnomaly?: boolean
  // Service Provider specific fields (for type compatibility)
  secRegistrationPreview?: string | null
  businessPermitPreview?: string | null
  birRegistrationPreview?: string | null
  eccCertificatePreview?: string | null
  generalLiabilityPreview?: string | null
  workersCompPreview?: string | null
  professionalIndemnityPreview?: string | null
  propertyDamagePreview?: string | null
  businessInterruptionPreview?: string | null
  bondingInsurancePreview?: string | null
}

interface DeclineModalProps {
  isOpen: boolean
  onClose: () => void
  account: Account
  anomalies: { [key: string]: boolean }
  onConfirmDecline: (reasons: string[], message: string) => void
}

const documentMap: { [key: string]: string } = {
  secRegistrationAnomaly: "SEC Registration",
  businessPermitAnomaly: "Business Permit",
  birRegistrationAnomaly: "BIR Registration",
  eccCertificateAnomaly: "ECC Certificate",
  generalLiabilityAnomaly: "General Liability Insurance",
  workersCompAnomaly: "Worker's Compensation",
  professionalIndemnityAnomaly: "Professional Indemnity",
  propertyDamageAnomaly: "Property Damage",
  businessInterruptionAnomaly: "Business Interruption",
  bondingInsuranceAnomaly: "Bonding Insurance",
  frontIdAnomaly: "Front of ID", // New for Customer
  backIdAnomaly: "Back of ID", // New for Customer
}

const documentPreviewMap: { [key: string]: keyof Account } = {
  secRegistrationAnomaly: "secRegistrationPreview",
  businessPermitAnomaly: "businessPermitPreview",
  birRegistrationAnomaly: "birRegistrationPreview",
  eccCertificateAnomaly: "eccCertificatePreview",
  generalLiabilityAnomaly: "generalLiabilityPreview",
  workersCompAnomaly: "workersCompPreview",
  professionalIndemnityAnomaly: "professionalIndemnityPreview",
  propertyDamageAnomaly: "propertyDamagePreview",
  businessInterruptionAnomaly: "businessInterruptionPreview",
  bondingInsuranceAnomaly: "bondingInsurancePreview",
  frontIdAnomaly: "frontIdPreview", // New for Customer
  backIdAnomaly: "backIdPreview", // New for Customer
}

const declineReasonsOptions = [
  "Policy Violation",
  "Document Discrepancy",
  "Incomplete Information",
  "Service Area Mismatch",
  "Background Check Failure",
  "Fraudulent Information",
  "Expired Documents",
  "Unclear Document Scans",
  "Non-Compliance with Local Regulations",
  "Other (Please specify)",
]

export default function DeclineModal({ isOpen, onClose, account, anomalies, onConfirmDecline }: DeclineModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // State for ImagePopup
  const [popupImage, setPopupImage] = useState<string | null>(null)
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false)

  // Filter anomalies based on the current account's role
  const anomalousDocuments = Object.keys(anomalies).filter((key) => anomalies[key])

  // Animation keyframes
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes bounceIn {
      0% { transform: scale(0); opacity: 0; }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes slideInUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `

  // Add keyframes to document
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = keyframes
    document.head.appendChild(styleElement)
    return () => {
      styleElement.remove()
    }
  }, [keyframes])

  const handleReasonChange = (reason: string, checked: boolean) => {
    setSelectedReasons((prev) => (checked ? [...prev, reason] : prev.filter((r) => r !== reason)))
  }

  const handleImageClick = (imageUrl: string | null) => {
    if (imageUrl) {
      setPopupImage(imageUrl)
      setIsImagePopupOpen(true)
    }
  }

  const handleConfirm = () => {
    setIsConfirming(true)
    setTimeout(() => {
      setIsConfirming(false)
      onConfirmDecline(selectedReasons, customMessage)
      setSuccessMessage(`Application for ${account.name} has been successfully declined.`)
      setIsSuccessModalOpen(true)
      // onClose() is now called after the success modal is dismissed
    }, 2000)
  }

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)
    onClose() // Close the decline modal after the success modal is dismissed
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl lg:max-w-4xl rounded-xl p-6 bg-white shadow-lg border border-gray-100 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
          <DialogHeader className="relative pb-4 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-3 text-2xl font-medium text-gray-700">
              <AlertTriangle className="h-7 w-7 text-red-500" />
              Decline Application
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Review and provide reasons for declining {account.name}'s application.
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 h-8 w-8 text-gray-500 hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>

          <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Anomalous Documents with Previews */}
            <div>
              {anomalousDocuments.length > 0 ? (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg h-full">
                  <h4 className="font-medium text-base mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Documents Marked with Anomalies
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {anomalousDocuments.map((key) => {
                      const docName = documentMap[key] || key
                      const previewKey = documentPreviewMap[key]
                      const previewUrl = previewKey ? account[previewKey] : null

                      return (
                        <div key={key} className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">{docName}</h5>
                          {previewUrl ? (
                            <div
                              className="relative w-full h-24 cursor-pointer overflow-hidden rounded-md border border-gray-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImageClick(previewUrl as string)
                              }}
                            >
                              <img
                                src={(previewUrl as string) || "/placeholder.svg"}
                                alt={`${docName} Preview`}
                                className="object-cover w-full h-full filter blur-[2px] hover:blur-0 transition-all"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
                                View
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center text-center text-xs text-gray-500 border border-gray-200">
                              No preview available
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg h-full flex items-center justify-center text-center">
                  <p className="font-medium text-sm">No anomalies marked for this application</p>
                </div>
              )}
            </div>
            {/* Right Column: Decline Reasons and Custom Message */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-gray-800 font-medium text-base">Select Decline Reasons:</Label>
                <div className="grid grid-cols-1 gap-3">
                  {declineReasonsOptions.map((reason) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <Checkbox
                        id={`reason-${reason.replace(/\s/g, "-").toLowerCase()}`}
                        checked={selectedReasons.includes(reason)}
                        onCheckedChange={(checked) => handleReasonChange(reason, checked as boolean)}
                        className="border-gray-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-transparent data-[state=checked]:text-white"
                      />
                      <label
                        htmlFor={`reason-${reason.replace(/\s/g, "-").toLowerCase()}`}
                        className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {reason}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="custom-message" className="text-gray-700 font-medium text-base">
                  Custom Message to Service Provider (Optional):
                </Label>
                <Textarea
                  id="custom-message"
                  placeholder="Provide a detailed explanation for the decline and any next steps..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="min-h-[100px] border-gray-300 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-full px-5 py-2 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedReasons.length === 0 || isConfirming}
              className="rounded-full px-5 py-2 bg-red-500 hover:bg-red-600 text-white"
            >
              {isConfirming ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                "Confirm Decline"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Popup */}
      <ImagePopup imageUrl={popupImage} isOpen={isImagePopupOpen} onClose={() => setIsImagePopupOpen(false)} />

      {/* Success Modal */}
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
                Application Declined!
              </h3>

              <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
                {successMessage}
              </p>

              <button
                onClick={handleSuccessModalClose}
                className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium shadow-sm hover:bg-blue-600 active:scale-95 transition-all duration-200"
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}