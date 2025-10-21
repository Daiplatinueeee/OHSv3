import { AlertTriangle } from "lucide-react" 

interface OutOfBoundaryModalProps {
  isOpen: boolean
  onClose: () => void
  onContactCustomerService: () => void
}

export default function OutOfBoundaryModal({ isOpen, onClose, onContactCustomerService }: OutOfBoundaryModalProps) {
  if (!isOpen) return null

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

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      {/* Include animation keyframes */}
      <style>{keyframes}</style>

      <div
        className="mx-auto max-w-md w-full bg-white rounded-4xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
        style={{ animation: "fadeIn 0.5s ease-out" }}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6" // Changed background to yellow for warning
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          >
            <AlertTriangle className="h-10 w-10 text-yellow-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
          </div>

          <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
            Location Out of Service Area
          </h3>

          <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
            The selected location is outside our current service boundary for Philippines. Please select a location within
            the designated area. If you believe this is an error or need assistance, please contact our customer
            service.
          </p>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-medium shadow-sm hover:bg-gray-300 active:scale-95 transition-all duration-200"
              style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
            >
              OK
            </button>
            <button
              onClick={onContactCustomerService}
              className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium shadow-sm hover:bg-blue-600 active:scale-95 transition-all duration-200"
              style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
            >
              Contact Customer Service
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}