import React from "react"
import {
  ChevronLeft,
  MapPin,
  FileText,
  AlertTriangle,
  Camera,
  User,
  X,
  CheckCircle,
  Edit,
  Trash2,
  Mail,
} from "lucide-react"
import ImagePopup from "../Styles/ImagePopup"
import DeclineModal from "../Styles/DeclineModal"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Account {
  id: number
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
  // Service Provider specific fields (for type compatibility, though not used here)
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
  secRegistrationAnomaly?: boolean
  businessPermitAnomaly?: boolean
  birRegistrationAnomaly?: boolean
  eccCertificateAnomaly?: boolean
  generalLiabilityAnomaly?: boolean
  workersCompAnomaly?: boolean
  professionalIndemnityAnomaly?: boolean
  propertyDamageAnomaly?: boolean
  businessInterruptionAnomaly?: boolean
  bondingInsuranceAnomaly?: boolean
}

interface CustomerReviewerProps {
  account: Account
  onClose: () => void
  onAccountAction: (
    accountId: number,
    newStatus: string,
    newVerificationStatus: string,
    updatedAnomalies: { [key: string]: boolean },
    declineReasons?: string[],
    declineMessage?: string,
  ) => void
}

export default function CustomerReviewer({ account, onClose, onAccountAction }: CustomerReviewerProps) {
  const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
`

  React.useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = keyframes
    document.head.appendChild(styleElement)
    return () => {
      styleElement.remove()
    }
  }, [keyframes])

  const [popupImage, setPopupImage] = React.useState<string | null>(null)
  const [isImagePopupOpen, setIsImagePopupOpen] = React.useState(false)
  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false)

  // State for customer document anomalies
  const [documentAnomalies, setDocumentAnomalies] = React.useState({
    frontIdAnomaly: account.frontIdAnomaly || false,
    backIdAnomaly: account.backIdAnomaly || false,
  })

  const handleImageClick = (imageUrl: string | null) => {
    if (imageUrl) {
      setPopupImage(imageUrl)
      setIsImagePopupOpen(true)
    }
  }

  const toggleAnomaly = (docKey: keyof typeof documentAnomalies) => {
    setDocumentAnomalies((prev) => ({
      ...prev,
      [docKey]: !prev[docKey],
    }))
  }

  // Helper to render document preview or placeholder
  const renderDocumentPreview = (
    previewUrl: string | null | undefined,
    docName: string,
    anomalyKey: keyof typeof documentAnomalies,
  ) => {
    const hasAnomaly = documentAnomalies[anomalyKey]
    return (
      <div className={`space-y-2 ${hasAnomaly ? "border border-red-400 bg-red-50 p-2 rounded-md" : ""}`}>
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium text-gray-700">{docName}</h5>
          <button
            onClick={() => toggleAnomaly(anomalyKey)}
            className={`p-1 rounded-full ${hasAnomaly ? "bg-red-200 text-red-700" : "bg-gray-100 text-gray-500"} hover:bg-opacity-80 transition-colors`}
            title={hasAnomaly ? "Mark as no anomaly" : "Mark as anomaly"}
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
        </div>
        {previewUrl ? (
          <div
            className="relative w-full h-32 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              handleImageClick(previewUrl)
            }}
          >
            <img
              src={previewUrl || "/placeholder.svg"}
              alt={`${docName} Preview`}
              className="object-contain w-full h-full filter blur-sm hover:blur-[2px] transition-all"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">Click to view</span>
            </div>
          </div>
        ) : (
          <div className="mt-2 border rounded p-2 flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
              <FileText className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{docName}</p>
              <p className="text-red-500 text-xs">Not uploaded</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleAcceptApplication = () => {
    onAccountAction(account.id, "Active", "Verified", documentAnomalies)
  }

  const handleDeclineApplicationClick = () => {
    setIsDeclineModalOpen(true)
  }

  const handleConfirmDecline = (reasons: string[], message: string) => {
    onAccountAction(account.id, "Declined", "Rejected", documentAnomalies, reasons, message)
    setIsDeclineModalOpen(false)
  }

  const handleUpdateAccount = () => {
    toast.info(`Update Account for ${account.name} clicked.`, { duration: 2000 })
    // Implement actual update logic here
  }

  const handleSuspendAccount = () => {
    toast.warning(`Suspend Account for ${account.name} clicked.`, { duration: 2000 })
    // Implement actual suspend logic here
  }

  const handleDeleteAccount = () => {
    toast.error(`Delete Account for ${account.name} clicked.`, { duration: 2000 })
    // Implement actual delete logic here
  }

  const handleEmailAccount = () => {
    toast.info(`Email Account for ${account.name} clicked.`, { duration: 2000 })
    // Implement actual email logic here
  }

  return (
    <div className="py-4 px-2 min-h-screen bg-[#F5F5F7] font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] mt-10">
      <style>{keyframes}</style>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-medium mb-1 text-gray-700">Account Details</h1>
          <h2 className="text-3xl font-medium text-sky-500">Customer Profile Review</h2>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-xl text-gray-700">
          <div className="p-6">
            <div>
              {/* Profile Header - Similar to CustomerRequirements.tsx Step 4 */}
              <div className="bg-white rounded-xl overflow-hidden mb-6 border border-gray-100">
                {/* Cover Photo */}
                <div className="relative h-60 overflow-hidden">
                  {account.coverPhoto ? (
                    <img
                      src={account.coverPhoto || "/placeholder.svg"}
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
                        {account.profilePicturePreview ? (
                          <img
                            src={account.profilePicturePreview || "https://cdn.pixabay.com/photo/2023/04/16/10/55/nature-7929920_1280.jpg"}
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
                          <h1 className="text-2xl font-medium text-gray-700">{account.name}</h1>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            {account.role}
                          </span>
                        </div>
                        {account.selectedLocation && (
                          <div className="flex items-center gap-2 mt-1 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{account.selectedLocation.name}</span>
                            {account.selectedLocation.zipCode && (
                              <span className="text-sky-600 text-sm">({account.selectedLocation.zipCode})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {account.bio && <p className="text-gray-600 max-w-2xl mb-6">{account.bio}</p>}
                  </div>
                </div>
              </div>

              {/* Tabs Navigation (simplified to just one tab for review) */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px overflow-x-auto">
                  <button className="py-4 px-6 font-medium text-sm border-b-2 border-sky-500 text-sky-500 flex items-center gap-2 whitespace-nowrap">
                    <User className="h-4 w-4" />
                    Personal Info
                  </button>
                </nav>
              </div>

              {/* Personal Information Section */}
              <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Full Name</h4>
                    <p className="text-gray-900">{account.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                    <p className="text-gray-900">{account.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                    <p className="text-gray-900">{account.phone}</p>
                  </div>
                  {account.selectedLocation && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {account.selectedLocation.name}
                        {account.selectedLocation.zipCode && (
                          <span className="ml-1 text-sky-600">({account.selectedLocation.zipCode})</span>
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Gender</h4>
                    <p className="text-gray-900 capitalize">{account.gender || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Account Type</h4>
                    <p className="text-gray-900">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {account.role}
                      </span>
                      <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        {account.status}
                      </span>
                    </p>
                  </div>
                </div>
                {account.bio && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                    <p className="text-gray-900">{account.bio}</p>
                  </div>
                )}
              </div>

              {/* ID Documents */}
              <div className="bg-white rounded-xl p-6 border">
                <h4 className="text-lg font-medium mb-4">ID Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>{renderDocumentPreview(account.frontIdPreview, "Front of ID", "frontIdAnomaly")}</div>
                  <div>{renderDocumentPreview(account.backIdPreview, "Back of ID", "backIdAnomaly")}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-blue-800">Account Status</h5>
                    <p className="mt-1 text-sm text-blue-700">
                      This account is currently <span className="font-medium">{account.status.toLowerCase()}</span>{" "}
                      with a verification status of{" "}
                      <span className="font-medium">{account.verificationStatus.toLowerCase()}</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation and Action buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <Button
                variant="outline"
                onClick={onClose}
                className={`group px-4 py-2 flex items-center rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:shadow-sm`}
              >
                <ChevronLeft className="mr-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span>Close Details</span>
              </Button>
              {account.status === "Pending" ? (
                <>
                  <Button
                    onClick={handleDeclineApplicationClick}
                    className="px-4 py-2 flex items-center rounded-full bg-red-500/90 text-white"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Decline Application
                  </Button>
                  <Button
                    onClick={handleAcceptApplication}
                    className="px-4 py-2 flex items-center rounded-full bg-green-500/90 text-white"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Accept Application
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleUpdateAccount}
                    className="px-4 py-2 flex items-center rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:shadow-sm"
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Update Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSuspendAccount}
                    className="px-4 py-2 flex items-center rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-all duration-300 hover:shadow-sm"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Suspend Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 flex items-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300 hover:shadow-sm"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete Account
                  </Button>
                  <Button
                    onClick={handleEmailAccount}
                    className="px-4 py-2 flex items-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 hover:shadow-sm"
                  >
                    <Mail className="mr-1 h-4 w-4" />
                    Email Account
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Image Popup */}
      <ImagePopup imageUrl={popupImage} isOpen={isImagePopupOpen} onClose={() => setIsImagePopupOpen(false)} />

      {/* Decline Modal */}
      <DeclineModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        account={account}
        anomalies={documentAnomalies}
        onConfirmDecline={handleConfirmDecline}
      />
    </div>
  )
}