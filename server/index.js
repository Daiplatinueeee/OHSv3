import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import multer from "multer"
import { put, BlobAccessError } from "@vercel/blob"
import jwt from "jsonwebtoken"
import { createServer } from "http"
import { Server } from "socket.io"
import { v4 as uuidv4 } from "uuid"
import {
  registerCustomer,
  registerCOO,
  registerAccount,
  loginUser,
  logoutUser,
  sendOtpEmail,
  verifyOtp,
  fetchSecretDetails,
  verifySecretAnswer,
  verifySecretCode,
  resetPassword,
  changePassword,
  getUserProfile,
  updateUserImage,
  updateUserProfile,
  checkEmailAvailability,
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
  getAllUsers,
  deleteUserAccount,
  updateUserStatus,
  updateUserRole,
  getUserProfileById,
  bulkAddProviders,
  fetchProviders,
  updateUserVerification,
  getProvidersByCoo
} from "./controller/userController.js"
import { createService, getServices, deleteService, getServicesByUserId, getServicesByCompanyId, getTotalServicesByCompany, updateServiceDetails } from "./controller/serviceController.js"
import {
  saveMessage,
  getPrivateMessages,
  deleteMessage,
  updateMessageStatus,
  markMessagesAsRead,
} from "./controller/chatController.js"
import { User } from "./models/user.js"
import fetch from "node-fetch"
import {
  createBookings,
  getBookingsByUserId,
  updateBookingStatus,
  getAllActiveBookings,
  getCompletedBookingsByProviderId,
  getAllPendingBookings,
  getAcceptedBookingsByProviderId,
  getActiveBookingsWithProviderAccepted,
  updateBookingStatusOnly,
  updateBookingPaymentStatus,
  updateServiceCompletion,
  updateProviderArrival,
  getBookingById,
  updateBookingReview,
  skipBookingReview,
  getOngoingBookings,
  releasePayment,
  updateProviderReview,
  getBookingsByCompany,
  getRevenueByCoo,
  getMonthlyRevenueByCoo,
  getPendingBookingsByProvider,
  getOngoingBookingsByProvider,
  getActiveBookingsByProvider,
  getCompletedBookingsByProvider
} from "./controller/bookingController.js"

import { Notification } from "./models/notification.js"
import { geocodeAddress, getUserLocation } from "./controller/geocodingController.js"

import {
  claimFirstBookingCoupon,
  getUserCoupons,
  validateCoupon,
  applyCoupon,
  createCoupon,
  getCompanyCoupons,
  deleteCoupon,
  createCompensationCoupon,
  deleteExpiredCoupons,
  sendCouponToUser,
  getCompanyCouponsDashboard
} from "./controller/couponController.js"

import { fetchUserActivities } from "./controller/userActivityController.js"
import { createReport, getAllReports, updateReportStatus } from "./controller/reportsController.js"
import { saveSubscription, getSubscription } from "./controller/subscriptionController.js"
import { saveAdvertisement, showAdvertisement } from "./controller/advertiseController.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    if (req.url.startsWith("/api")) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    }
    next()
  })
}


const requestLogger = (req, res, next) => {
  const start = Date.now()
  const originalSend = res.send

  res.send = function (data) {
    const duration = Date.now() - start
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`,
    )
    originalSend.call(this, data)
  }

  next()
}

const rateLimitMap = new Map()

const cleanupRateLimitMap = () => {
  const now = Date.now()
  let cleanedCount = 0

  rateLimitMap.forEach((data, clientId) => {
    if (now > data.resetTime) {
      rateLimitMap.delete(clientId)
      cleanedCount++
    }
  })

  if (cleanedCount > 0) {
    console.log(`[${new Date().toISOString()}] Cleaned up ${cleanedCount} expired rate limit entries`)
  }
}

setInterval(cleanupRateLimitMap, 1 * 60 * 1000)

const rateLimit = (maxRequests = 1000, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]
    let clientId = req.ip || req.connection.remoteAddress

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_KEY)
        clientId = `user_${decoded.userId}`
      } catch (err) {
        clientId = req.ip || req.connection.remoteAddress
      }
    }

    const now = Date.now()

    if (!rateLimitMap.has(clientId)) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
      return next()
    }

    const clientData = rateLimitMap.get(clientId)

    if (now > clientData.resetTime) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs })
      return next()
    }

    if (clientData.count >= maxRequests) {
      const retryAfter = Math.ceil((clientData.resetTime - now) / 1000)
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
        retryAfter: retryAfter,
      })
    }

    clientData.count++
    next()
  }
}

app.use(requestLogger)
app.use(rateLimit(500, 15 * 60 * 1000))

app.use((req, res, next) => {
  const start = process.hrtime.bigint()
  res.on("finish", () => {
    const end = process.hrtime.bigint()
    const duration = Number(end - start) / 1_000_000
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${duration.toFixed(2)}ms`)
  })
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  if (req.method === "OPTIONS") {
    res.sendStatus(200)
  } else {
    next()
  }
})

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token == null) {
    console.warn("Authentication: No token provided.")
    return res.status(401).json({ message: "Authentication token required." })
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    console.error("JWT_SECRET is not defined in environment variables.")
    return res.status(500).json({ message: "Server configuration error: JWT secret missing." })
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err)
      if (err.name === "TokenExpiredError") {
        console.error("Token expired at:", err.expiredAt)
        return res.status(401).json({ message: "Token expired. Please log in again." })
      } else if (err.name === "JsonWebTokenError") {
        console.error("Invalid token:", err.message)
        return res.status(403).json({ message: "Invalid token. Please log in again." })
      } else {
        return res.status(403).json({ message: "Authentication failed. Invalid token." })
      }
    }
    req.userId = user.userId
    req.userEmail = user.email
    req.accountType = user.accountType
    next()
  })
}

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found." })
    }
    if (user.accountType !== "coo" && user.accountType !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin privileges required." })
    }

    next()
  } catch (error) {
    console.error("Error in admin middleware:", error)
    res.status(500).json({ message: "Server error checking admin privileges." })
  }
}

mongoose.set("bufferCommands", false)
mongoose.connection.on("error", (err) => console.error("Mongoose error:", err))
mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"))

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

const users = {}
const typingUsers = new Map()

const emailVerificationCodes = new Map()

io.use(async (socket, next) => {
  const { token, username, userId } = socket.handshake.auth
  console.log("Socket auth:", { username, userId })

  if (!token) {
    return next(new Error("Authentication token is required"))
  }

  try {
    const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_KEY or JWT_SECRET is not defined in environment variables.")
      return next(new Error("Server configuration error: JWT secret missing."))
    }

    const decoded = jwt.verify(token, jwtSecret)
    const user = await User.findById(userId).select("firstName middleName lastName businessName accountType")

    let resolvedUsername =
      username ||
      (user
        ? user.businessName ||
        [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")
        : null)

    if (!resolvedUsername) {
      console.warn(`No username or businessName found for user ${userId}`)
      return next(new Error("Username or business name is required"))
    }

    socket.user = { id: decoded.userId, username: resolvedUsername }
    console.log("Authenticated socket user:", socket.user)
    next()
  } catch (err) {
    console.error("Socket authentication error:", err)
    next(new Error("Authentication failed"))
  }
})

// Store connected provider clients
const connectedProviders = new Map()

io.on("connection", async (socket) => {

  socket.setMaxListeners(15)

  console.log(`User connected: ${socket.id}`)
  const { username, userId } = socket.handshake.auth

  let fullUserDetails = null
  try {
    fullUserDetails = await User.findById(userId).select("firstName lastName middleName profilePicture")
    if (!fullUserDetails) {
      console.warn(`User with ID ${userId} not found in DB during socket connection.`)

      fullUserDetails = { id: userId, username: username, profilePicture: null }
    } else {
      fullUserDetails.username =
        username ||
        [fullUserDetails.firstName, fullUserDetails.middleName, fullUserDetails.lastName].filter(Boolean).join(" ")
    }
  } catch (dbError) {
    console.error("Error fetching user details from DB for socket:", dbError)
    fullUserDetails = { id: userId, username: username, profilePicture: null }
  }

  const existingUserSocket = Object.values(users).find((user) => user.id === userId)
  if (existingUserSocket) {
    delete users[existingUserSocket.socketId]
  }

  users[socket.id] = {
    id: userId,
    username: fullUserDetails.username,
    profilePicture: fullUserDetails.profilePicture,
    firstName: fullUserDetails.firstName,
    lastName: fullUserDetails.lastName,
    middleName: fullUserDetails.middleName,
    socketId: socket.id,
  }

  io.emit(
    "users_update",
    Object.values(users).reduce((unique, user) => {
      if (!unique.some((u) => u.id === user.id)) {
        unique.push(user)
      }
      return unique
    }, []),
  )

  // Listen for booking status requests
  socket.on("get_all_active_bookings", async (callback) => {
    try {
      // This would normally call your booking controller
      // For now, emit a placeholder response
      socket.emit("all_active_bookings_update", { bookings: [] })
      if (callback) callback({ success: true })
    } catch (error) {
      console.error("Error fetching active bookings:", error)
      if (callback) callback({ success: false, error: error.message })
    }
  })

  socket.on("get_accepted_bookings", async ({ providerId }, callback) => {
    try {
      socket.emit("accepted_bookings_update", { bookings: [] })
      if (callback) callback({ success: true })
    } catch (error) {
      console.error("Error fetching accepted bookings:", error)
      if (callback) callback({ success: false, error: error.message })
    }
  })

  socket.on("get_completed_bookings", async ({ providerId }, callback) => {
    try {
      socket.emit("completed_bookings_update", { bookings: [] })
      if (callback) callback({ success: true })
    } catch (error) {
      console.error("Error fetching completed bookings:", error)
      if (callback) callback({ success: false, error: error.message })
    }
  })

  socket.on("update_booking_status", async ({ bookingId, status }, callback) => {
    try {
      // Broadcast booking update to all relevant providers
      io.emit("booking_status_changed", { bookingId, status })
      if (callback) callback({ success: true })
    } catch (error) {
      console.error("Error updating booking status:", error)
      if (callback) callback({ success: false, error: error.message })
    }
  })

  socket.on("send_private_message", async (messageData, callback) => {
    try {
      const { text, sender_id, receiver_id, attachmentUrls } = messageData
      if ((!text && (!attachmentUrls || attachmentUrls.length === 0)) || !sender_id || !receiver_id) {
        return callback({
          success: false,
          error: "Missing required fields (text or attachment, sender_id, receiver_id)",
        })
      }

      const receiverSocket = Object.values(users).find((user) => user.id === receiver_id)
      const message = {
        id: uuidv4(),
        text,
        sender_id,
        receiver_id,
        sender: socket.user.username,
        room: "private",
        timestamp: new Date(),
        isPrivate: true,
        attachmentUrls: attachmentUrls || [],
        status: "sent",
        deleted: false,
      }

      const savedMessage = await saveMessage(message)

      socket.emit("private_message", savedMessage)

      if (receiverSocket) {
        socket.to(receiverSocket.socketId).emit("private_message", savedMessage)

        const deliveredMessage = await updateMessageStatus(savedMessage.id, "delivered")
        if (deliveredMessage) {
          socket.emit("message_status_update", {
            messageId: deliveredMessage.id,
            status: deliveredMessage.status,
            receiverId: deliveredMessage.receiver_id,
          })
        }
      }

      callback({ success: true, message: savedMessage })
    } catch (error) {
      console.error("Error sending private message:", error)
      callback({ success: false, error: "Failed to send message" })
    }
  })

  socket.on("get_private_message_history", async ({ userId }, callback) => {
    try {
      const currentUserId = socket.user.id
      if (!currentUserId || !userId) {
        return callback({
          success: false,
          error: "Missing user IDs",
        })
      }

      const messages = await getPrivateMessages(currentUserId, userId)
      callback({
        success: true,
        messages,
        userId,
      })
    } catch (error) {
      console.error("Error getting private message history:", error)
      callback({ success: false, error: "Failed to get message history" })
    }
  })

  socket.on("unsend_message", async ({ messageId, receiverId }, callback) => {
    try {
      const senderId = socket.user.id
      const updatedMessage = await deleteMessage(messageId, senderId)

      if (updatedMessage) {
        const receiverSocket = Object.values(users).find((user) => user.id === receiverId)

        socket.emit("message_unsent", {
          messageId: updatedMessage.id,
          receiverId: updatedMessage.receiver_id,
          text: updatedMessage.text,
        })

        if (receiverSocket) {
          socket.to(receiverSocket.socketId).emit("message_unsent", {
            messageId: updatedMessage.id,
            receiverId: updatedMessage.sender_id,
            text: updatedMessage.text,
          })
        }
        callback({ success: true })
      } else {
        callback({ success: false, error: "Failed to unsend message or message not found." })
      }
    } catch (error) {
      console.error("Error unsending message:", error)
      callback({ success: false, error: "Failed to unsend message" })
    }
  })

  socket.on("mark_messages_as_read", async ({ otherUserId }, callback) => {
    try {
      const currentUserId = socket.user.id
      const modifiedCount = await markMessagesAsRead(otherUserId, currentUserId)

      if (modifiedCount > 0) {
        const senderSocket = Object.values(users).find((user) => user.id === otherUserId)
        if (senderSocket) {
          io.to(senderSocket.socketId).emit("message_status_update", {
            senderId: currentUserId,
            status: "read",
            messagesUpdated: true,
          })
        }
      }
      callback({ success: true, modifiedCount })
    } catch (error) {
      console.error("Error marking messages as read:", error)
      callback({ success: false, error: "Failed to mark messages as read" })
    }
  })

  socket.on("typing_start", ({ receiverId }) => {
    const senderId = socket.user.id
    const receiverSocket = Object.values(users).find((user) => user.id === receiverId)

    if (receiverSocket) {
      socket.to(receiverSocket.socketId).emit("typing_status", { userId: senderId, isTyping: true })
    }
  })

  socket.on("typing_stop", ({ receiverId }) => {
    const senderId = socket.user.id
    const receiverSocket = Object.values(users).find((user) => user.id === receiverId)

    if (receiverSocket) {
      socket.to(receiverSocket.socketId).emit("typing_status", { userId: senderId, isTyping: false })
    }
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)
    delete users[socket.id]
    socket.removeAllListeners()
    io.emit(
      "users_update",
      Object.values(users).reduce((unique, user) => {
        if (!unique.some((u) => u.id === user.id)) {
          unique.push(user)
        }
        return unique
      }, []),
    )
    typingUsers.forEach((senders, receiverId) => {
      if (socket.user && senders.has(socket.user.id)) {
        senders.delete(socket.user.id)
        const receiverSocket = Object.values(users).find((user) => user.id === receiverId)
        if (receiverSocket) {
          socket.to(receiverSocket.socketId).emit("typing_status", { userId: socket.user.id, isTyping: false })
        }
      }
    })
  })
})

// Broadcast booking updates to all connected providers
export function broadcastBookingUpdate(eventType, data) {
  io.emit(eventType, data)
}

// Broadcast to specific provider
export function notifyProvider(providerId, eventType, data) {
  const socketId = connectedProviders.get(providerId)
  if (socketId) {
    io.to(socketId).emit(eventType, data)
  }
}

app.get("/", (req, res) => {
  res.send("Online Home Service Backend is running!")
})

app.get("/api/shared-files", (req, res) => {
  setTimeout(() => {
    const data = {
      totalFiles: 231,
      totalLinks: 45,
      fileTypes: [
        {
          name: "Documents",
          count: 126,
          sizeMB: 193,
          icon: "FileTextIcon",
        },
        {
          name: "Photos",
          count: 53,
          sizeMB: 321,
          icon: "ImageIcon",
        },
        {
          name: "Movies",
          count: 3,
          sizeMB: 210,
          icon: "FilmIcon",
        },
        {
          name: "Other",
          count: 49,
          sizeMB: 194,
          icon: "FolderIcon",
        },
      ],
    }
    res.json(data)
  }, 500)
})

app.post("/api/users/register/customer", registerCustomer)
app.post("/api/users/register/coo", registerCOO)
app.post("/api/admin/create-account", authenticateToken, requireAdmin, registerAccount)
app.post("/api/users/login", loginUser)
app.post("/logout", authenticateToken, logoutUser)
app.post("/api/users/send-otp", sendOtpEmail)
app.post("/api/users/verify-otp", verifyOtp)

app.post("/api/users/send-email-verification", (req, res) =>
  sendEmailVerificationCode(req, res, emailVerificationCodes),
)
app.post("/api/users/verify-email-code", authenticateToken, (req, res) =>
  verifyEmailVerificationCode(req, res, emailVerificationCodes),
)

app.post("/api/users/forgot-password/fetch-details", fetchSecretDetails)
app.post("/api/users/forgot-password/verify-answer", verifySecretAnswer)
app.post("/api/users/forgot-password/verify-code", verifySecretCode)
app.post("/api/users/forgot-password/reset-password", resetPassword)
app.put("/api/users/:userId/change-password", authenticateToken, changePassword)
app.get("/api/user/profile", authenticateToken, getUserProfile)

app.post("/api/upload/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." })
    }

    const { url } = await put(req.file.originalname, req.file.buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: req.file.mimetype,
    })

    res.status(200).json({ url })
  } catch (error) {
    console.error("Error uploading file to Vercel Blob:", error)
    if (error instanceof BlobAccessError && error.code === "BLOB_ALREADY_EXISTS") {
      return res.status(409).json({ message: "File already exists. Please upload a different file or rename it." })
    }
    res.status(500).json({ message: "An unexpected error occurred during file upload.", error: error.message })
  }
})

app.put("/api/user/update-image", authenticateToken, updateUserImage)
app.put("/api/user/profile", authenticateToken, updateUserProfile)
app.post("/api/users/check-email-availability", authenticateToken, checkEmailAvailability)



app.post("/api/paymongo-create-link", async (req, res) => {
  try {
    const { amount, description, success_url, failure_url } = req.body
    const PAYMONGO_SECRET_KEY = "sk_test_C91FKxnYJbsaa6zdpaJ4bNvk"

    console.log("[v0] PayMongo create link request received:")
    console.log("[v0] - Raw amount:", amount, typeof amount)
    console.log("[v0] - Description:", description)

    if (!amount) {
      console.log("[v0] ERROR: Amount is missing")
      return res.status(400).json({ error: "Amount is required" })
    }

    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log("[v0] ERROR: Invalid amount format:", { amount, numericAmount })
      return res.status(400).json({
        error: "Please enter a valid amount. The amount must be a positive number.",
        details: { receivedAmount: amount, parsedAmount: numericAmount },
      })
    }

    if (!description) {
      console.log("[v0] ERROR: Description is missing")
      return res.status(400).json({ error: "Description is required" })
    }

    const amountInCentavos = Math.round(numericAmount * 100)

    console.log("[v0] PayMongo payment creation:")
    console.log("[v0] - Total amount (with VAT already included from frontend):", numericAmount, "PHP")
    console.log("[v0] - Amount in centavos:", amountInCentavos)

    const paymongoResponse = await fetch("https://api.paymongo.com/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            description: description,
            remarks: `payment api integrations - session: ${Date.now()}`,
            success_url: success_url,
            failure_url: failure_url,
          },
        },
      }),
    })

    if (!paymongoResponse.ok) {
      const errorData = await paymongoResponse.json()
      console.error("PayMongo API Error:", errorData)
      return res.status(400).json({ error: "Failed to create PayMongo payment link", details: errorData })
    }

    const paymongoData = await paymongoResponse.json()
    const checkoutUrl = paymongoData.data.attributes.checkout_url

    console.log("[v0] PayMongo payment link created:", checkoutUrl)
    console.log("[v0] PayMongo response:", paymongoData)

    res.json({
      checkoutUrl: checkoutUrl,
      linkId: paymongoData.data.id,
      status: "unpaid",
      totalAmount: numericAmount,
      referenceNumber: paymongoData.data.attributes.reference_number,
    })
  } catch (error) {
    console.error("Error creating PayMongo payment link:", error)
    res.status(500).json({ error: "Internal server error", details: error.message })
  }
})

app.get("/api/check-paymongo-url", (req, res) => {
  try {
    const { url } = req.query
    const referrer = req.get("Referer") || req.get("Referrer") || ""

    console.log("=== PayMongo URL Check Debug ===")
    console.log("[v0] Received URL check request")
    console.log("[v0] Query URL parameter:", url)
    console.log("[v0] Request referrer header:", referrer)
    console.log("[v0] All request headers:", req.headers)

    const urlsToCheck = [url, referrer].filter(Boolean)

    console.log("[v0] URLs to check:", urlsToCheck)

    if (urlsToCheck.length === 0) {
      console.log("[v0] ERROR: No URLs to check")
      return res.status(400).json({ error: "URL parameter or referrer required" })
    }

    const paymongoPattern = /pm\.link\/([^/]+)\/success/

    for (const urlToCheck of urlsToCheck) {
      console.log("[v0] Testing URL:", urlToCheck)
      console.log("[v0] PayMongo pattern test:", paymongoPattern)

      const match = urlToCheck.match(paymongoPattern)
      console.log("[v0] Pattern match result:", match)

      if (match) {
        const paymentMethod = match[1]
        console.log("[v0] SUCCESS: PayMongo success URL detected!")
        console.log("[v0] Extracted payment method:", paymentMethod)

        const response = {
          isPayMongoSuccess: true,
          paymentMethod: paymentMethod,
          shouldRedirect: true,
          message: `PayMongo success detected for payment method: ${paymentMethod}`,
          debugInfo: {
            originalUrl: urlToCheck,
            patternUsed: paymongoPattern.toString(),
            matchGroups: match,
            checkedUrls: urlsToCheck,
          },
        }

        console.log("[v0] Sending success response:", response)
        return res.json(response)
      } else {
        console.log("[v0] URL does not match pattern:", paymongoPattern.toString())
        console.log("[v0] URL being tested:", urlToCheck)
        console.log("[v0] Pattern breakdown:")
        console.log("[v0] - Looking for: pm.link/{method}/success")
        console.log("[v0] - Regex pattern:", paymongoPattern.source)
        console.log("[v0] - Test result:", paymongoPattern.test(urlToCheck))
      }
    }

    console.log("[v0] INFO: Not a PayMongo success URL")
    console.log("[v0] URL does not match pattern:", paymongoPattern.toString())

    const response = {
      isPayMongoSuccess: false,
      paymentMethod: null,
      shouldRedirect: false,
      message: "Not a PayMongo success URL",
      debugInfo: {
        originalUrl: url,
        patternUsed: paymongoPattern.toString(),
        reason: "URL does not match pm.link/{method}/success pattern",
      },
    }

    console.log("[v0] Sending response:", response)
    return res.json(response)
  } catch (error) {
    console.error("[v0] ERROR in check-paymongo-url:", error)
    console.error("[v0] Error stack:", error.stack)
    res.status(500).json({
      error: "URL check failed",
      details: error.message,
      debugInfo: {
        errorType: error.constructor.name,
        errorMessage: error.message,
      },
    })
  }
})

app.put("/api/bookings/:id/update-amount", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { totalRate } = req.body

    console.log(`[${new Date().toISOString()}] updateBookingAmount called for booking ID: ${id}`)
    console.log(`New totalRate:`, totalRate)

    if (totalRate === undefined || totalRate === null) {
      return res.status(400).json({ message: "totalRate is required" })
    }

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." })
    }

    booking.pricing = booking.pricing || {}
    booking.pricing.totalRate = totalRate

    await booking.save()

    console.log(`Updated booking totalRate to: ${totalRate}`)
    res.status(200).json(booking)
  } catch (error) {
    console.error("Error updating booking amount:", error)
    res.status(500).json({ message: "Failed to update booking amount.", error: error.message })
  }
})




app.post("/api/verify-recaptcha", async (req, res) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  const recaptchaToken = req.body.recaptchaToken

  if (!secretKey) {
    console.error("Backend: RECAPTCHA_SECRET_KEY is NOT set.")
    res.status(500).json({ success: false, message: "Server configuration error: reCAPTCHA secret key missing." })
    return
  }

  if (!recaptchaToken) {
    res.status(400).json({ success: false, message: "reCAPTCHA token missing." })
    return
  }

  try {
    const params = new URLSearchParams()
    params.append("secret", secretKey)
    params.append("response", recaptchaToken)

    const googleResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const data = await googleResponse.json()

    if (data.success) {
      res.json({ success: true, message: "reCAPTCHA verified successfully!" })
    } else {
      console.error("Backend: reCAPTCHA verification failed with error codes:", data["error-codes"])
      res.status(400).json({ success: false, message: "reCAPTCHA verification failed.", errors: data["error-codes"] })
    }
  } catch (error) {
    console.error("Backend: Error during reCAPTCHA verification:", error)
    res.status(500).json({ success: false, message: "Internal server error during reCAPTCHA verification." })
  }
})

// Services Routes
app.post("/api/services/create", authenticateToken, (req, res) => createService(req, res, io))
app.get("/api/services", getServices)
app.delete("/api/services/:id", authenticateToken, (req, res) => deleteService(req, res, io))
app.get("/api/services/user/:userId", authenticateToken, getServicesByUserId)
app.get("/api/services/company/:userId", authenticateToken, getServicesByCompanyId)
app.get("/total/:companyId", getTotalServicesByCompany)
app.post("/api/services/update/:id", authenticateToken, (req, res) => updateServiceDetails(req, res, io))

app.post("/api/bookings", authenticateToken, createBookings)
app.get("/api/bookings/user", authenticateToken, getBookingsByUserId)
app.put("/api/bookings/:id/status", authenticateToken, updateBookingStatus)
app.put("/api/bookings/:id/update-status", authenticateToken, updateBookingStatusOnly)
app.put("/api/bookings/:id/payment-status", authenticateToken, updateBookingPaymentStatus)
app.put("/api/bookings/:id/service-completion", authenticateToken, updateServiceCompletion)
app.put("/api/bookings/:id/provider-arrival", authenticateToken, updateProviderArrival)
app.get("/api/bookings/all-active", authenticateToken, getAllActiveBookings)
app.get("/api/bookings/accepted-by-provider", authenticateToken, getAcceptedBookingsByProviderId)

app.get("/api/bookings/all-pending", authenticateToken, getAllPendingBookings)
app.get("/api/bookings/active-with-provider-accepted", authenticateToken, getActiveBookingsWithProviderAccepted)
app.get("/api/bookings/ongoing", authenticateToken, getOngoingBookings)
app.get("/api/bookings/completed-by-provider", authenticateToken, getCompletedBookingsByProviderId)

app.get("/api/admin/users", authenticateToken, requireAdmin, getAllUsers)
app.get("/api/bookings/:bookingId", authenticateToken, getBookingById)
app.put("/api/bookings/:bookingId/review", authenticateToken, updateBookingReview)
app.put("/api/bookings/:bookingId/skip-review", authenticateToken, skipBookingReview)
app.patch("/api/bookings/:id/release-payment", authenticateToken, releasePayment)
app.put("/api/bookings/:bookingId/provider-review", authenticateToken, updateProviderReview)
app.get("/api/bookings/company/:companyId", authenticateToken, getBookingsByCompany)
app.get("/api/bookings/revenue/:cooId", authenticateToken, getRevenueByCoo)
app.get("/api/bookings/monthly-revenue/:cooId", authenticateToken, getMonthlyRevenueByCoo)
app.get("/api/bookings/pending/:providerId", authenticateToken, getPendingBookingsByProvider)
app.get("/api/bookings/ongoing/:providerId", authenticateToken, getOngoingBookingsByProvider)
app.get("/api/bookings/active/:providerId", authenticateToken, getActiveBookingsByProvider)
app.get("/api/bookings/completed/:providerId", authenticateToken, getCompletedBookingsByProvider)


app.put("/api/admin/users/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await updateUserStatus(req, res)
    io.emit("account_update", {
      type: "status_update",
      userId: req.params.id,
      newStatus: req.body.status,
    })
    return result
  } catch (error) {
    console.error("Error updating user status:", error)
    return res.status(500).json({ message: "Failed to update user status" })
  }
})
app.put("/api/admin/users/:id/role", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await updateUserRole(req, res)
    io.emit("account_update", {
      type: "role_update",
      userId: req.params.id,
      newRole: req.body.accountType,
    })
    return result
  } catch (error) {
    console.error("Error updating user role:", error)
    return res.status(500).json({ message: "Failed to update user role" })
  }
})
app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await deleteUserAccount(req, res)
    io.emit("account_update", {
      type: "account_deleted",
      userId: req.params.id,
    })
    return result
  } catch (error) {
    console.error("Error deleting user account:", error)
    return res.status(500).json({ message: "Failed to delete user account" })
  }
})
app.get("/api/accounts/users", authenticateToken, getAllUsers)
app.post("/api/admin/create-provider-admin", authenticateToken, async (req, res) => {
  try {
    const result = await registerAccount(req, res)
    io.emit("account_update", {
      type: "account_created",
      accountType: req.body.accountType,
    })
    return result
  } catch (error) {
    console.error("Error creating provider admin:", error)
    return res.status(500).json({ message: "Failed to create provider admin" })
  }
})




app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50)

    res.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ error: "Failed to fetch notifications" })
  }
})

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params
    const notification = await Notification.findByIdAndUpdate(id, { status: "read" }, { new: true })

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" })
    }

    res.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ error: "Failed to mark notification as read" })
  }
})

app.put("/api/notifications/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params
    await Notification.updateMany({ userId, status: "unread" }, { status: "read" })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    res.status(500).json({ error: "Failed to mark all notifications as read" })
  }
})

app.delete("/api/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    await Notification.deleteMany({ userId })

    res.json({ message: "All notifications cleared" })
  } catch (error) {
    console.error("Error clearing notifications:", error)
    res.status(500).json({ error: "Failed to clear notifications" })
  }
})


app.post("/api/coupons/claim", authenticateToken, claimFirstBookingCoupon)
app.get("/api/coupons/user", authenticateToken, getUserCoupons)
app.post("/api/coupons/validate", authenticateToken, validateCoupon)
app.post("/api/coupons/apply", authenticateToken, applyCoupon)
app.post("/api/coupons/create", authenticateToken, createCoupon)
app.get("/api/coupons/company", authenticateToken, getCompanyCoupons)
app.delete("/api/coupons/:couponId", authenticateToken, deleteCoupon)
app.post("/api/coupons/compensation", authenticateToken, createCompensationCoupon)
app.delete("/api/coupons/expired", authenticateToken, deleteExpiredCoupons)
app.post("/api/coupons/send", authenticateToken, sendCouponToUser)
app.get("/api/coupons/company/:companyId", authenticateToken, getCompanyCouponsDashboard)




app.post("/api/geocode", authenticateToken, geocodeAddress)
app.get("/api/user/location", authenticateToken, getUserLocation)


// COO adding providers
app.post("/api/providers/bulk", authenticateToken, bulkAddProviders)
app.get("/api/fetchProviders", authenticateToken, fetchProviders)

// Fetch user activities
app.post("/api/allUserActivities", authenticateToken, fetchUserActivities)

// Get user profile by id (sa reports ni)
app.get("/api/user/profile", authenticateToken, getUserProfileById)

// Reports endpoints
app.post("/api/reports/create", authenticateToken, createReport)
app.get("/api/reports/all", authenticateToken, getAllReports)
app.put("/api/reports/:reportId/status", authenticateToken, updateReportStatus)

// Subscriptioon Base
app.put("/api/subscription/:userId/", authenticateToken, saveSubscription)
app.get("/api/subscription/:userId/", authenticateToken, getSubscription)

// Advertisement endpoint
app.post("/api/advertise/:userId/", authenticateToken, saveAdvertisement)
app.get("/api/advertisements", authenticateToken, showAdvertisement)

// Admin updating verification status
app.put("/api/admin/users/:userId/verify", authenticateToken, updateUserVerification)

// Getting the total providers
app.get("/api/bookings/providers/:cooId", authenticateToken, getProvidersByCoo);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Socket.IO server running on port ${PORT}`)
})

console.log(process.env.OPENROUTER_API_KEY)
console.log(process.env.RECAPTCHA_SECRET_KEY)
console.log(process.env.VITE_API_URL)