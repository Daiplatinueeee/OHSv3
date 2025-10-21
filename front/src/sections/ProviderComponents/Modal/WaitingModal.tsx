import { Dialog } from "@headlessui/react"
import { Users } from "lucide-react"
import type { Service } from "../Service"

interface WorkersWaitingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedService: Service | null
  setIsModalOpen: (isOpen: boolean) => void
}

export function WorkersWaitingModal({ isOpen, onClose, selectedService, setIsModalOpen }: WorkersWaitingModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-blue-200 p-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 animate-[pulse_2s_ease-in-out_infinite]">
              <Users className="h-10 w-10 text-blue-500 animate-[bounceIn_0.6s_ease-out]" />
            </div>

            <Dialog.Title className="text-xl font-medium text-blue-600 mb-2 animate-[slideInUp_0.4s_ease-out]">
              Worker Assignment Status
            </Dialog.Title>

            {selectedService && (
              <>
                <p className="text-gray-600 mb-4 animate-[fadeIn_0.5s_ease-out_0.2s_both]">
                  <span className="font-medium">
                    {selectedService.workersAssigned} of {selectedService.workersRequired} workers assigned
                  </span>
                </p>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${((selectedService.workersAssigned || 0) / (selectedService.workersRequired || 1)) * 100}%`,
                    }}
                  ></div>
                </div>

                {selectedService.workersRequired &&
                selectedService.workersAssigned &&
                selectedService.workersRequired > selectedService.workersAssigned ? (
                  <p className="text-gray-700 font-medium mb-6 animate-[fadeIn_0.5s_ease-out_0.3s_both]">
                    {selectedService.workersRequired - selectedService.workersAssigned} more worker(s) needed
                  </p>
                ) : (
                  <p className="text-green-700 font-medium mb-6 animate-[fadeIn_0.5s_ease-out_0.3s_both]">
                    All required workers have been assigned!
                  </p>
                )}
              </>
            )}

            <div className="flex space-x-4 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
              >
                Close
              </button>
              {selectedService &&
                selectedService.workersAssigned &&
                selectedService.workersRequired &&
                selectedService.workersAssigned < selectedService.workersRequired && (
                  <button
                    onClick={() => {
                      onClose()
                      setIsModalOpen(true)
                    }}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 font-medium text-sm"
                  >
                    Assign Another Worker
                  </button>
                )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}