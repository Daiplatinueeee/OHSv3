import { Card } from "@/components/ui/card"
import { FileTextIcon, LinkIcon, ImageIcon, FilmIcon, FolderIcon, ChevronRightIcon } from "lucide-react"

export function SharedFilesSidebar() {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col p-4">
      {/* Group/Chat Info */}
      <div className="flex flex-col items-center mb-6 mt-10">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-3">
          <img src="/placeholder.svg?height=96&width=96" alt="Real estate deals" className="object-cover" />
        </div>
        <p className="font-medium text-gray-900">Username</p>
        <p className="text-sm text-gray-500">10 members</p>
      </div>

      {/* File/Link Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 flex flex-col items-center justify-center bg-blue-50 border-blue-200">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
            <FileTextIcon className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-blue-800">231</p>
          <p className="text-xs text-blue-600">All files</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center bg-gray-50 border-gray-200">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mb-2">
            <LinkIcon className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-lg font-bold text-gray-800">45</p>
          <p className="text-xs text-gray-600">All links</p>
        </Card>
      </div>

      {/* File Type Categories */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">File type</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-md mr-3">
              <FileTextIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Documents</p>
              <p className="text-xs text-gray-500">126 files, 193MB</p>
            </div>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-md mr-3">
              <ImageIcon className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Photos</p>
              <p className="text-xs text-gray-500">53 files, 321MB</p>
            </div>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-md mr-3">
              <FilmIcon className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Movies</p>
              <p className="text-xs text-gray-500">3 files, 210MB</p>
            </div>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-md mr-3">
              <FolderIcon className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Other</p>
              <p className="text-xs text-gray-500">49 files, 194MB</p>
            </div>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
}