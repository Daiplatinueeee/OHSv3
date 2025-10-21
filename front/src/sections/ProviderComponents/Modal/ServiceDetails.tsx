import { Dialog } from "@headlessui/react"
import { Calendar, Clock, MapPin, AlertCircle, Check, X, Users } from "lucide-react"
import type { Service } from "../Service"

interface ServiceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedService: Service | null
  isLoading: boolean
  handleAcceptService: (serviceId: number) => void
  handleCancelService: (serviceId: number) => void
  handleTrackService: (service: Service) => void
  getDaysRemaining: (autoCancelDate: string) => number
}

export function ServiceDetailsModal({
  isOpen,
  onClose,
  selectedService,
  isLoading,
  handleAcceptService,
  handleCancelService,
  handleTrackService,
  getDaysRemaining,
}: ServiceDetailsModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20">
          {selectedService && (
            <div className="flex flex-col h-full">
              {/* Image Section - Top */}
              <div className="relative h-48 w-full">
                <img
                  src={selectedService.image || "/placeholder.svg"}
                  alt={selectedService.serviceName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

                {/* Service name overlay on image */}
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-light text-white tracking-tight">{selectedService.serviceName}</h3>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 
                      ${
                        selectedService.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedService.status === "ongoing"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-green-100 text-green-800"
                      }`}
                  >
                    {selectedService.status === "pending"
                      ? "Pending"
                      : selectedService.status === "ongoing"
                        ? "In Progress"
                        : "Completed"}
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 bg-black/20 backdrop-blur-xl p-2 rounded-full hover:bg-black/30 transition-all duration-200 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content Section - Below image, scrollable */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Customer</h3>
                      <p className="mt-1 text-base font-medium text-gray-900">{selectedService.customerName}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Created On</h3>
                      <p className="mt-1 text-base font-medium text-gray-900">{selectedService.createdAt}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Date & Time</h3>
                      <p className="mt-1 text-base font-medium text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {selectedService.date}, {selectedService.time}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Location</h3>
                      <p className="mt-1 text-base font-medium text-gray-900 flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{selectedService.location}</span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Workers Required</h3>
                      <p className="mt-1 text-base font-medium text-gray-900 flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${
                            (selectedService.workersAssigned || 0) === 0
                              ? "bg-gray-100 text-gray-800"
                              : (selectedService.workersAssigned || 0) < (selectedService.workersRequired || 1)
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {selectedService.workersAssigned || 0}/{selectedService.workersRequired || 1} Workers
                        </span>
                      </p>
                    </div>
                    {selectedService.status === "pending" && (
                      <div>
                        <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Auto-Cancellation</h3>
                        <p className="mt-1 text-base font-medium text-gray-900 flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          {selectedService.autoCancelDate}
                        </p>
                      </div>
                    )}
                    {selectedService.status === "completed" && selectedService.completedDate && (
                      <div>
                        <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Completed On</h3>
                        <p className="mt-1 text-base font-medium text-gray-900 flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {selectedService.completedDate}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-4">Payment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-medium">₱{selectedService.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Distance Charge</span>
                        <span className="font-medium">₱{selectedService.distanceCharge.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-medium pt-3 border-t border-gray-200 mt-3">
                        <span>Total</span>
                        <span className="text-sky-600">₱{selectedService.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedService.status === "pending" && getDaysRemaining(selectedService.autoCancelDate) <= 1 && (
                      <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl p-4 text-red-800 text-sm">
                        <p className="font-medium flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          This service request will be automatically cancelled on {selectedService.autoCancelDate} if
                          not accepted.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer with buttons - Fixed at bottom */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex space-x-4">
                  {selectedService.status === "pending" && (
                    <>
                      <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAcceptService(selectedService.id)}
                        disabled={isLoading}
                        className={`flex-1 px-6 py-3 text-white rounded-full transition-all duration-200 font-medium text-sm ${
                          isLoading ? "bg-sky-400 cursor-wait" : "bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200"
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
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
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <Check className="h-4 w-4 mr-2" />
                            {(selectedService.workersAssigned || 0) === 0
                              ? "Accept Service"
                              : `Assign Worker (${selectedService.workersAssigned}/${selectedService.workersRequired})`}
                          </span>
                        )}
                      </button>
                    </>
                  )}

                  {selectedService.status === "ongoing" && (
                    <>
                      <button
                        onClick={() => handleCancelService(selectedService.id)}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                      >
                        Cancel Service
                      </button>
                      <button
                        onClick={() => handleTrackService(selectedService)}
                        className="flex-1 px-6 py-3 text-white rounded-full transition-all duration-200 font-medium text-sm bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200"
                      >
                        <span className="flex items-center justify-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Track Customer
                        </span>
                      </button>
                    </>
                  )}

                  {selectedService.status === "completed" && (
                    <button
                      onClick={onClose}
                      className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}