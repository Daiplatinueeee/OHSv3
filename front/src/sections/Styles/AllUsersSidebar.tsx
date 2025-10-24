"use client"

import { useState, useEffect } from "react"
import { MessageCircleQuestion, Search } from "lucide-react"
import logo from "@/assets/Logo/12.png"

interface User {
  id: string
  firstName?: string
  lastName?: string
  businessName?: string
  email: string
  profile: string
}

interface OnlineUser {
  id: string
  username: string
  profilePicture?: string
}

interface AllUsersSidebarProps {
  onUserSelect?: (user: User) => void
  onlineUsers?: OnlineUser[]
}

export function AllUsersSidebar({ onUserSelect, onlineUsers = [] }: AllUsersSidebarProps) {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const usersPerPage = 4

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required")
        setIsLoading(false)
        return
      }

      const response = await fetch("http://localhost:3000/api/users/all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setAllUsers(data.users)
      } else {
        setError(data.message || "Failed to fetch users")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const getDisplayName = (user: User) => {
    if (user.businessName) {
      return user.businessName
    }
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim()
    return fullName || "Unknown User"
  }

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.some((u) => u.id === userId)
  }

  const filteredUsers = allUsers.filter((user) => {
    const displayName = getDisplayName(user)
    return (
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col p-5 overflow-y-auto shadow-sm font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="flex flex-col items-center mb-6">
        <img src={logo || "/placeholder.svg"} alt="Logo" className="w-100 h-40 mb-[-5px] mt-[-10px] bg-white" />
        <h2 className="text-lg font-medium text-gray-900 text-center">
          All Users Using <span className="text-sky-500">HandyGo</span>
        </h2>
        <p className="text-sm text-gray-500">Connected members</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A84FF]"
        />
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => onUserSelect?.(user)}
                className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={user.profile || "/placeholder.svg"}
                    alt={getDisplayName(user)}
                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${isUserOnline(user.id) ? "bg-green-500" : "bg-gray-400"}`}
                    title={isUserOnline(user.id) ? "Online" : "Offline"}
                  ></span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{getDisplayName(user)}</span>
                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm mt-4">
              {searchTerm ? "No users found matching your search." : "No users found."}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col items-center text-center justify-center mt-6">
        <MessageCircleQuestion strokeWidth={1.2} className="h-5 w-5 text-gray-500 mb-2" />
        <p className="text-[13px] text-gray-500 mb-1">Click on any user to start a conversation</p>
      </div>

      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`text-xs font-medium px-5 py-2 h-8 w-25 rounded-full transition ${currentPage === 1 ? "text-gray-400 bg-gray-200 cursor-not-allowed" : "text-[#0A84FF] bg-gray-200 hover:bg-[#0A84FF]/10"}`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`text-xs font-medium px-5 py-2 h-8 w-25 rounded-full transition ${currentPage === totalPages ? "text-gray-400 bg-gray-200 cursor-not-allowed" : "text-[#0A84FF] bg-gray-200 hover:bg-[#0A84FF]/10"}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}