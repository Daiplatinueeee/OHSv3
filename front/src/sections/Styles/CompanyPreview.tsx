import type React from "react"
import { useState, useEffect } from "react"
import { Star, MessageCircle, Flag, Mail } from "lucide-react"
import CompanyProfile from "../COO-tabs/CompanyProfile"
import { Link } from "react-router-dom"

import ReportModal from "../Styles/ReportModal"

interface CompanyPreviewProps {
  seller: {
    id: number | string
    name?: string
    firstName?: string
    lastName?: string
    middleName?: string
    username?: string
    businessName?: string
    profilePicture?: string | null
    totalRating: number
    totalReviews?: number
    reviews: number
    location: string
    startingRate: number
    ratePerKm: number
    badges: string[]
    description: string
    workerCount?: number
    estimatedTime?: string
    isVerified?: boolean
  }
  isVisible: boolean
  position: { x: number; y: number }
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void
}

function CompanyPreview({ seller, isVisible, position, onMouseLeave }: CompanyPreviewProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDetails, setReportDetails] = useState("")
  const [, setReportSubmitted] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    if (showReportModal) {
      setModalVisible(true)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showReportModal])

  if (!isVisible) return null

  const getSellerName = (seller: any) => {
    if (seller?.name) return seller.name
    if (seller?.username) return seller.username
    if (seller?.businessName) return seller.businessName

    const nameParts = []
    if (seller?.firstName) nameParts.push(seller.firstName)
    if (seller?.middleName) nameParts.push(seller.middleName)
    if (seller?.lastName) nameParts.push(seller.lastName)

    if (nameParts.length > 0) {
      return nameParts.join(" ")
    }

    return "Service Provider"
  }

  const getJobTitle = () => {
    if (seller.badges.includes("COO")) return "Company Owner"
    return "Service Provider"
  }

  const getDescription = () => {
    return seller.description || "Professional service provider with expertise in delivering quality solutions."
  }

  const handleViewCompany = () => {
    setShowProfile(true)
  }

  const handleBackToPreview = () => {
    setShowProfile(false)
  }

  const handleReport = () => {
    setShowReportModal(true)
  }

  const handleCloseReportModal = () => {
    setModalVisible(false)
    setTimeout(() => {
      setShowReportModal(false)
      setReportReason("")
      setReportDetails("")
      setReportSubmitted(false)
    }, 300)
  }

  const handleSubmitReport = () => {
    if (reportReason) {
      console.log("Report submitted:", {
        sellerId: seller.id,
        sellerName: getSellerName(seller),
        reason: reportReason,
        details: reportDetails,
      })
      setModalVisible(false)
      setTimeout(() => {
        setShowSuccessModal(true)
      }, 300)
      setTimeout(() => {
        setShowSuccessModal(false)
        setShowReportModal(false)
        setReportReason("")
        setReportDetails("")
        setReportSubmitted(false)
      }, 3000)
    }
  }

  const handleMailClick = () => {
    const subject = encodeURIComponent(`Inquiry about ${getSellerName(seller)}`)
    const body = encodeURIComponent(
      `Hello ${getSellerName(seller)},\n\nI am interested in learning more about your services.\n\nBest regards`
    )
    window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`
  }

  if (showProfile) {
    return (
      <div className="fixed inset-0 z-[70] bg-white overflow-y-auto">
        <CompanyProfile seller={seller} onBack={handleBackToPreview} />
      </div>
    )
  }

  return (
    <div
      className="fixed z-[60] pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-10%, -60%)",
      }}
      data-company-preview="true"
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white/98 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/60 w-80 animate-in fade-in-0 zoom-in-95 duration-200 hover:shadow-3xl transition-shadow">
        {/* Header with profile */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-lg">
                {seller.profilePicture ? (
                  <img
                    src={seller.profilePicture || "/placeholder.svg"}
                    alt={getSellerName(seller)}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg font-medium bg-gradient-to-br from-sky-100 to-blue-100">
                    {getSellerName(seller).charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-[18px] leading-tight">{getSellerName(seller)}</h3>
              <p className="text-gray-600 text-sm">{getJobTitle()}</p>
            </div>
          </div>
          <button onClick={handleReport} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer group">
            <Flag className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
            {getDescription()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="font-medium text-gray-900 mb-1">{seller.reviews}</div>
            <p className="text-xs text-gray-500">Reviews</p>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900 mb-1">{seller.badges}</div>
            <p className="text-xs text-gray-500">Badge</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="font-medium text-gray-900">{seller.totalRating}</span>
            </div>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewCompany}
            className="flex-1 bg-sky-500 text-white py-2.5 px-4 rounded-full font-medium hover:bg-sky-600 transition-colors cursor-pointer shadow-sm hover:shadow-md"
          >
            View Company
          </button>
          <button onClick={handleMailClick} className="p-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors pointer-events-auto shadow-sm hover:shadow-md cursor-pointer">
            <Mail className="h-4 w-4 text-gray-600" />
          </button>
          <Link
            to="/chat"
            className="p-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors pointer-events-auto shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center"
          >
            <MessageCircle className="h-4 w-4 text-gray-600" />
          </Link>
        </div>
      </div>

      <ReportModal
        isOpen={showReportModal}
        modalVisible={modalVisible}
        seller={seller}
        reportReason={reportReason}
        reportDetails={reportDetails}
        showSuccessModal={showSuccessModal}
        onClose={handleCloseReportModal}
        onReasonChange={setReportReason}
        onDetailsChange={setReportDetails}
        onSubmit={handleSubmitReport}
        getSellerName={getSellerName}
        getJobTitle={getJobTitle}
      />

    </div>
  )
}

export default CompanyPreview