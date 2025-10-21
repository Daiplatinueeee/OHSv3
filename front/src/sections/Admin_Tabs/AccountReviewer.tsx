import React from "react"
import {
  ChevronLeft,
  Building,
  MapPin,
  FileText,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Trash2,
  Mail,
  Edit,
} from "lucide-react"
import ImagePopup from "../Styles/ImagePopup" // Import the ImagePopup component
import DeclineModal from "../Styles/DeclineModal" // Import the DeclineModal component
import { Button } from "@/components/ui/button" // Import Button component
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
  // New fields for document previews
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
  coverPhoto?: string | null // New field for cover photo
  // New fields for anomaly status
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

interface AccountReviewerProps {
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

export default function AccountReviewer({ account, onClose, onAccountAction }: AccountReviewerProps) {
  // Animation keyframes (copied from ManagerRequirements)
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

  // Add keyframes to document
  React.useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = keyframes
    document.head.appendChild(styleElement)
    return () => {
      styleElement.remove()
    }
  }, [keyframes])

  // State for ImagePopup
  const [popupImage, setPopupImage] = React.useState<string | null>(null)
  const [isImagePopupOpen, setIsImagePopupOpen] = React.useState(false)
  // State for TIN number visibility
  const [showTin, setShowTin] = React.useState(false)
  // State for decline modal visibility
  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false)

  // State for document anomalies
  const [documentAnomalies, setDocumentAnomalies] = React.useState({
    secRegistrationAnomaly: account.secRegistrationAnomaly || false,
    businessPermitAnomaly: account.businessPermitAnomaly || false,
    birRegistrationAnomaly: account.birRegistrationAnomaly || false,
    eccCertificateAnomaly: account.eccCertificateAnomaly || false,
    generalLiabilityAnomaly: account.generalLiabilityAnomaly || false,
    workersCompAnomaly: account.workersCompAnomaly || false,
    professionalIndemnityAnomaly: account.professionalIndemnityAnomaly || false,
    propertyDamageAnomaly: account.propertyDamageAnomaly || false,
    businessInterruptionAnomaly: account.businessInterruptionAnomaly || false,
    bondingInsuranceAnomaly: account.bondingInsuranceAnomaly || false,
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

  // Placeholder data for fields not present in the Account interface
  const businessName = account.name
  const businessEmail = account.email
  const foundedDate = account.joinDate // Using joinDate as a proxy
  const aboutCompany =
    "This service provider offers high-quality services with a commitment to customer satisfaction. They are dedicated to delivering excellent results and building long-term relationships with their clients."
  const teamSize = "11-25 employees" // Placeholder
  const companyNumber = account.phone
  const tinNumber = "123-456-789-012" // Placeholder - actual TIN
  const cityCoverage = ["New York", "Los Angeles", "Chicago"] // Placeholder
  const profilePicturePreview = account.avatar
  const coverPhotoPreview = account.coverPhoto || "/placeholder.svg?height=200&width=800" // Use account.coverPhoto

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

  // Helper to render optional document preview or placeholder
  const renderOptionalDocumentPreview = (
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
              <p className="text-gray-500 text-xs">Optional (Not uploaded)</p>
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
    <div className="py-4 px-2 min-h-screen bg-[#F5F5F7] font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] mb-10">
      <style>{keyframes}</style>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center mt-10">
          <h1 className="text-2xl font-medium mb-1 text-gray-700">Account Details</h1>
          <h2 className="text-3xl font-medium text-sky-500">Service Provider Profile Review</h2>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-xl">
          <div className="p-6">
            <div>

              {/* Business Profile Header */}
              <div className="bg-white rounded-xl overflow-hidden mb-6 border">
                {/* Cover Photo */}
                <div className="relative h-48 overflow-hidden">
                  {coverPhotoPreview ? (
                    <img
                      src={coverPhotoPreview || "/placeholder.svg"}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-sky-400 to-blue-500"></div>
                  )}
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
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Building className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl font-medium text-gray-700">{businessName}</h1>
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-xs font-medium rounded-full">
                            {account.role}
                          </span>
                        </div>
                        {account.location && (
                          <div className="flex items-center gap-2 mt-1 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{account.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {aboutCompany && <p className="text-gray-600 max-w-2xl mb-6">{aboutCompany}</p>}
                  </div>
                </div>
              </div>

              {/* Tabs Navigation (simplified to just one tab for review) */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px overflow-x-auto">
                  <button className="py-4 px-6 font-medium text-sm border-b-2 border-sky-500 text-sky-500 flex items-center gap-2 whitespace-nowrap">
                    <Building className="h-4 w-4" />
                    Business Info
                  </button>
                </nav>
              </div>

              {/* Business Information Section */}
              <div className="space-y-8 text-gray-700">
                {/* Basic Information */}
                <div className="bg-white rounded-xl p-6 border ">
                  <h4 className="text-lg font-medium mb-4 ">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-1">Business Name</h5>
                      <p className="text-gray-700">{businessName}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-1">Business Email</h5>
                      <p className="text-gray-700">{businessEmail}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-1">Founded Date</h5>
                      <p className="text-gray-700">{foundedDate}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-1">Contact Number</h5>
                      <p className="text-gray-700">{companyNumber}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-1">Team Size</h5>
                      <p className="text-gray-700">{teamSize}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-1">TIN Number</h5>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-700">{showTin ? tinNumber : "***********"}</p>
                        <button
                          onClick={() => setShowTin(!showTin)}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label={showTin ? "Hide TIN" : "Show TIN"}
                        >
                          {showTin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-1">About the Company</h5>
                    <p className="text-gray-700">{aboutCompany}</p>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-white rounded-xl p-6 border">
                  <h4 className="text-lg font-medium mb-4">Location Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {account.location && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-1">Company Location</h5>
                        <p className="text-gray-700">{account.location}</p>
                        <p className="text-sm text-gray-500">
                          Lat: N/A, Lng: N/A {/* Placeholder as lat/lng not in Account */}
                        </p>
                      </div>
                    )}
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 mb-1">Service Coverage Areas</h5>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {cityCoverage.map((city) => (
                          <span
                            key={city}
                            className="inline-block bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-xs"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permits and Documents */}
                <div className="bg-white rounded-xl p-6 border">
                  <h4 className="text-lg font-medium mb-4">Permits and Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {renderDocumentPreview(
                        account.secRegistrationPreview,
                        "SEC Registration",
                        "secRegistrationAnomaly",
                      )}
                    </div>
                    <div>
                      {renderDocumentPreview(account.businessPermitPreview, "Business Permit", "businessPermitAnomaly")}
                    </div>
                    <div>
                      {renderDocumentPreview(
                        account.birRegistrationPreview,
                        "BIR Registration",
                        "birRegistrationAnomaly",
                      )}
                    </div>
                    <div>
                      {renderOptionalDocumentPreview(
                        account.eccCertificatePreview,
                        "ECC Certificate",
                        "eccCertificateAnomaly",
                      )}
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="bg-white rounded-xl p-6 border">
                  <h4 className="text-lg font-medium mb-4">Insurance Coverage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {renderDocumentPreview(
                        account.generalLiabilityPreview,
                        "General Liability Insurance",
                        "generalLiabilityAnomaly",
                      )}
                    </div>
                    <div>
                      {renderDocumentPreview(account.workersCompPreview, "Worker's Compensation", "workersCompAnomaly")}
                    </div>
                    <div>
                      {renderOptionalDocumentPreview(
                        account.professionalIndemnityPreview,
                        "Professional Indemnity",
                        "professionalIndemnityAnomaly",
                      )}
                    </div>
                    <div>
                      {renderOptionalDocumentPreview(
                        account.propertyDamagePreview,
                        "Property Damage",
                        "propertyDamageAnomaly",
                      )}
                    </div>
                    <div>
                      {renderOptionalDocumentPreview(
                        account.businessInterruptionPreview,
                        "Business Interruption",
                        "businessInterruptionAnomaly",
                      )}
                    </div>
                    <div>
                      {renderOptionalDocumentPreview(
                        account.bondingInsurancePreview,
                        "Bonding Insurance",
                        "bondingInsuranceAnomaly",
                      )}
                    </div>
                  </div>
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
                <ChevronLeft className="mr-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 " />
                <span>Close Details</span>
              </Button>
              {account.status === "Pending" ? (
                <>
                  <Button
                    onClick={handleDeclineApplicationClick}
                    className="px-4 py-2 flex items-center rounded-full bg-red-500/90 text-white hover:bg-red-600 transition-all duration-300 hover:shadow-sm"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Decline Application
                  </Button>
                  <Button
                    onClick={handleAcceptApplication}
                    className="px-4 py-2 flex items-center rounded-full bg-green-500/90 text-white hover:bg-green-600 transition-all duration-300 hover:shadow-sm"
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
                    className="px-4 py-2 flex items-center rounded-full bg-white border border-gray-300 text-gray-700 "
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Update Account
                  </Button>
                  <Button
                    onClick={handleSuspendAccount}
                    className="px-4 py-2 flex items-center rounded-full bg-yellow-500/50 text-yellow-700 "
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Suspend Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 flex items-center rounded-full bg-red-500/50 text-red-700 "
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete Account
                  </Button>
                  <Button
                    onClick={handleEmailAccount}
                    className="px-4 py-2 flex items-center rounded-full bg-blue-500/50 text-blue-700 "
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