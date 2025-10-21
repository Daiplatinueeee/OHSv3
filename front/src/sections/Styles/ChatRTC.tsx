import type React from "react"
import { useState, useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import {
  ChevronLeftIcon,
  SettingsIcon,
  SearchIcon,
  PlusIcon,
  MoreVerticalIcon,
  PaperclipIcon,
  SmileIcon,
  SendIcon,
  MessageSquareIcon,
  XIcon,
  PhoneCallIcon,
  VideoIcon,
  CheckIcon,
  CheckCheckIcon,
  Trash2Icon,
} from "lucide-react"
import { SharedFilesSidebar } from "../Styles/SharedFilesSIdebar" 

interface Message {
  id: string
  text: string
  sender: string
  sender_id: string
  receiver_id?: string
  timestamp: Date
  isPrivate?: boolean
  attachmentUrls?: string[]
  status?: "sent" | "delivered" | "read"
  deleted?: boolean
}

interface User {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  username: string 
  profilePicture?: string
  status?: "online" | "offline"
}

function ChatRTC() {
  const navigate = useNavigate() // Initialize useNavigate
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [messageInput, setMessageInput] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({}) 
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]) 
  const fileInputRef = useRef<HTMLInputElement>(null) 

  const [showEmojiPicker, setShowEmojiPicker] = useState(false) 
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤫",
    "🤭",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
  ]

  // Initialize user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser)
        // Construct username from first, middle, last names
        const username = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")

        setCurrentUser({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          username: username,
          profilePicture: user.profilePicture, // Pass profile picture
          status: "online",
        })

        // Initialize socket with auth data, passing the constructed username
        initializeSocket({ ...user, username })
      } catch (error) {
        console.error("Failed to parse stored user", error)
        setError("Authentication error. Please log in again.")
        setIsLoading(false)
      }
    } else {
      setError("You are not logged in. Please log in to continue.")
      setIsLoading(false)
    }
  }, [])

  // Initialize socket connection
  const initializeSocket = (user: any) => {
    console.log("Initializing socket with user:", user)

    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
      auth: {
        username: user.username, // Use the constructed username
        userId: user.id,
        token: localStorage.getItem("token"),
      },
      autoConnect: true,
    })

    setSocket(newSocket)

    // Set up socket event handlers
    newSocket.on("connect", () => {
      console.log("Socket connected!")
      setIsConnected(true)
      setIsLoading(false)
    })

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      setError(`Connection error: ${err.message}`)
      setIsLoading(false)
    })

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    // Listen for all online users
    newSocket.on("users_update", (users: User[]) => {
      console.log("Online users updated:", users)
      // Filter out current user and ensure no duplicates
      const filteredUsers = users.filter((u) => u.id !== user.id)
      setOnlineUsers(filteredUsers)
    })

    // Listen for private messages
    newSocket.on("private_message", (message: Message) => {
      console.log("Received private message:", message)

      // Determine the conversation ID (either sender or receiver)
      const conversationId = message.sender_id === user.id ? message.receiver_id : message.sender_id

      if (conversationId) {
        setMessages((prev) => {
          // Check if message already exists to prevent duplicates
          const conversationMessages = prev[conversationId] || []
          if (!conversationMessages.some((m) => m.id === message.id)) {
            return {
              ...prev,
              [conversationId]: [...conversationMessages, message],
            }
          }
          return prev
        })
      }
    })

    // NEW: Listen for message status updates (e.g., delivered, read)
    newSocket.on(
      "message_status_update",
      ({
        messageId,
        status,
        receiverId,
        senderId,
        messagesUpdated,
      }: {
        messageId?: string
        status: "sent" | "delivered" | "read"
        receiverId?: string
        senderId?: string
        messagesUpdated?: boolean
      }) => {
        setMessages((prev) => {
          const targetConversationId = messageId ? (prev[receiverId || ""] ? receiverId : senderId) : senderId // Determine which conversation to update

          if (!targetConversationId || !prev[targetConversationId]) {
            return prev
          }

          const conversationMessages = prev[targetConversationId]
          let updatedMessages: Message[]

          if (messagesUpdated) {
            // If messagesUpdated is true, it means multiple messages were marked as read
            updatedMessages = conversationMessages.map((msg) =>
              msg.sender_id === targetConversationId && msg.status !== "read" && !msg.deleted
                ? { ...msg, status: "read" as const }
                : msg,
            )
          } else if (messageId) {
            // Single message status update
            updatedMessages = conversationMessages.map((msg) =>
              msg.id === messageId ? { ...msg, status: status as "sent" | "delivered" | "read" } : msg,
            )
          } else {
            return prev // No specific message ID or bulk update flag
          }

          return {
            ...prev,
            [targetConversationId]: updatedMessages,
          }
        })
      },
    )

    // NEW: Listen for message unsent event
    newSocket.on(
      "message_unsent",
      ({ messageId, receiverId, text }: { messageId: string; receiverId: string; text: string }) => {
        console.log(`Message ${messageId} unsent. Updating UI.`)
        setMessages((prev) => {
          const conversationId = receiverId // The receiverId here is the other user's ID in the conversation
          const conversationMessages = prev[conversationId] || []
          const updatedMessages = conversationMessages.map((msg) =>
            msg.id === messageId ? { ...msg, deleted: true, text: text, attachmentUrls: [] } : msg,
          )
          return {
            ...prev,
            [conversationId]: updatedMessages,
          }
        })
      },
    )

    // Listen for typing status updates
    newSocket.on("typing_status", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingStatus((prev) => ({
        ...prev,
        [userId]: isTyping,
      }))
    })

    return newSocket
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, selectedUser])

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log("Disconnecting socket")
        socket.disconnect()
      }
    }
  }, [socket])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [emojiPickerRef])

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)

    // Request message history with this user
    if (socket && currentUser) {
      socket.emit(
        "get_private_message_history",
        {
          userId: user.id,
        },
        (response: { success: boolean; messages: Message[] }) => {
          if (response.success) {
            setMessages((prev) => ({
              ...prev,
              [user.id]: response.messages,
            }))
            // NEW: Mark messages as read when chat is opened
            socket.emit("mark_messages_as_read", { otherUserId: user.id }, (readResponse: { success: boolean }) => {
              if (readResponse.success) {
                console.log(`Messages with ${user.username} marked as read.`)
              } else {
                console.error(`Failed to mark messages with ${user.username} as read.`)
              }
            })
          }
        },
      )
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:3000/api/upload/image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        // Throw an error with the status for better debugging
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim() && selectedFiles.length === 0) {
      return // Don't send empty messages or messages without attachments
    }
    if (!socket || !isConnected || !selectedUser || !currentUser) {
      return
    }

    let attachmentUrls: string[] = []
    if (selectedFiles.length > 0) {
      const uploadPromises = selectedFiles.map((file) => uploadFile(file))
      const urls = await Promise.all(uploadPromises)
      attachmentUrls = urls.filter(Boolean) as string[] // Filter out nulls
    }

    const messageData = {
      text: messageInput,
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      isPrivate: true,
      attachmentUrls: attachmentUrls, // Include attachment URLs
      status: "sent", // NEW: Set initial status to 'sent'
      deleted: false, // NEW: Message is not deleted initially
    }

    console.log("Sending private message:", messageData)
    socket.emit("send_private_message", messageData, (response: { success: boolean; message: Message }) => {
      if (response.success) {
        console.log("Message sent successfully")
        setMessageInput("")
        setSelectedFiles([]) // Clear selected files
        if (fileInputRef.current) {
          fileInputRef.current.value = "" // Clear file input
        }
        // Clear typing status after sending message
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        socket.emit("typing_stop", { receiverId: selectedUser.id })

        // Add message to the conversation immediately from the response
        setMessages((prev) => {
          const conversationMessages = prev[selectedUser.id] || []
          // Check if message already exists
          if (!conversationMessages.some((m) => m.id === response.message.id)) {
            return {
              ...prev,
              [selectedUser.id]: [...conversationMessages, response.message],
            }
          }
          return prev
        })
      } else {
        console.error("Failed to send message")
      }
    })
  }

  // NEW: Handle unsend message
  const handleUnsend = (messageId: string) => {
    if (!socket || !selectedUser || !currentUser) return

    // Optimistically update UI
    setMessages((prev) => {
      const conversationMessages = prev[selectedUser.id] || []
      const updatedMessages = conversationMessages.map((msg) =>
        msg.id === messageId ? { ...msg, deleted: true, text: "[Message unsent]", attachmentUrls: [] } : msg,
      )
      return {
        ...prev,
        [selectedUser.id]: updatedMessages,
      }
    })

    socket.emit(
      "unsend_message",
      { messageId, receiverId: selectedUser.id },
      (response: { success: boolean; error?: string }) => {
        if (!response.success) {
          console.error("Failed to unsend message:", response.error)
          // Revert optimistic update if unsend failed (optional, but good for robustness)
          setMessages((prev) => {
            const conversationMessages = prev[selectedUser.id] || []
            const originalMessage = conversationMessages.find((msg) => msg.id === messageId)
            if (originalMessage) {
              const revertedMessages = conversationMessages.map((msg) =>
                msg.id === messageId ? { ...originalMessage, deleted: false } : msg,
              )
              return {
                ...prev,
                [selectedUser.id]: revertedMessages,
              }
            }
            return prev
          })
        }
      },
    )
  }

  const handleLogout = () => {
    if (socket) {
      socket.disconnect()
    }

    localStorage.removeItem("user")
    localStorage.removeItem("token")
    // For react-router-dom, you'd typically navigate to /login
    navigate("/login")
  }

  const formatMessageTime = (timestamp: Date) => {
    return format(new Date(timestamp), "h:mm a")
  }

  const formatMessageDate = (timestamp: Date) => {
    const messageDate = new Date(timestamp)
    const today = new Date()

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today"
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    return format(messageDate, "MMM d, yyyy")
  }

  // Group messages by date
  const getGroupedMessages = () => {
    if (!selectedUser || !messages[selectedUser.id]) {
      return {}
    }

    const grouped: Record<string, Message[]> = {}

    messages[selectedUser.id].forEach((message) => {
      const date = formatMessageDate(message.timestamp)
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(message)
    })

    return grouped
  }

  // Handle typing events
  const handleTyping = () => {
    if (!socket || !selectedUser || !currentUser) return

    if (!typingStatus[currentUser.id]) {
      // Only emit typing_start if not already typing
      socket.emit("typing_start", { receiverId: selectedUser.id })
    }

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set a new timeout to emit typing_stop after a delay
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { receiverId: selectedUser.id })
    }, 1500) // 1.5 seconds after last key press
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    if (selectedFiles.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = "" // Clear the input if no files left
    }
  }

  const handleEmojiClick = (emoji: string) => {
    setMessageInput((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Connecting to chat...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Connection Error</h3>
            <p className="mt-2 text-center text-gray-600">{error}</p>
            <button
              onClick={() => navigate("/login")} // Use navigate for login
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isImageUrl = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) !== null
  }

  const truncateFileName = (fileName: string, maxLength = 15) => {
    if (fileName.length <= maxLength) {
      return fileName
    }
    const extensionIndex = fileName.lastIndexOf(".")
    let name = fileName
    let ext = ""

    if (extensionIndex > -1) {
      name = fileName.substring(0, extensionIndex)
      ext = fileName.substring(extensionIndex)
    }

    const charsToShow = maxLength - ext.length - 3 // -3 for "..."
    if (charsToShow <= 0) {
      return `...${ext}` // If name part is too short, just show ellipsis and extension
    }

    return `${name.substring(0, charsToShow)}...${ext}`
  }

  // Function to handle going back
  const handleGoBack = () => {
    navigate(-1) // Navigates back one entry in the history stack
  }

  return (
    <div className="flex h-screen bg-[#F7F8FA]">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <ChevronLeftIcon className="h-5 w-5 text-gray-500 mr-2 cursor-pointer" onClick={handleGoBack} />{" "}
            {/* Add onClick handler */}
            <h2 className="text-lg font-medium text-gray-700">Chat Feature</h2>{" "}
            <p className="text-gray-500 ml-2">beta</p>
          </div>
          <SettingsIcon className="h-5 w-5 text-gray-500 cursor-pointer" onClick={handleLogout} />
        </div>

        {/* Current user info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center mb-3">
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture || "/placeholder.svg?height=64&width=64"}
                alt={`${currentUser.username}'s profile`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium border-2 border-white shadow-sm">
                {currentUser?.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ml-4">
              <p className="font-bold text-lg text-gray-900">{currentUser?.username}</p>
              <div className="flex items-center text-sm text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                <span>online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <SearchIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Online users / Last chats */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              recent chats ({onlineUsers.length})
            </h3>
            <div className="flex items-center space-x-2">
              <PlusIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
              <MoreVerticalIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
            </div>
          </div>
          <div className="space-y-1 px-2">
            {onlineUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No users online</p>
            ) : (
              onlineUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                    selectedUser?.id === user.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="relative">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture || "/placeholder.svg?height=40&width=40"}
                        alt={`${user.username}'s profile`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="ml-3 text-left flex-1">
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">
                      {typingStatus[user.id] ? (
                        <span className="text-blue-500 animate-pulse">typing...</span>
                      ) : (
                        "Online"
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {messages[user.id] && messages[user.id].length > 0
                      ? formatMessageTime(messages[user.id][messages[user.id].length - 1].timestamp)
                      : ""}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F7F8FA]">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center">
                {selectedUser.profilePicture ? (
                  <img
                    src={selectedUser.profilePicture || "/placeholder.svg?height=40&width=40"}
                    alt={`${selectedUser.username}'s profile`}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{selectedUser.username}</h2>
                  {onlineUsers.some((u) => u.id === selectedUser.id) ? (
                    <div className="flex items-center text-sm text-green-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      <span>Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                      <span>Offline</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {" "}
                {/* Added wrapper for icons */}
                <PhoneCallIcon className="h-5 w-5 text-gray-500 cursor-pointer" /> {/* Call Icon */}
                <VideoIcon className="h-5 w-5 text-gray-500 cursor-pointer" /> {/* Video Call Icon */}
                <MoreVerticalIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {Object.entries(getGroupedMessages()).map(([date, dateMessages]) => (
                <div key={date} className="mb-6">
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">{date}</div>
                  </div>

                  {dateMessages.map((message, index) => {
                    const isCurrentUser = message.sender_id === currentUser?.id
                    const senderUser = isCurrentUser
                      ? currentUser
                      : onlineUsers.find((u) => u.id === message.sender_id) || selectedUser

                    // Determine if the message is only attachments (images or files)
                    const hasAttachments = (message.attachmentUrls ?? []).length > 0 // FIX: Use ?? []
                    const hasText = message.text && message.text.trim().length > 0

                    const isImageOnlyMessage =
                      isCurrentUser &&
                      hasAttachments &&
                      !hasText &&
                      (message.attachmentUrls ?? []).every((url) => isImageUrl(url)) // FIX: Use ?? []

                    const isFileOnlyMessage =
                      isCurrentUser &&
                      hasAttachments &&
                      !hasText &&
                      (message.attachmentUrls ?? []).every((url) => !isImageUrl(url)) // FIX: Use ?? []

                    const bubbleClasses = `max-w-xs lg:max-w-md rounded-xl ${
                      isCurrentUser
                        ? isImageOnlyMessage || isFileOnlyMessage // Apply transparent style for image-only or file-only
                          ? "bg-transparent p-0"
                          : "bg-blue-500 text-white rounded-br-none px-4 py-2"
                        : "bg-white text-gray-800 rounded-tl-none shadow-sm px-4 py-2"
                    }`

                    // Don't render if message is deleted and has no text/attachments
                    if (message.deleted && !message.text && (message.attachmentUrls ?? []).length === 0) {
                      return null
                    }

                    return (
                      <div
                        key={message.id || index}
                        className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        {!isCurrentUser && (
                          <div className="flex-shrink-0 mr-3">
                            {senderUser?.profilePicture ? (
                              <img
                                src={senderUser.profilePicture || "/placeholder.svg?height=32&width=32"}
                                alt={`${senderUser.username}'s profile`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-medium">
                                {message.sender.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col">
                          {!isCurrentUser && (
                            <p className="text-xs text-gray-500 mb-1 ml-1">
                              {message.sender} <span className="ml-2">{formatMessageTime(message.timestamp)}</span>
                            </p>
                          )}
                          <div className={bubbleClasses}>
                            {message.deleted ? (
                              <p className={`italic ${isCurrentUser ? "text-white" : "text-gray-500"}`}>
                                {message.text}
                              </p>
                            ) : (
                              message.text && <p className="break-words">{message.text}</p>
                            )}
                            {(message.attachmentUrls ?? []).length > 0 && ( // FIX: Use ?? []
                              <div className={`grid gap-2 ${isImageOnlyMessage ? "grid-cols-1" : "grid-cols-2 mt-2"}`}>
                                {(message.attachmentUrls ?? []).map(
                                  (
                                    url,
                                    attIndex, // FIX: Use ?? []
                                  ) => (
                                    <a key={attIndex} href={url} target="_blank" rel="noopener noreferrer">
                                      {isImageUrl(url) ? (
                                        <img
                                          src={url || "/placeholder.svg"}
                                          alt={`Attachment ${attIndex + 1}`}
                                          className={`max-w-full h-auto object-cover ${isImageOnlyMessage ? "rounded-xl" : "rounded-md"}`}
                                        />
                                      ) : (
                                        // Extract file name and extension
                                        (() => {
                                          try {
                                            const urlObj = new URL(url)
                                            const fileNameWithExtension = urlObj.pathname.split("/").pop() || "File"
                                            const truncatedName = truncateFileName(fileNameWithExtension)

                                            return (
                                              <div className="flex items-center justify-center p-2 bg-gray-100 rounded-md text-gray-600 text-sm min-w-0">
                                                <PaperclipIcon className="h-4 w-4 flex-shrink-0 mr-1" />
                                                <span className="truncate">{truncatedName}</span>
                                              </div>
                                            )
                                          } catch (e) {
                                            console.error("Error parsing attachment URL:", e)
                                            return (
                                              <div className="flex items-center justify-center p-2 bg-gray-100 rounded-md text-gray-600 text-sm">
                                                <PaperclipIcon className="h-4 w-4 mr-1" /> File
                                              </div>
                                            )
                                          }
                                        })()
                                      )}
                                    </a>
                                  ),
                                )}
                              </div>
                            )}
                            {isCurrentUser && (
                              <div className="flex items-center justify-end text-xs mt-1">
                                {message.status === "sent" && (
                                  <CheckIcon
                                    className={`h-3 w-3 mr-1 ${isImageOnlyMessage || isFileOnlyMessage ? "text-gray-500" : "text-blue-100"}`}
                                  />
                                )}
                                {message.status === "delivered" && (
                                  <CheckCheckIcon
                                    className={`h-3 w-3 mr-1 ${isImageOnlyMessage || isFileOnlyMessage ? "text-gray-500" : "text-blue-100"}`}
                                  />
                                )}
                                {message.status === "read" && (
                                  <CheckCheckIcon
                                    className={`h-3 w-3 mr-1 ${isImageOnlyMessage || isFileOnlyMessage ? "text-blue-500" : "text-blue-300"}`}
                                  />
                                )}
                                <span
                                  className={`${isImageOnlyMessage || isFileOnlyMessage ? "text-gray-500" : "text-blue-100"}`}
                                >
                                  {formatMessageTime(message.timestamp)}
                                </span>
                                {!message.deleted && ( // Only show unsend option for non-deleted messages
                                  <button
                                    onClick={() => handleUnsend(message.id)}
                                    className={`ml-2 p-1 rounded-full ${isImageOnlyMessage || isFileOnlyMessage ? "text-gray-500 hover:bg-gray-200" : "text-blue-100 hover:bg-blue-600"} transition-colors`}
                                    title="Unsend message"
                                  >
                                    <Trash2Icon className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {isCurrentUser && (
                          <div className="flex-shrink-0 ml-3">
                            {currentUser?.profilePicture ? (
                              <img
                                src={currentUser.profilePicture || "/placeholder.svg?height=32&width=32"}
                                alt={`${currentUser.username}'s profile`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                                {currentUser?.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}

              {typingStatus[selectedUser.id] && (
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-3">
                    {selectedUser?.profilePicture ? (
                      <img
                        src={selectedUser.profilePicture || "/placeholder.svg?height=32&width=32"}
                        alt={`${selectedUser.username}'s profile`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-medium">
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="bg-white text-gray-800 px-4 py-2 rounded-xl rounded-tl-none shadow-sm">
                    <p className="text-sm text-blue-500 animate-pulse">{selectedUser.username} is typing...</p>
                  </div>
                </div>
              )}

              {(!selectedUser || !messages[selectedUser.id] || messages[selectedUser.id].length === 0) && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquareIcon className="h-16 w-16 mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                  <p className="text-center max-w-sm">Select a user from the list to start a conversation</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 bg-white border-t border-gray-200">
              {selectedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700"
                    >
                      <span>{file.name}</span>
                      <button onClick={() => removeFile(index)} className="ml-2 text-gray-500 hover:text-gray-700">
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={sendMessage} className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="text-gray-500 hover:text-gray-700 cursor-pointer">
                    <PaperclipIcon className="h-6 w-6" />
                  </label>
                </div>

                <div className="relative" ref={emojiPickerRef}>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <SmileIcon className="h-6 w-6" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1 max-h-60 overflow-y-auto z-10 w-64">
                      {" "}
                      {/* Adjusted width and left-0 */}
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          className="p-1 hover:bg-gray-100 rounded-md text-xl"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value)
                    handleTyping()
                  }}
                  onBlur={() => {
                    if (socket && selectedUser) {
                      if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current)
                      }
                      socket.emit("typing_stop", { receiverId: selectedUser.id })
                    }
                  }}
                  placeholder="Write your message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() && selectedFiles.length === 0}
                  className="bg-blue-500 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  <SendIcon className="h-6 w-6" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-[#F7F8FA] text-gray-500">
            <MessageSquareIcon className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-xl font-medium mb-2">Your Messages</h3>
            <p className="text-center max-w-sm">Select a user from the list to start a conversation</p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Shared Files */}
      <SharedFilesSidebar />
    </div>
  )
}

export default ChatRTC