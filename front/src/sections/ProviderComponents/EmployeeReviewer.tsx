import React from "react"
import {
  ChevronLeft,
  MapPin,
  Camera,
  User,
  X,
  CheckCircle,
  Mail,
  Phone,
  Clock,
  Calendar,
  Shield,
  Edit,
  Trash2,
} from "lucide-react"
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
  // Common fields for profile display
  bio?: string
  profilePicturePreview?: string | null
  coverPhoto?: string | null
  selectedLocation?: {
    name: string
    lat: number
    lng: number
    distance: number
    zipCode?: string
  } | null
  // Anomaly status fields (empty for Employee/Admin, but needed for type compatibility with DeclineModal)
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
  frontIdAnomaly?: boolean
  backIdAnomaly?: boolean
}

interface EmployeeReviewerProps {
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

export default function EmployeeReviewer({ account, onClose, onAccountAction }: EmployeeReviewerProps) {
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

  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false)

  // For Employee/Admin, anomalies are not typically tracked via documents, so this will be empty
  const documentAnomalies = {}

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
    <div className="py-4 px-2 min-h-screen bg-[#F5F5F7] font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      <style>{keyframes}</style>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1">Account Details</h1>
          <h2 className="text-3xl font-bold text-sky-400">{account.role} Profile Review</h2>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div>
              <h3 className="text-xl font-semibold mb-6">Review {account.role} Profile</h3>

              {/* Profile Header */}
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
                            src={account.profilePicturePreview || "/placeholder.svg"}
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
                          <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
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

                    {account.bio && <p className="text-gray-600 max-w-2xl mb-6">{account.bio}</p>}
                  </div>
                </div>
              </div>

              {/* Tabs Navigation (simplified to just one tab for review) */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px overflow-x-auto">
                  <button className="py-4 px-6 font-medium text-sm border-b-2 border-sky-500 text-sky-500 flex items-center gap-2 whitespace-nowrap">
                    <User className="h-4 w-4" />
                    Basic Info
                  </button>
                </nav>
              </div>

              {/* Basic Information Section */}
              <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Full Name</h4>
                    <p className="text-gray-900">{account.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {account.email}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {account.phone}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                    <p className="text-gray-900 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {account.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Joined Date</h4>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {account.joinDate}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Last Login</h4>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {account.lastLogin}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Account Type</h4>
                    <p className="text-gray-900">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {account.role}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Verification Status</h4>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span
                        className={`font-medium ${account.verificationStatus === "Verified" ? "text-[#30D158]" : "text-[#FF9500]"}`}
                      >
                        {account.verificationStatus}
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

              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-blue-800">Account Status</h5>
                    <p className="mt-1 text-sm text-blue-700">
                      This account is currently <span className="font-semibold">{account.status.toLowerCase()}</span>{" "}
                      with a verification status of{" "}
                      <span className="font-semibold">{account.verificationStatus.toLowerCase()}</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation and Action buttons */}
            <div className="flex justify-end gap-3 mt-8">
              {account.status === "Pending" ? (
                <>
                  <Button
                    onClick={handleDeclineApplicationClick}
                    className="px-4 py-2 flex items-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300 hover:shadow-sm"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Decline Account
                  </Button>
                  <Button
                    onClick={handleAcceptApplication}
                    className="px-4 py-2 flex items-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-all duration-300 hover:shadow-sm"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Accept Account
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
              <Button
                variant="outline"
                onClick={onClose}
                className={`group px-4 py-2 flex items-center rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:shadow-sm`}
              >
                <ChevronLeft className="mr-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span>Close Details</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Image Popup (not used in this component, but kept for consistency if needed later) */}
      {/* <ImagePopup imageUrl={null} isOpen={false} onClose={() => {}} /> */}

      {/* Decline Modal */}
      <DeclineModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        account={account}
        anomalies={documentAnomalies} // This will be empty, so no anomaly section will show
        onConfirmDecline={handleConfirmDecline}
      />
    </div>
  )
}