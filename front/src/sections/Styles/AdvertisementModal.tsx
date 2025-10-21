import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { Sparkles, Upload, PiggyBank } from "lucide-react"
import { useState } from "react"

interface AdvertisementFlowModalProps {
  isOpen: boolean
  onClose: () => void
  step: number
  onNextStep: () => void
  onConfirmAdvertise: () => void
  userName?: string
  userId?: string
}

export default function AdvertisementFlowModal({
  isOpen,
  onClose,
  step,
  onNextStep,
  onConfirmAdvertise,
  userName,
  userId,
}: AdvertisementFlowModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"standard" | null>("standard")
  const [description, setDescription] = useState("")
  const [bannerImage, setBannerImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const calculateExpiration = () => {
    const now = new Date()
    now.setDate(now.getDate() + 30)
    return now.toISOString()
  }

  const handlePayNow = async () => {
    if (!selectedPlan || !description || !bannerImage) {
      alert("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Authentication required")
        setIsSubmitting(false)
        return
      }

      const expirationDate = calculateExpiration()
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

      const response = await fetch(`${API_URL}/api/advertise/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          description,
          bannerImage,
          userName,
          expiration: expirationDate,
          price: 500,
        }),
      })


      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save advertisement")
      }

      setIsSubmitting(false)
      onConfirmAdvertise()
    } catch (error) {
      console.error("Error saving advertisement:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Failed to save advertisement"}`)
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setBannerImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        {step === 1 ? (
          <DialogPanel className="w-full max-w-lg bg-white/95 rounded-3xl shadow-2xl border border-gray-100 p-8 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-blue-100 flex items-center justify-center rounded-full mb-5">
              <Sparkles className="h-10 w-10 text-sky-500" />
            </div>
            <DialogTitle className="text-xl font-medium mb-3">Advertise Your Service?</DialogTitle>
            <p className="text-gray-600 mb-6">
              Congratulations on creating your new service! Would you like to advertise it to reach more
              customers?
            </p>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
              >
                No, Thanks
              </button>
              <button
                onClick={onNextStep}
                className="px-6 py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600"
              >
                Yes, Advertise
              </button>
            </div>
          </DialogPanel>
        ) : (
          // --- Step 2: Left-Right Layout ---
          <DialogPanel className="w-full max-w-5xl bg-white/95 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row transition-all">
            {/* Left Section */}
            <div className="md:w-1/2 w-full bg-white p-8 flex flex-col justify-center text-gray-800">
              <div className="flex items-center justify-center mb-6">
                <PiggyBank strokeWidth={1.2} className="h-15 w-15 text-sky-500" />
              </div>
              <DialogTitle className="text-2xl font-medium mb-2 text-center">
                Choose <span className="text-sky-500">Advertisement Plan</span>
              </DialogTitle>
              <p className="text-center text-gray-700 mb-6">
                Select an advertisement plan to boost your service visibility.
              </p>

              <div
                className={`p-5 bg-white/80 rounded-2xl cursor-pointer shadow-sm border transition-all ${selectedPlan === "standard" ? "ring-2 ring-sky-500" : "hover:ring-1 hover:ring-sky-400"
                  }`}
                onClick={() => setSelectedPlan("standard")}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-medium">Standard Advertisement</h4>
                    <p className="text-sm text-gray-600">Reach a wider audience for 30 days.</p>
                  </div>
                  <span className="text-xl font-bold text-sky-500">₱100,000.00</span>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="md:w-1/2 w-full p-8 overflow-y-auto">
              {step === 1 && (
                <div className="flex flex-col items-center justify-center h-full text-center ">
                  <div className="w-20 h-20 bg-blue-100 flex items-center justify-center rounded-full mb-5">
                    <Sparkles className="h-10 w-10 text-sky-500" />
                  </div>
                  <DialogTitle className="text-xl font-medium mb-3">Advertise Your Service?</DialogTitle>
                  <p className="text-gray-600 mb-6">
                    Congratulations on creating your new service! Would you like to advertise it to reach more
                    customers?
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
                    >
                      No, Thanks
                    </button>
                    <button
                      onClick={onNextStep}
                      className="px-6 py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600"
                    >
                      Yes, Advertise
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && selectedPlan && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={userName || ""}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your advertisement..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Image <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-sky-400 transition-all"
                      >
                        <Upload className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {bannerImage ? "Change Image" : "Upload Banner Image"}
                        </span>
                      </label>
                      {bannerImage && (
                        <img src={bannerImage} alt="Banner preview" className="w-full h-32 object-cover rounded-lg" />
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
                    <span className="font-medium">Expiration:</span> 30 days from payment
                  </div>

                  <button
                    onClick={handlePayNow}
                    disabled={!selectedPlan || !description || !bannerImage || isSubmitting}
                    className={`w-full px-6 py-3 text-white rounded-full transition-all ${!selectedPlan || !description || !bannerImage || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-sky-500 hover:bg-sky-600"
                      }`}
                  >
                    {isSubmitting ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              )}
            </div>
          </DialogPanel>
        )}
      </div>
    </Dialog>
  )

}