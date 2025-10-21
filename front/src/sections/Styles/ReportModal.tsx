import type React from "react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle2, ImageIcon, Plus } from "lucide-react"
import axios from "axios"

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  modalVisible,
  seller,
  reportReason,
  reportDetails,
  showSuccessModal,
  onClose,
  onReasonChange,
  onDetailsChange,
  onSubmit,
  getSellerName,
  getJobTitle,
  disableReasonChange,
}) => {
  const [profilePic, setProfilePic] = useState<string | null>(seller?.profilePicture || null)
  const [proofImages, setProofImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [customMode, setCustomMode] = useState(false)
  const [originalPic, setOriginalPic] = useState<string | null>(seller?.profilePicture || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "auto"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  useEffect(() => {
    // Handle dynamic switch for ticket mode
    if (reportReason === "payment_not_received") {
      setCustomMode(true)
      setProfilePic("/handygo-logo.jpg") // use placeholder
    } else {
      setCustomMode(false)
      setProfilePic(originalPic || seller?.profilePicture || null)
    }
  }, [reportReason, originalPic, seller])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!seller?.id) return
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`http://localhost:3000/api/user/profile/${seller.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data?.user?.profilePicture) {
          setProfilePic(response.data.user.profilePicture)
          setOriginalPic(response.data.user.profilePicture)
        }
      } catch (err) {
        console.error("Failed to fetch profile picture:", err)
      }
    }
    fetchProfile()
  }, [seller?.id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newFiles = [...proofImages, ...files]
      setProofImages(newFiles)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviewUrls(newPreviews)
      setSelectedIndex(newPreviews.length - files.length)
    }
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = proofImages.filter((_, i) => i !== index)
    const updatedPreviews = previewUrls.filter((_, i) => i !== index)
    setProofImages(updatedImages)
    setPreviewUrls(updatedPreviews)
    if (selectedIndex === index) setSelectedIndex(0)
    else if (selectedIndex > index) setSelectedIndex(selectedIndex - 1)
  }

  const handleSubmit = async () => {
    if (!reportReason || proofImages.length === 0) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")

      const usersData = localStorage.getItem("user")
      const user = usersData ? JSON.parse(usersData) : null
      const userId = user?.id || user?._id
      const userEmail = user?.email
      const userName = user?.username || `${user?.firstName} ${user?.lastName}`

      if (!token || !userId || !userEmail) {
        console.error("[v0] Missing authentication data:", { token: !!token, userId: !!userId, userEmail: !!userEmail })
        alert("Authentication error. Please log in again.")
        return
      }

      console.log("[v0] Starting report submission with:", {
        userId,
        userEmail,
        userName,
        sellerId: seller?.id,
        sellerName: getSellerName(seller),
        reportReason,
        imageCount: proofImages.length,
      })

      // Step 1: Upload all images and collect their URLs
      const uploadedImageUrls: string[] = []
      for (const file of proofImages) {
        const formData = new FormData()
        formData.append("file", file)

        console.log("[v0] Uploading image:", file.name)

        const uploadResponse = await axios.post("http://localhost:3000/api/upload/image", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })

        console.log("[v0] Image upload response:", uploadResponse.data)

        if (uploadResponse.data?.url) {
          uploadedImageUrls.push(uploadResponse.data.url)
        }
      }

      if (uploadedImageUrls.length === 0) {
        throw new Error("Failed to upload images")
      }

      console.log("[v0] All images uploaded successfully:", uploadedImageUrls)

      // Step 2: Submit report with image URLs
      const reportPayload = {
        reporterId: userId,
        reporterEmail: userEmail,
        reporterName: userName || userEmail.split("@")[0],
        sellerId: seller?.id,
        sellerName: getSellerName(seller),
        sellerEmail: seller?.email || null,
        reportReason,
        reportDetails,
        proofImages: uploadedImageUrls,
      }

      console.log("[v0] Submitting report with payload:", reportPayload)

      const reportResponse = await axios.post("http://localhost:3000/api/reports/create", reportPayload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("[v0] Report submitted successfully:", reportResponse.data)
      onSubmit(proofImages)
    } catch (error) {
      console.error("[v0] Error submitting report:", error)
      if (axios.isAxiosError(error)) {
        console.error("[v0] Response status:", error.response?.status)
        console.error("[v0] Response data:", error.response?.data)
        console.error("[v0] Request data:", error.config?.data)
      }
      alert("Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
            style={{ opacity: modalVisible ? 1 : 0 }}
            onClick={onClose}
          />
          <div
            className="relative bg-white w-full h-full flex flex-col transition-all duration-500 transform"
            style={{
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? "scale(1)" : "scale(0.98)",
            }}
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 z-20 transition-colors"
              aria-label="Close report modal"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center justify-center py-8 border-b border-gray-200">
              <h1 className="text-3xl font-medium text-gray-800">
                {customMode ? "Submit a Ticket" : `Report ${getSellerName(seller)}`}
              </h1>
              <p className="text-gray-500 mt-2">
                {customMode
                  ? "Let us know about your missing transaction so we can assist you."
                  : "Help us maintain a safe and trustworthy community."}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-12 py-8">
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> False reports may result in penalties to your account.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-lg flex-shrink-0">
                      {profilePic ? (
                        <img
                          src={profilePic || "/placeholder.svg"}
                          alt={customMode ? "HandyGo" : getSellerName(seller)}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl font-medium bg-gradient-to-br from-sky-100 to-blue-100">
                          {customMode ? "H" : getSellerName(seller).charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 text-lg">
                        {customMode ? "HandyGo" : getSellerName(seller)}
                      </h3>
                      <p className="text-gray-600 text-[15px]">{customMode ? "Management" : getJobTitle()}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {customMode
                          ? "Minglanilla, Cebu"
                          : typeof seller.location === "object"
                            ? seller.location?.name || "Unknown location"
                            : seller.location || "Unknown location"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-base font-medium text-gray-800 mb-3">
                      Reason for report <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => onReasonChange(e.target.value)}
                      disabled={disableReasonChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-700 text-base"
                    >
                      <option value="">Select a reason</option>
                      <option value="spam">Spam or misleading information</option>
                      <option value="inappropriate">Inappropriate content or behavior</option>
                      <option value="scam">Suspected scam or fraud</option>
                      <option value="harassment">Harassment or abuse</option>
                      <option value="fake">Fake profile or impersonation</option>
                      <option value="quality">Poor service quality</option>
                      <option value="pricing">Misleading pricing</option>
                      <option value="payment_not_received">Payment not received</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-8">
                    <label className="block text-base font-medium text-gray-800 mb-3">
                      Proof of report <span className="text-red-500">*</span>
                    </label>

                    {previewUrls.length === 0 ? (
                      <div className="relative w-full h-56 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition">
                        <input
                          id="proofImage"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-gray-600 text-sm">Click or drag to upload image proofs</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-56 rounded-lg overflow-hidden border border-gray-300">
                        <img
                          src={previewUrls[selectedIndex] || "/placeholder.svg"}
                          alt="Main Proof"
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                        <button
                          onClick={() => {
                            setProofImages([])
                            setPreviewUrls([])
                            setSelectedIndex(0)
                          }}
                          className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-md text-sm hover:bg-black/70 transition"
                        >
                          Remove All
                        </button>
                      </div>
                    )}

                    {previewUrls.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-3">
                          {previewUrls.map((url, index) => (
                            <div
                              key={index}
                              className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer ${
                                selectedIndex === index ? "border-sky-500 ring-2 ring-sky-300" : "border-gray-200"
                              }`}
                              onClick={() => setSelectedIndex(index)}
                            >
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Proof ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveImage(index)
                                }}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70 transition"
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          <label
                            htmlFor="addProofImage"
                            className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                          >
                            <Plus className="w-6 h-6 text-gray-500" />
                          </label>
                          <input
                            id="addProofImage"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}

                    {proofImages.length === 0 && (
                      <p className="text-sm text-red-500 mt-2">
                        Please attach at least one image proof before submitting.
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-base font-medium text-gray-800 mb-3">Additional details</label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => onDetailsChange(e.target.value)}
                      placeholder="Describe what happened..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none text-gray-700 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-12 py-6 bg-white">
              <div className="flex justify-between items-center max-w-2xl mx-auto">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!reportReason || proofImages.length === 0 || isSubmitting}
                  className="px-8 py-2.5 rounded-lg font-medium transition-all bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : customMode ? "Submit Ticket" : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {showSuccessModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <div className="mx-auto max-w-md w-full bg-white rounded-3xl overflow-hidden transform transition-all border border-white/20 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Report Submitted Successfully</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Thank you for helping us maintain a safe community.
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

interface ReportModalProps {
  isOpen: boolean
  modalVisible: boolean
  seller: any
  reportReason: string
  reportDetails: string
  showSuccessModal: boolean
  onClose: () => void
  onReasonChange: (reason: string) => void
  onDetailsChange: (details: string) => void
  onSubmit: (proofImages: File[]) => void
  getSellerName: (seller: any) => string
  getJobTitle: () => string
  disableReasonChange?: boolean
}

export default ReportModal