"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import {
  ChevronLeftIcon,
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
import { AllUsersSidebar } from "./AllUsersSidebar"

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

interface RecentChat {
  userId: string
  lastMessage?: string
  lastMessageTime?: Date
}

// Helper function to generate consistent conversation ID for both users
const getConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join("_")
}

function ChatRTC() {
  const navigate = useNavigate() // Initialize useNavigate
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [messageInput, setMessageInput] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [recentChats, setRecentChats] = useState<RecentChat[]>([])
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
        const username =
          user.businessName?.trim() ||
          [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ").trim() ||
          "Unknown User"

        setCurrentUser({
          id: user.id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          middleName: user.middleName || "",
          username,
          profilePicture: user.profilePicture || "",
          status: "online",
        })

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
        username: user.username,
        userId: user.id,
        token: localStorage.getItem("token"),
      },
      autoConnect: true,
    })

    setSocket(newSocket)

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

    newSocket.on("users_update", (users: User[]) => {
      console.log("Online users updated:", users)
      const filteredUsers = users.filter((u) => u.id !== user.id)
      setOnlineUsers(filteredUsers)
    })

    newSocket.on("recent_chats", (chats: RecentChat[]) => {
      console.log("Recent chats received:", chats)
      setRecentChats(chats)
    })

    newSocket.emit("get_recent_chats", { userId: user?.id }, (response: { success: boolean; chats: RecentChat[] }) => {
      if (response.success) {
        console.log("Recent chats fetched:", response.chats)
        setRecentChats(response.chats)
      }
    })

    newSocket.on("private_message", (message: Message) => {
      console.log("Received private message:", message)

      const conversationId = getConversationId(message.sender_id, message.receiver_id || "")

      if (conversationId) {
        setMessages((prev) => {
          const conversationMessages = prev[conversationId] || []
          if (!conversationMessages.some((m) => m.id === message.id)) {
            return {
              ...prev,
              [conversationId]: [...conversationMessages, message],
            }
          }
          return prev
        })

        setRecentChats((prev) => {
          const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id
          if (!otherUserId) {
            // if we don't have a valid other user id, don't modify recentChats
            return prev
          }
          const existingChat = prev.find((chat) => chat.userId === otherUserId)
          if (existingChat) {
            return prev.map((chat) =>
              chat.userId === otherUserId
                ? { ...chat, lastMessage: message.text, lastMessageTime: message.timestamp }
                : chat,
            )
          } else {
            return [...prev, { userId: otherUserId, lastMessage: message.text, lastMessageTime: message.timestamp }]
          }
        })
      }
    })

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
          const targetConversationId = messageId ? (prev[receiverId || ""] ? receiverId : senderId) : senderId

          if (!targetConversationId || !prev[targetConversationId]) {
            return prev
          }

          const conversationMessages = prev[targetConversationId]
          let updatedMessages: Message[]

          if (messagesUpdated) {
            updatedMessages = conversationMessages.map((msg) =>
              msg.sender_id === targetConversationId && msg.status !== "read" && !msg.deleted
                ? { ...msg, status: "read" as const }
                : msg,
            )
          } else if (messageId) {
            updatedMessages = conversationMessages.map((msg) =>
              msg.id === messageId ? { ...msg, status: status as "sent" | "delivered" | "read" } : msg,
            )
          } else {
            return prev
          }

          return {
            ...prev,
            [targetConversationId]: updatedMessages,
          }
        })
      },
    )

    newSocket.on(
      "message_unsent",
      ({ messageId, receiverId, text }: { messageId: string; receiverId: string; text: string }) => {
        console.log(`Message ${messageId} unsent. Updating UI.`)
        setMessages((prev) => {
          const conversationId = receiverId
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

    newSocket.on("typing_status", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingStatus((prev) => ({
        ...prev,
        [userId]: isTyping,
      }))
    })

    return newSocket
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, selectedUser])

  useEffect(() => {
    return () => {
      if (socket) {
        console.log("Disconnecting socket")
        socket.disconnect()
      }
    }
  }, [socket])

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

    if (socket && currentUser) {
      const conversationId = getConversationId(currentUser.id, user.id)

      socket.emit(
        "get_private_message_history",
        { userId: user.id },
        (response: { success: boolean; messages: Message[] }) => {
          if (response.success) {
            setMessages((prev) => ({
              ...prev,
              [conversationId]: response.messages,
            }))

            if (response.messages.length > 0) {
              const lastMsg = response.messages[response.messages.length - 1]
              setRecentChats((prev) => {
                const existingChat = prev.find((chat) => chat.userId === user.id)
                if (!existingChat) {
                  return [...prev, { userId: user.id, lastMessage: lastMsg.text, lastMessageTime: lastMsg.timestamp }]
                }
                return prev
              })
            }

            socket.emit("mark_messages_as_read", { otherUserId: user.id }, (readResponse: { success: boolean }) => {
              if (readResponse.success) {
                console.log(`Messages with ${user.username} marked as read.`)
              }
            })
          }
        },
      )
    }
  }

  const handleUserSelectFromSidebar = (user: any) => {
    const chatUser: User = {
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.businessName || `${user.firstName} ${user.lastName}`,
      profilePicture: user.profile,
      status: "offline",
    }

    handleUserSelect(chatUser)
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
      return
    }
    if (!socket || !isConnected || !selectedUser || !currentUser) {
      return
    }

    let attachmentUrls: string[] = []
    if (selectedFiles.length > 0) {
      const uploadPromises = selectedFiles.map((file) => uploadFile(file))
      const urls = await Promise.all(uploadPromises)
      attachmentUrls = urls.filter(Boolean) as string[]
    }

    const messageData = {
      text: messageInput,
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      isPrivate: true,
      attachmentUrls: attachmentUrls,
      status: "sent",
      deleted: false,
    }

    console.log("Sending private message:", messageData)
    socket.emit("send_private_message", messageData, (response: { success: boolean; message: Message }) => {
      if (response.success) {
        console.log("Message sent successfully")
        setMessageInput("")
        setSelectedFiles([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        socket.emit("typing_stop", { receiverId: selectedUser.id })

        const conversationId = getConversationId(currentUser.id, selectedUser.id)
        setMessages((prev) => {
          const conversationMessages = prev[conversationId] || []
          if (!conversationMessages.some((m) => m.id === response.message.id)) {
            return {
              ...prev,
              [conversationId]: [...conversationMessages, response.message],
            }
          }
          return prev
        })

        setRecentChats((prev) => {
          const existingChat = prev.find((chat) => chat.userId === selectedUser.id)
          if (existingChat) {
            return prev.map((chat) =>
              chat.userId === selectedUser.id
                ? { ...chat, lastMessage: messageInput, lastMessageTime: new Date() }
                : chat,
            )
          } else {
            return [...prev, { userId: selectedUser.id, lastMessage: messageInput, lastMessageTime: new Date() }]
          }
        })
      } else {
        console.error("Failed to send message")
      }
    })
  }

  const handleUnsend = (messageId: string) => {
    if (!socket || !selectedUser || !currentUser) return

    const conversationId = getConversationId(currentUser.id, selectedUser.id)

    setMessages((prev) => {
      const conversationMessages = prev[conversationId] || []
      const updatedMessages = conversationMessages.map((msg) =>
        msg.id === messageId ? { ...msg, deleted: true, text: "[Message unsent]", attachmentUrls: [] } : msg,
      )
      return {
        ...prev,
        [conversationId]: updatedMessages,
      }
    })

    socket.emit(
      "unsend_message",
      { messageId, receiverId: selectedUser.id },
      (response: { success: boolean; error?: string }) => {
        if (!response.success) {
          console.error("Failed to unsend message:", response.error)
        }
      },
    )
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

  const getGroupedMessages = () => {
    if (!selectedUser || !currentUser) {
      return {}
    }

    const conversationId = getConversationId(currentUser.id, selectedUser.id)

    if (!messages[conversationId]) {
      return {}
    }

    const grouped: Record<string, Message[]> = {}

    messages[conversationId].forEach((message) => {
      const date = formatMessageDate(message.timestamp)
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(message)
    })

    return grouped
  }

  const handleTyping = () => {
    if (!socket || !selectedUser || !currentUser) return

    if (!typingStatus[currentUser.id]) {
      socket.emit("typing_start", { receiverId: selectedUser.id })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { receiverId: selectedUser.id })
    }, 1500)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    if (selectedFiles.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleEmojiClick = (emoji: string) => {
    setMessageInput((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

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
              onClick={() => navigate("/login")}
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

    const charsToShow = maxLength - ext.length - 3

    if (charsToShow <= 0) {
      return `...${ext}`
    }

    return `${name.substring(0, charsToShow)}...${ext}`
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex h-screen bg-[#F7F8FA]">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <ChevronLeftIcon className="h-5 w-5 text-gray-500 mr-2 cursor-pointer" onClick={handleGoBack} />
          </div>
          <div className="flex justify-center items-center">
            <h2 className="text-lg font-medium text-gray-700">Chat Room by <span className="text-sky-500">HandyGo</span></h2>
            <div className="relative group ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-circle-question-mark-icon text-gray-500 cursor-pointer"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              {/* Tooltip */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                This feature is experimental, things might be wobbly. Take it easy and enjoy!
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture || "/placeholder.svg?height=64&width=64"}
                alt={`${currentUser.username}'s profile`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium border-2 border-white shadow-sm">
                {currentUser?.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ml-4">
              <p className="font-medium text-lg text-gray-900">{currentUser?.username}</p>
              <div className="flex items-center text-sm text-green-500 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                <span>online</span>
              </div>
            </div>
          </div>
        </div>

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

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              recent chats ({recentChats.length > 0 ? recentChats.length : onlineUsers.length})
            </h3>
            <div className="flex items-center space-x-2">
              <PlusIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
              <MoreVerticalIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
            </div>
          </div>
          <div className="space-y-1 px-2">
            {recentChats.length === 0 && onlineUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent chats</p>
            ) : (
              [...new Set([...recentChats.map((chat) => chat.userId), ...onlineUsers.map((u) => u.id)])].map(
                (userId) => {
                  const user = onlineUsers.find((u) => u.id === userId)
                  if (!user) return null
                  const recentChat = recentChats.find((chat) => chat.userId === userId)
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${selectedUser?.id === user.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"}`}
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
                        <p className="text-xs text-gray-500 truncate">
                          {typingStatus[user.id] ? (
                            <span className="text-blue-500 animate-pulse">typing...</span>
                          ) : recentChat?.lastMessage ? (
                            recentChat.lastMessage
                          ) : (
                            "Online"
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {recentChat?.lastMessageTime
                          ? formatMessageTime(recentChat.lastMessageTime)
                          : messages[getConversationId(currentUser?.id || "", user.id)] &&
                            messages[getConversationId(currentUser?.id || "", user.id)].length > 0
                            ? formatMessageTime(
                              messages[getConversationId(currentUser?.id || "", user.id)][
                                messages[getConversationId(currentUser?.id || "", user.id)].length - 1
                              ].timestamp,
                            )
                            : ""}
                      </span>
                    </button>
                  )
                },
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#F7F8FA]">
        {selectedUser ? (
          <>
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
                  <h2 className="text-lg font-medium text-gray-800">{selectedUser.username}</h2>
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
                <PhoneCallIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
                <VideoIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
                <MoreVerticalIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
              </div>
            </div>

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

                    const hasAttachments = (message.attachmentUrls ?? []).length > 0
                    const hasText = message.text && message.text.trim().length > 0

                    const isImageOnlyMessage =
                      isCurrentUser &&
                      hasAttachments &&
                      !hasText &&
                      (message.attachmentUrls ?? []).every((url) => isImageUrl(url))
                    const isFileOnlyMessage =
                      isCurrentUser &&
                      hasAttachments &&
                      !hasText &&
                      (message.attachmentUrls ?? []).every((url) => !isImageUrl(url))

                    const bubbleClasses = `max-w-xs lg:max-w-md rounded-xl ${isCurrentUser ? (isImageOnlyMessage || isFileOnlyMessage ? "bg-transparent p-0" : "bg-blue-500 text-white rounded-br-none px-4 py-2") : "bg-white text-gray-800 rounded-tl-none shadow-sm px-4 py-2"}`

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
                            {(message.attachmentUrls ?? []).length > 0 && (
                              <div className={`grid gap-2 ${isImageOnlyMessage ? "grid-cols-1" : "grid-cols-2 mt-2"}`}>
                                {(message.attachmentUrls ?? []).map((url, attIndex) => (
                                  <a key={attIndex} href={url} target="_blank" rel="noopener noreferrer">
                                    {isImageUrl(url) ? (
                                      <img
                                        src={url || "/placeholder.svg"}
                                        alt={`Attachment ${attIndex + 1}`}
                                        className={`max-w-full h-auto object-cover ${isImageOnlyMessage ? "rounded-xl" : "rounded-md"}`}
                                      />
                                    ) : (
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
                                ))}
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
                                {!message.deleted && (
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

              {(!selectedUser ||
                !messages[getConversationId(currentUser?.id || "", selectedUser.id)] ||
                messages[getConversationId(currentUser?.id || "", selectedUser.id)].length === 0) && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquareIcon className="h-16 w-16 mb-4 text-gray-300" />
                    <h3 className="text-xl font-medium mb-2">Your Convo</h3>
                    <p className="text-center max-w-sm">
                      {selectedUser
                        ? "Start by saying hi or anything you'd like to share!"
                        : "Select a user from the list to start a conversation"}
                    </p>
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>

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
                      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
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

      <AllUsersSidebar onUserSelect={handleUserSelectFromSidebar} onlineUsers={onlineUsers} />
    </div>
  )
}

export default ChatRTC