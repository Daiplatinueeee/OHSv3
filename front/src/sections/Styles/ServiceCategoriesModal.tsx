import { X, ChevronRight, Users, Clock } from "lucide-react"

interface CooDetails {
  _id: string
  firstName: string
  lastName: string
  profilePicture: string | null
}

interface ServiceSubcategory {
  id: number | string
  name: string
  description: string
  price: number
  image: string
  workerCount: number
  estimatedTime: string
  category: string
  cooDetails?: CooDetails
}

interface ServiceCategoriesModalProps {
  isOpen: boolean
  onClose: () => void
  categoryName: string
  subcategories: ServiceSubcategory[]
  onSelectSubcategory: (subcategory: ServiceSubcategory) => void
}

function ServiceCategoriesModal({
  isOpen,
  onClose,
  categoryName,
  subcategories,
  onSelectSubcategory,
}: ServiceCategoriesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header section */}
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-medium text-gray-700">{categoryName} Types</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-grow p-4 sm:p-6">
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Please select the specific type of {categoryName.toLowerCase()} you need. Each service has different pricing
            and worker requirements.
          </p>

          {subcategories.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm sm:text-base">No service types available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onSelectSubcategory(subcategory)}
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={subcategory.image || "/placeholder.svg"}
                      alt={subcategory.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-medium text-black mb-1 sm:mb-2 line-clamp-2">{subcategory.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{subcategory.description}</p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 text-gray-600 text-xs sm:text-sm">
                      <div className="flex items-center mb-1 sm:mb-0">
                        <Users className="h-4 w-4 mr-1 text-sky-600" />
                        <span>
                          {subcategory.workerCount} worker{subcategory.workerCount > 1 ? "s" : ""} needed
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-sky-600" />
                        <span>{subcategory.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm sm:text-base">
                      <span className="font-medium text-black">₱{subcategory.price.toLocaleString()}</span>
                      <button className="text-sky-500 flex items-center transition-all duration-300 hover:text-blue-600 hover:translate-x-1">
                        View Providers <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer section */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 sm:px-6 py-2 sm:py-3 bg-sky-500 rounded-full text-white hover:bg-sky-600 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceCategoriesModal