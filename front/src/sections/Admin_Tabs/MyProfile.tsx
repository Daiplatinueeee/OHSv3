import type React from "react"
import { useState } from "react"
import MyFloatingDock from "../Styles/MyFloatingDock"
import { Dialog } from "@headlessui/react"
import { MapPin, Camera, X } from "lucide-react"
import image1 from "../../assets/No_Image_Available.jpg"

interface PersonalInfo {
  id: number
  type: string
  title: string
  description: string
  startDate?: string
  endDate?: string
  location?: string
  organization?: string
  hasNotification?: boolean
  notificationCount?: number
  image?: string
}

function MyProfile() {
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedInfo,] = useState<PersonalInfo | null>(null)
  const [editedInfo, setEditedInfo] = useState<Partial<PersonalInfo>>({})
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const userDetails = {
    name: "John Doe",
    location: "San Francisco, CA",
    description:
      "Professional software developer with 5+ years of experience in web and mobile application development. Passionate about creating intuitive user experiences.",
    avatar: "https://uploads.dailydot.com/2024/07/side-eye-cat.jpg?q=65&auto=format&w=1200&ar=2:1&fit=crop",
    coverPhoto: "https://cdn.pixabay.com/photo/2016/12/05/21/08/cologne-1884931_1280.jpg",
    followers: 1.2,
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    birthday: "1990-05-15",
    gender: "Male",
  }

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo[]>([
  ])

  const handleSaveInfo = () => {
    if (!selectedInfo) return

    const updatedInfo = personalInfo.map((info) => (info.id === selectedInfo.id ? { ...info, ...editedInfo } : info))

    setPersonalInfo(updatedInfo)
    setIsEditModalOpen(false)
  }

  const handleConfirmDelete = () => {
    if (!selectedInfo) return

    const filteredInfo = personalInfo.filter((info) => info.id !== selectedInfo.id)

    setPersonalInfo(filteredInfo)
    setIsDeleteConfirmOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedInfo({
      ...editedInfo,
      [name]: value,
    })
  }

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedInfo({
      ...editedInfo,
      [name]: value,
    })
  }

  const renderTabContent = () => {
    if (activeTab === "personal") {
      return (
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Full Name</h4>
                <p className="text-gray-900">{userDetails.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                <p className="text-gray-900">{userDetails.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                <p className="text-gray-900">{userDetails.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                <p className="text-gray-900 flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  {userDetails.location}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Birthday</h4>
                <p className="text-gray-900">{new Date(userDetails.birthday).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Gender</h4>
                <p className="text-gray-900">{userDetails.gender}</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
              <p className="text-gray-900">{userDetails.description}</p>
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === "security") {
      return (
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-6">Change Password</h3>
          <form className="space-y-4 max-w-md">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter your new password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Confirm your new password"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )
    }

    if (activeTab === "delete") {
      return (
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-2 text-red-600">Delete Account</h3>
          <p className="text-gray-600 mb-6">Once you delete your account, there is no going back. Please be certain.</p>

          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <h4 className="font-medium text-red-800 mb-2">Before you proceed, please understand:</h4>
              <ul className="list-disc pl-5 space-y-2 text-red-700 text-sm">
                <li>All your personal information will be permanently deleted</li>
                <li>Your service listings will be removed from the platform</li>
                <li>Your booking history will be anonymized</li>
                <li>You will lose access to any pending payments</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-medium mb-3">Deletion Process:</h4>
              <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                <li>
                  <p className="font-medium">Request Account Deletion</p>
                  <p className="text-sm text-gray-600">
                    Submit your request by clicking the "Delete Account" button below.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Verification</p>
                  <p className="text-sm text-gray-600">
                    We'll send a verification code to your email address to confirm your identity.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Confirmation</p>
                  <p className="text-sm text-gray-600">
                    Enter the verification code and confirm your decision to delete your account.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Account Deletion</p>
                  <p className="text-sm text-gray-600">
                    Your account will be scheduled for deletion. This process may take up to 30 days to complete.
                  </p>
                </li>
              </ol>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-700 mb-4">
                To proceed with account deletion, please type <span className="font-medium">"DELETE MY ACCOUNT"</span>{" "}
                in the field below:
              </p>
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type DELETE MY ACCOUNT"
                />
              </div>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === "booking") {
      return (
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-6">Booking Settings</h3>
          <p className="text-gray-600 mb-6">Configure system-wide booking timers and auto cancellation settings.</p>

          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Important Information:</h4>
              <ul className="list-disc pl-5 space-y-2 text-blue-700 text-sm">
                <li>Changes to these settings will affect all future bookings</li>
                <li>Timer values are in minutes</li>
                <li>Booking settings affect platform revenue</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Booking Timer Settings */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-timer"
                    >
                      <path d="M10 2h4" />
                      <path d="M12 14v-4" />
                      <path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6" />
                      <path d="M9 17H4v5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Booking Timer</h4>
                    <p className="text-sm text-gray-500">Time before booking is automatically processed</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="booking-timer" className="block text-sm font-medium text-gray-700 mb-1">
                      Timer Duration (minutes)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="booking-timer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        defaultValue={1}
                        min={1}
                        max={1440}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Default: 1 minute. Recommended range: 1-5 minutes.</p>
                  </div>
                </div>
                <div className="pt-2 mt-5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="enable-notifications" className="text-sm font-medium text-gray-700">
                      Send Reminder Notifications
                    </label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" id="enable-notifications" defaultChecked className="sr-only" />
                      <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                      <style>{`
                          input:checked ~ .dot {
                            transform: translateX(100%);
                          }
                          input:checked ~ .block {
                            background-color: #3b82f6;
                          }
                        `}</style>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Send notifications to customers before auto-cancellation.
                  </p>
                </div>
              </div>

              {/* Auto-Cancellation Timer Settings */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-alarm-clock-off"
                    >
                      <path d="M6.87 6.87A8 8 0 1 0 21 12" />
                      <path d="M19.71 19.71a8 8 0 0 1-11.31-11.31" />
                      <path d="M22 6 L6 22" />
                      <path d="M10 4H4v6" />
                      <path d="M12 9v1" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Auto-Cancellation Timer</h4>
                    <p className="text-sm text-gray-500">Time before unpaid bookings are automatically cancelled</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="cancellation-timer" className="block text-sm font-medium text-gray-700 mb-1">
                      Timer Duration (minutes)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="cancellation-timer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        defaultValue={720}
                        min={5}
                        max={1440}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Default: 720 minutes (12 hours). Recommended range: 4,320 minutes (3 days).
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="enable-notifications" className="text-sm font-medium text-gray-700">
                        Send Reminder Notifications
                      </label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="enable-notifications" defaultChecked className="sr-only" />
                        <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                        <style>{`
                          input:checked ~ .dot {
                            transform: translateX(100%);
                          }
                          input:checked ~ .block {
                            background-color: #3b82f6;
                          }
                        `}</style>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Send notifications to customers before auto-cancellation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Reset to Defaults
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Dock */}
      <div className="sticky top-0 z-40 flex">
        <MyFloatingDock />
      </div>

      {/* User Profile Section */}
      <div className="max-w-7xl mx-auto font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
        {/* Cover Photo */}
        <div className="relative h-80 overflow-hidden rounded-b-3xl">
          <img src={userDetails.coverPhoto || image1} alt="Cover" className="w-full h-full object-cover" />
          <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all">
            <Camera className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Info with Stats */}
        <div className="relative px-4 pb-8">
          <div className="absolute -top-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                <img src={userDetails.avatar || image1} alt={userDetails.name} className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-50">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="pt-20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{userDetails.name}</h1>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    Admin
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{userDetails.location}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all">
                Edit Profile
              </button>
            </div>

            <p className="text-gray-600 max-w-2xl mb-6">{userDetails.description}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab("personal")}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "personal"
                  ? "border-sky-500 text-sky-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-user"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "security"
                  ? "border-sky-500 text-sky-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-lock"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Security
              </button>
              <button
                onClick={() => setActiveTab("delete")}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "delete"
                  ? "border-sky-500 text-sky-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trash-2"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
                Delete Account
              </button>
              <button
                onClick={() => setActiveTab("booking")}
                className={`py-4 px-6 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "booking"
                  ? "border-sky-500 text-sky-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-settings"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Booking Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 py-8 mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {activeTab === "personal"
                ? "Personal Information"
                : activeTab === "security"
                  ? "Security Settings"
                  : activeTab === "booking"
                    ? "Booking Settings"
                    : "Delete Account"}
            </h2>
            {activeTab === "personal" && (
              <button className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all">
                Edit Profile
              </button>
            )}
          </div>

          {renderTabContent()}
        </div>
      </div>

      {/* Edit Info Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row">
              {/* Preview Section */}
              <div className="md:w-2/5 bg-gray-50 p-6 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>

                <div className="flex-1 flex flex-col">
                  <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gray-200 border border-gray-300">
                    <img
                      src={editedInfo.image || image1}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = image1
                      }}
                    />
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
                    <h4 className="text-xl font-semibold mb-2">{editedInfo.title || "Title"}</h4>
                    {editedInfo.organization && (
                      <p className="text-gray-700 text-sm mb-1">
                        {editedInfo.organization} {editedInfo.location && `• ${editedInfo.location}`}
                      </p>
                    )}
                    {editedInfo.startDate && (
                      <p className="text-gray-600 text-sm mb-3">
                        {new Date(editedInfo.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })}{" "}
                        -
                        {editedInfo.endDate === "Present"
                          ? " Present"
                          : editedInfo.endDate
                            ? ` ${new Date(editedInfo.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}`
                            : ""}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-4">
                      {editedInfo.description || "Description will appear here."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="md:w-3/5 p-6 border-t md:border-t-0 md:border-l border-gray-200">
                <div className="flex justify-between items-start mb-6">
                  <Dialog.Title className="text-xl font-semibold">
                    Edit{" "}
                    {selectedInfo?.type
                      ? selectedInfo.type.charAt(0).toUpperCase() + selectedInfo.type.slice(1)
                      : "Info"}
                  </Dialog.Title>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selectedInfo && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSaveInfo()
                    }}
                    className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
                  >
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={editedInfo.title || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        id="image"
                        name="image"
                        value={editedInfo.image || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Enter image URL or leave blank for default"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter a valid image URL to see the preview update in real-time
                      </p>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={editedInfo.description || ""}
                        onChange={handleTextAreaChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Delete{" "}
                  {selectedInfo?.type ? selectedInfo.type.charAt(0).toUpperCase() + selectedInfo.type.slice(1) : "Info"}
                </Dialog.Title>
                <button onClick={() => setIsDeleteConfirmOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selectedInfo && (
                <div>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <span className="font-semibold">{selectedInfo.title}</span>? This
                    action cannot be undone.
                  </p>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}

export default MyProfile