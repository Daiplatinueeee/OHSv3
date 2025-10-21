import { Dialog } from "@headlessui/react"
import ProviderSimulation from "../../Styles/CustomerTrackingMap"
import type { Service } from "../Service"

interface MapSimulationModalProps {
  isOpen: boolean
  onClose: () => void
  serviceBeingTracked: Service | null
  onSimulationComplete: () => void
}

export function MapSimulationModal({
  isOpen,
  onClose,
  serviceBeingTracked,
  onSimulationComplete,
}: MapSimulationModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        <Dialog.Panel className="mx-auto max-w-5xl w-full h-[85vh] bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20">
          {serviceBeingTracked && (
            <ProviderSimulation
              customerName={serviceBeingTracked.customerName}
              customerLocation={serviceBeingTracked.location}
              onSimulationComplete={onSimulationComplete}
              onClose={onClose}
            />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}