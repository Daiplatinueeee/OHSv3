import { Booking } from "../models/bookings.js"
import { User } from "../models/user.js"
import mongoose from "mongoose"
import Notification from "../models/notification.js"
import UserActivity from "../models/userActivity.js"

const formatTime12Hour = (timeString) => {
  // Handles time like "14:30" or "14:30:00"
  const [hour, minute] = timeString.split(":")
  const date = new Date()
  date.setHours(hour, minute)

  // Format time in 12-hour format without leading zero
  const options = {
    hour: "numeric", // <- removes leading zero
    minute: "2-digit",
    hour12: true,
  }

  return date.toLocaleTimeString([], options)
}

const formatReadableDate = (dateString) => {
  // Converts "2025-10-25" → "October 25, 2025"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const createBookings = async (req, res) => {
  try {
    const {
      userId,
      firstname,
      productName,
      serviceImage,
      providerName,
      providerId,
      workerCount,
      bookingDate,
      bookingTime,
      location,
      estimatedTime,
      pricing,
      specialRequests,
    } = req.body

    if (
      !userId ||
      !firstname ||
      !productName ||
      !providerName ||
      !providerId ||
      !bookingDate ||
      !bookingTime ||
      !location ||
      !pricing
    ) {
      return res.status(400).json({ message: "Missing required booking fields." })
    }

    const newBooking = new Booking({
      userId,
      firstname,
      productName,
      serviceImage,
      providerName,
      providerId,
      workerCount,
      bookingDate,
      bookingTime,
      location,
      estimatedTime,
      pricing,
      specialRequests,
      status: "pending",
      assignedWorkers: [],
      workersFilled: false,
    })

    const savedBooking = await newBooking.save()

    const formattedTime = formatTime12Hour(bookingTime)
    const formattedDate = formatReadableDate(bookingDate)

    // ✅ Create notification
    const notification = new Notification({
      userId: userId,
      title: "Booking Created Successfully",
      type: "success",
      message: `Your booking for ${productName} on ${formattedDate} at ${formattedTime} has been successfully created and is awaiting confirmation. You will receive a notification once your booking is confirmed.`,
      status: "unread",
      link: `/bookings/${savedBooking._id}`,
    })

    await notification.save()

    // ✅ Add user activity record
    await UserActivity.create({
      userId,
      action: "Booking Created",
      category: "booking",
      description: `Successfully created a booking for "${productName}" on ${formattedDate} at ${formattedTime}.`,
      status: "success",
      link: `/bookings/${savedBooking._id}`,
      relatedEntityId: savedBooking._id,
      relatedEntityType: "Booking",
    })

    res.status(201).json(savedBooking)
  } catch (error) {
    console.error("Error creating booking:", error)
    res.status(500).json({ message: "Failed to create booking.", error: error.message })
  }
}

export const getBookingsByUserId = async (req, res) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request." })
    }

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 })
    res.status(200).json(bookings)
  } catch (error) {
    console.error("Error fetching bookings by user ID:", error)
    res.status(500).json({ message: "Failed to fetch bookings.", error: error.message })
  }
}

export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params
    const userId = req.userId

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request." })
    }

    const booking = await Booking.findOne({ _id: bookingId, userId })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." })
    }

    res.status(200).json(booking)
  } catch (error) {
    console.error("Error fetching booking by ID:", error)
    res.status(500).json({ message: "Failed to fetch booking.", error: error.message })
  }
}

export const updateBookingStatus = async (req, res) => {
  try {
    const { id: bookingId } = req.params
    const { status, autoCancelDate, providerAccepted, workerName, workerId: reqWorkerId } = req.body

    console.log(`[${new Date().toISOString()}] updateBookingStatus called for booking ID: ${bookingId}`)
    console.log(`Request body:`, req.body)
    console.log(`Authenticated User ID (req.userId): ${req.userId}`)

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      console.log(`Booking not found for ID: ${bookingId}`)
      return res.status(404).json({ message: "Booking not found." })
    }

    const uniqueWorkers = []
    const seenWorkerIds = new Set()
    const seenWorkerNames = new Set()

    for (const worker of booking.assignedWorkers) {
      if (worker.workerId) {
        if (!seenWorkerIds.has(worker.workerId.toString())) {
          seenWorkerIds.add(worker.workerId.toString())
          uniqueWorkers.push(worker)
        }
      } else {
        if (!seenWorkerNames.has(worker.name)) {
          seenWorkerNames.add(worker.name)
          uniqueWorkers.push(worker)
        }
      }
    }

    booking.assignedWorkers = uniqueWorkers
    let currentAssignedWorkersCount = booking.assignedWorkers.length
    const updateFields = {}

    let notificationTitle = ""
    let notificationMessage = ""
    let notificationType = "info"

    // === Scenario 1: First provider accepts the booking ===
    if (providerAccepted !== undefined && booking.status === "active" && !booking.providerAccepted) {
      console.log(`Scenario 1: First provider acceptance triggered.`)

      const providerUser = await User.findById(req.userId).select("firstName lastName middleName")
      if (!providerUser) {
        return res.status(404).json({ message: "Provider user not found." })
      }

      const providerFullName =
        `${providerUser.firstName} ${providerUser.middleName ? providerUser.middleName + " " : ""}${providerUser.lastName}`.trim()

      const isProviderAlreadyAssigned = booking.assignedWorkers.some(
        (worker) =>
          (worker.workerId && worker.workerId.toString() === req.userId.toString()) ||
          (!worker.workerId && worker.name === providerFullName),
      )

      if (!isProviderAlreadyAssigned) {
        updateFields.$push = { assignedWorkers: { name: providerFullName, workerId: req.userId } }
        currentAssignedWorkersCount += 1
      }

      updateFields.autoCancelDate = undefined
      updateFields.providerAccepted = true

      // Notification for booking acceptance
      const formattedTime = formatTime12Hour(booking.bookingTime)
      const formattedDate = formatReadableDate(booking.bookingDate)
      notificationTitle = "Booking Accepted by Provider"
      notificationMessage = `${providerFullName} has accepted your booking for ${booking.productName} on ${formattedDate} at ${formattedTime}.`
      notificationType = "success"

      // 🕒 Additional: "All Settled, Waiting for Booking Day"
      const now = new Date()

      // Combine booking date and time into one Date object
      const bookingDateTime = new Date(`${booking.bookingDate}T${booking.bookingTime}`)

      if (bookingDateTime > now) {
        const waitingNotification = new Notification({
          userId: booking.providerId,
          title: "All Settled, Waiting for Booking Day",
          type: "info",
          message: `All workers are set for ${booking.productName} on ${booking.bookingDate} at ${formattedTime}. Waiting for the service day.`,
          status: "unread",
          link: `/provider/bookings/${booking._id}`,
        })

        await waitingNotification.save()
        console.log("Notification created: All Settled, Waiting for Booking Day")
      }
    } else if (
      providerAccepted !== undefined &&
      booking.status === "active" &&
      booking.providerAccepted &&
      currentAssignedWorkersCount < booking.workerCount
    ) {
      console.log(`Scenario 1.5: Another provider joining already-accepted booking.`)

      const providerUser = await User.findById(req.userId).select("firstName lastName middleName")
      if (!providerUser) {
        return res.status(404).json({ message: "Provider user not found." })
      }

      const providerFullName =
        `${providerUser.firstName} ${providerUser.middleName ? providerUser.middleName + " " : ""}${providerUser.lastName}`.trim()

      const isProviderAlreadyAssigned = booking.assignedWorkers.some(
        (worker) =>
          (worker.workerId && worker.workerId.toString() === req.userId.toString()) ||
          (!worker.workerId && worker.name === providerFullName),
      )

      if (isProviderAlreadyAssigned) {
        return res.status(400).json({ message: "You are already assigned to this booking." })
      }

      // Add the provider as an additional worker
      updateFields.$push = { assignedWorkers: { name: providerFullName, workerId: req.userId } }
      currentAssignedWorkersCount += 1

      const formattedTime = formatTime12Hour(booking.bookingTime)
      const formattedDate = formatReadableDate(booking.bookingDate)
      notificationTitle = "Additional Provider Assigned"
      notificationMessage = `${providerFullName} has joined your booking for ${booking.productName} on ${formattedDate} at ${formattedTime}.`
      notificationType = "success"
    }

    // === Scenario 2: Adding extra workers ===
    else if (workerName) {
      const assignedWorkerName = workerName.trim()
      const assignedWorkerId = reqWorkerId || undefined

      if (!booking.providerAccepted) {
        return res.status(400).json({ message: "Booking must be accepted by provider before assigning workers." })
      }

      if (booking.assignedWorkers.length >= booking.workerCount) {
        return res.status(400).json({ message: "All required workers have already been assigned." })
      }

      const isDuplicateWorker = booking.assignedWorkers.some(
        (worker) =>
          (assignedWorkerId && worker.workerId && worker.workerId.toString() === assignedWorkerId.toString()) ||
          (!assignedWorkerId && worker.name === assignedWorkerName && !worker.workerId),
      )

      if (isDuplicateWorker) {
        return res.status(400).json({ message: "This worker is already assigned to this booking." })
      }

      updateFields.$push = { assignedWorkers: { name: assignedWorkerName, workerId: assignedWorkerId } }
      currentAssignedWorkersCount += 1

      const formattedTime = formatTime12Hour(booking.bookingTime)
      const formattedDate = formatReadableDate(booking.bookingDate)
      notificationTitle = "Worker Assigned to Your Booking"
      notificationMessage = `${assignedWorkerName} has been assigned to your booking for ${booking.productName} on ${formattedDate} at ${formattedTime}.`
    }

    if (currentAssignedWorkersCount >= booking.workerCount) {
      updateFields.workersFilled = true
    } else {
      updateFields.workersFilled = false
    }

    if (updateFields.$push && !updateFields.status) {
      updateFields.status = "active"
    }

    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, updateFields, { new: true })

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found after update." })
    }

    // Create customer notification if applicable
    if (notificationMessage) {
      const customerNotification = new Notification({
        userId: booking.userId,
        title: notificationTitle,
        type: notificationType,
        message: notificationMessage,
        status: "unread",
        link: `/bookings/${updatedBooking._id}`,
      })
      await customerNotification.save()
    }

    res.status(200).json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({ message: "Failed to update booking status.", error: error.message })
  }
}

export const getAllActiveBookings = async (req, res) => {
  try {
    const currentUserId = req.userId

    const activeBookings = await Booking.find({
      status: "active", // Only show bookings with 'active' status
      "assignedWorkers.workerId": { $ne: currentUserId }, // Exclude bookings where current user is already assigned
    })
      .populate("userId", "firstName lastName middleName email mobileNumber profilePicture")
      .sort({ createdAt: -1 })

    const transformedBookings = activeBookings.map((booking) => {
      const bookingObj = booking.toObject()
      const user = bookingObj.userId
      const customerName = user
        ? `${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName}`.trim()
        : bookingObj.firstname || "Unknown Customer"

      return {
        ...bookingObj,
        customerName,
        serviceName: bookingObj.productName,
        date: bookingObj.bookingDate,
        time: bookingObj.bookingTime,
        image: bookingObj.serviceImage || "/placeholder.svg",
        price: bookingObj.pricing?.baseRate || 0,
        distanceCharge: bookingObj.pricing?.distanceCharge || 0,
        total: bookingObj.pricing?.totalRate || 0,
        workersRequired: bookingObj.workerCount || 1,
        workersAssigned: bookingObj.assignedWorkers?.length || 0,
        shortDescription: `${bookingObj.productName} service`,
        autoCancelDate:
          bookingObj.autoCancelDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(bookingObj.createdAt).toLocaleDateString(),
        userDetails: user,
        canAccept: bookingObj.assignedWorkers?.length < bookingObj.workerCount,
        assignedWorkers: bookingObj.assignedWorkers || [],
        location:
          typeof bookingObj.location === "object" && bookingObj.location !== null
            ? bookingObj.location.name || "Location not available"
            : bookingObj.location || "Location not available",
      }
    })

    // ==========================
    // 🕒 Notification Section
    // ==========================
    if (activeBookings.length > 0) {
      // Check if there's already an unread notification about active bookings
      const existingNotification = await Notification.findOne({
        title: "New Active Bookings Available",
        status: "unread",
      })

      if (!existingNotification) {
        const latestBooking = activeBookings[0]
        const formattedDate = new Date(latestBooking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        const formattedTime = (() => {
          if (!latestBooking.bookingTime) return "N/A"
          const [hour, minute] = latestBooking.bookingTime.split(":")
          const date = new Date()
          date.setHours(hour, minute)
          return date.toLocaleTimeString([], {
            hour: "numeric", // no leading zero
            minute: "2-digit",
            hour12: true,
          })
        })()

        const notification = new Notification({
          userId: req.userId || null,
          title: "New Active Bookings Available",
          type: "info",
          message: `There are active bookings ready for provider assignment. Latest booking: ${latestBooking.productName} scheduled on ${formattedDate} at ${formattedTime}.`,
          status: "unread",
          link: `/coo/bookings/active/${latestBooking._id}`,
        })

        await notification.save()
        console.log("Notification created: New Active Bookings Available")
      } else {
        console.log("Notification already exists for active bookings, skipping creation")
      }
    }

    res.status(200).json(transformedBookings)
  } catch (error) {
    console.error("Error fetching all active bookings:", error)
    res.status(500).json({ message: "Failed to fetch all active bookings.", error: error.message })
  }
}

export const getCompletedBookingsByProviderId = async (req, res) => {
  try {
    const providerId = req.userId
    if (!providerId) {
      return res.status(400).json({ message: "Provider ID not found in request." })
    }

    const completedBookings = await Booking.find({
      providerId: providerId,
      status: "completed",
    })
      .populate("userId", "firstName lastName middleName email mobileNumber profilePicture")
      .sort({ completedDate: -1, createdAt: -1 })

    const transformedBookings = completedBookings.map((booking) => {
      const bookingObj = booking.toObject()
      const user = bookingObj.userId
      const provider = bookingObj.providerId

      const customerName = user
        ? `${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName}`.trim()
        : bookingObj.firstname || "Unknown Customer"

      const providerName = provider
        ? `${provider.firstName} ${provider.middleName ? provider.middleName + " " : ""}${provider.lastName}`.trim()
        : bookingObj.providerName || "Unknown Provider"

      const confirmation = bookingObj.confirmation || false

      return {
        ...bookingObj,
        customerName,
        providerName,
        serviceName: bookingObj.productName,
        date: bookingObj.bookingDate,
        time: bookingObj.bookingTime,
        image: bookingObj.serviceImage || "/placeholder.svg",
        price: bookingObj.pricing?.baseRate || 0,
        distanceCharge: bookingObj.pricing?.distanceCharge || 0,
        total: bookingObj.pricing?.totalRate || 0,
        totalBalance: bookingObj.pricing?.totalRate || 0,
        workersRequired: bookingObj.workerCount || 1,
        workersAssigned: bookingObj.assignedWorkers?.length || 0,
        shortDescription: `${bookingObj.productName} service`,
        autoCancelDate:
          bookingObj.autoCancelDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(bookingObj.createdAt).toLocaleDateString(),
        userDetails: user,
        providerDetails: provider,
        assignedWorkers: bookingObj.assignedWorkers || [],
        paymentMethod: bookingObj.paymentMethod || null,
        paymentComplete: bookingObj.paymentComplete || false,
        confirmation: confirmation,
        location:
          typeof bookingObj.location === "object" && bookingObj.location !== null
            ? bookingObj.location.name || "Location not available"
            : bookingObj.location || "Location not available",
        serviceProvider: {
          id: provider?._id || bookingObj.providerId,
          name: providerName,
          avatar: provider?.profilePicture || "/placeholder.svg",
          initials: providerName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          status: bookingObj.providerConfirmation ? "confirmed" : "waiting",
          email: provider?.email || "N/A",
          phone: provider?.mobileNumber || "N/A",
        },
        customer: {
          id: user?._id || bookingObj.userId,
          name: customerName,
          avatar: user?.profilePicture || "/placeholder.svg",
          initials: customerName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          status: bookingObj.customerConfirmation ? "confirmed" : "waiting",
          email: user?.email || "N/A",
          phone: user?.mobileNumber || "N/A",
        },
      }
    })

    // ====================================================
    // 🕒 Notification Section (No duplicates allowed)
    // ====================================================
    if (completedBookings.length > 0) {
      const existingNotification = await Notification.findOne({
        userId: providerId,
        title: "New Completed Booking",
        status: "unread",
      })

      if (!existingNotification) {
        const latestBooking = completedBookings[0]
        const formattedDate = new Date(latestBooking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        const formattedTime = (() => {
          if (!latestBooking.bookingTime) return "N/A"
          const [hour, minute] = latestBooking.bookingTime.split(":")
          const date = new Date()
          date.setHours(hour, minute)
          return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        })()

        const notification = new Notification({
          userId: providerId,
          title: "New Completed Booking",
          type: "success",
          message: `Your service for ${latestBooking.productName} with ${latestBooking.firstname} has been completed on ${formattedDate} at ${formattedTime}.`,
          status: "unread",
          link: `/provider/bookings/completed/${latestBooking._id}`,
        })

        await notification.save()
        console.log("✅ Notification created: New Completed Booking")
      } else {
        console.log("ℹ️ Notification already exists, skipping creation.")
      }
    }

    console.log(`Found ${transformedBookings.length} completed bookings for provider ID: ${providerId}`)
    res.status(200).json(transformedBookings)
  } catch (error) {
    console.error("❌ Error fetching completed bookings by provider ID:", error)
    res.status(500).json({ message: "Failed to fetch completed bookings.", error: error.message })
  }
}

export const getAllPendingBookings = async (req, res) => {
  try {
    const pendingBookings = await Booking.find({ status: "pending" })
      .populate("userId", "firstName lastName middleName email mobileNumber profilePicture")
      .sort({ createdAt: -1 })

    const transformedBookings = pendingBookings.map((booking) => {
      const bookingObj = booking.toObject()
      const user = bookingObj.userId
      const customerName = user
        ? `${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName}`.trim()
        : bookingObj.firstname || "Unknown Customer"

      return {
        ...bookingObj,
        customerName,
        serviceName: bookingObj.productName,
        date: bookingObj.bookingDate,
        time: bookingObj.bookingTime,
        image: bookingObj.serviceImage || "/placeholder.svg",
        price: bookingObj.pricing?.baseRate || 0,
        distanceCharge: bookingObj.pricing?.distanceCharge || 0,
        total: bookingObj.pricing?.totalRate || 0,
        workersRequired: bookingObj.workerCount || 1,
        workersAssigned: bookingObj.assignedWorkers?.length || 0,
        shortDescription: `${bookingObj.productName} service`,
        autoCancelDate:
          bookingObj.autoCancelDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(bookingObj.createdAt).toLocaleDateString(),
        userDetails: user,
        assignedWorkers: bookingObj.assignedWorkers || [],
        paymentMethod: bookingObj.paymentMethod || null,
        paymentComplete: bookingObj.paymentComplete || false,
        location:
          typeof bookingObj.location === "object" && bookingObj.location !== null
            ? bookingObj.location.name || "Location not available"
            : bookingObj.location || "Location not available",
      }
    })

    // ==========================
    // 🕒 Notification Section
    // ==========================
    if (pendingBookings.length > 0) {
      // Check if there's already an unread notification about pending bookings
      const existingNotification = await Notification.findOne({
        title: "New Pending Booking",
        status: "unread",
      })

      // Only create a new notification if none exists
      if (!existingNotification) {
        const latestBooking = pendingBookings[0]
        const formattedDate = new Date(latestBooking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        const formattedTime = (() => {
          if (!latestBooking.bookingTime) return "N/A"
          const [hour, minute] = latestBooking.bookingTime.split(":")
          const date = new Date()
          date.setHours(hour, minute)
          return date.toLocaleTimeString([], {
            hour: "numeric", // no leading zero
            minute: "2-digit",
            hour12: true,
          })
        })()

        const notification = new Notification({
          userId: req.userId || null, // whoever fetched this (admin/COO)
          title: "New Pending Booking",
          type: "info",
          message: `A new booking for ${latestBooking.productName} by ${latestBooking.firstname} is pending approval. Scheduled on ${formattedDate} at ${formattedTime}.`,
          status: "unread",
          link: `/coo/bookings/pending/${latestBooking._id}`,
        })

        await notification.save()
        console.log("Notification created: New Pending Booking")
      } else {
        console.log("Notification already exists, skipping creation")
      }
    }

    res.status(200).json(transformedBookings)
  } catch (error) {
    console.error("Error fetching all pending bookings:", error)
    res.status(500).json({ message: "Failed to fetch all pending bookings.", error: error.message })
  }
}

export const getAcceptedBookingsByProviderId = async (req, res) => {
  try {
    const providerId = req.userId
    if (!providerId) {
      return res.status(400).json({ message: "Provider ID not found in request." })
    }

    const acceptedBookings = await Booking.find({
      "assignedWorkers.workerId": providerId, // Current user is in assignedWorkers
      status: { $in: ["active", "ongoing"] }, // Bookings that are active or ongoing
    })
      .populate("userId", "firstName lastName middleName email mobileNumber profilePicture")
      .sort({ createdAt: -1 })

    const transformedBookings = acceptedBookings.map((booking) => {
      const bookingObj = booking.toObject()
      const user = bookingObj.userId
      const customerName = user
        ? `${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName}`.trim()
        : bookingObj.firstname || "Unknown Customer"

      return {
        ...bookingObj,
        customerName,
        serviceName: bookingObj.productName,
        date: bookingObj.bookingDate,
        time: bookingObj.bookingTime,
        image: bookingObj.serviceImage || "/placeholder.svg",
        price: bookingObj.pricing?.baseRate || 0,
        distanceCharge: bookingObj.pricing?.distanceCharge || 0,
        total: bookingObj.pricing?.totalRate || 0,
        workersRequired: bookingObj.workerCount || 1,
        workersAssigned: bookingObj.assignedWorkers?.length || 0,
        shortDescription: `${bookingObj.productName} service`,
        autoCancelDate:
          bookingObj.autoCancelDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(bookingObj.createdAt).toLocaleDateString(),
        userDetails: user,
        assignedWorkers: bookingObj.assignedWorkers || [],
        location:
          typeof bookingObj.location === "object" && bookingObj.location !== null
            ? bookingObj.location.name || "Location not available"
            : bookingObj.location || "Location not available",
      }
    })

    // ==========================
    // 🕒 Notification Section
    // ==========================
    if (acceptedBookings.length > 0) {
      const latestBooking = acceptedBookings[0]

      // Check if a similar notification already exists
      const existingNotification = await Notification.findOne({
        userId: providerId,
        title: "Booking Accepted Successfully",
        link: `/provider/bookings/${latestBooking._id}`,
      })

      if (!existingNotification) {
        const formattedDate = new Date(latestBooking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        const formattedTime = (() => {
          if (!latestBooking.bookingTime) return "N/A"
          const [hour, minute] = latestBooking.bookingTime.split(":")
          const date = new Date()
          date.setHours(hour, minute)
          return date.toLocaleTimeString([], {
            hour: "numeric", // no leading zero
            minute: "2-digit",
            hour12: true,
          })
        })()

        const notification = new Notification({
          userId: providerId,
          title: "Booking Accepted Successfully",
          type: "success",
          message: `You have successfully accepted a booking for ${latestBooking.productName}. The service is scheduled on ${formattedDate} at ${formattedTime}.`,
          status: "unread",
          link: `/provider/bookings/${latestBooking._id}`,
        })

        await notification.save()
        console.log("✅ Notification created: Booking Accepted Successfully")
      } else {
        console.log("Notification already exists for accepted booking, skipping creation.")
      }
    }

    res.status(200).json(transformedBookings)
  } catch (error) {
    console.error("Error fetching accepted bookings by provider ID:", error)
    res.status(500).json({ message: "Failed to fetch accepted bookings.", error: error.message })
  }
}

export const updateBookingStatusOnly = async (req, res) => {
  try {
    const { id } = req.params
    const { status, declineReason, paymentMethod, paymentComplete } = req.body

    console.log(`[${new Date().toISOString()}] updateBookingStatusOnly called for booking ID: ${id}`)
    console.log(`Request body:`, req.body)
    console.log(`Authenticated User ID (req.userId): ${req.userId}`)

    const booking = await Booking.findById(id)
    if (!booking) {
      console.log(`Booking not found for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found." })
    }

    const updateFields = {}

    // Handle different booking states
    if (booking.status === "pending" && status === "ongoing") {
      updateFields.status = "ongoing"
      console.log(`COO accepted pending booking, status set to ongoing without worker assignment`)
    } else if (booking.status === "pending" && status === "declined") {
      updateFields.status = "declined"
      if (declineReason) updateFields.declineReason = declineReason
    } else if (status === "active") {
      updateFields.status = "active"
      if (paymentMethod !== undefined) updateFields.paymentMethod = paymentMethod
      if (paymentComplete !== undefined) updateFields.paymentComplete = paymentComplete
    } else if (booking.status === "ongoing" && (paymentMethod !== undefined || paymentComplete !== undefined)) {
      if (paymentMethod !== undefined) updateFields.paymentMethod = paymentMethod
      if (paymentComplete !== undefined) updateFields.paymentComplete = paymentComplete
    } else if (paymentMethod !== undefined || paymentComplete !== undefined) {
      if (paymentMethod !== undefined) updateFields.paymentMethod = paymentMethod
      if (paymentComplete !== undefined) updateFields.paymentComplete = paymentComplete
    } else if (status && !["ongoing", "declined", "active"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Only 'ongoing', 'declined', or 'active' are allowed." })
    }

    console.log(`Final updateFields before DB call:`, JSON.stringify(updateFields, null, 2))

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateFields, { new: true })

    if (!updatedBooking) {
      console.log(`Booking not found after update for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found after update." })
    }

    // === Notification Logic ===
    const formattedTime = formatTime12Hour(updatedBooking.bookingTime)
    const formattedDate = formatReadableDate(updatedBooking.bookingDate)
    let notificationMessage = ""
    let notificationTitle = ""

    switch (updatedBooking.status) {
      case "ongoing":
        notificationTitle = "Booking Accepted"
        notificationMessage = `Your booking for ${updatedBooking.productName} on ${formattedDate} at ${formattedTime} has been accepted and is now ongoing. It's time to settle the payment to proceed, bookings not paid within 12 hours will be automatically canceled.`

        // ✅ Add user activity for accepted booking
        await UserActivity.create({
          userId: req.userId,
          action: "Accepted Booking",
          category: "booking",
          description: `Accepted booking for "${updatedBooking.productName}" scheduled on ${formattedDate} at ${formattedTime}.`,
          status: "success",
          link: `/bookings/${updatedBooking._id}`,
          relatedEntityId: updatedBooking._id,
          relatedEntityType: "Booking",
        })
        console.log("User activity logged: Accepted Booking")
        break

      case "declined":
        notificationTitle = "Booking Declined"
        notificationMessage = `Your booking for ${updatedBooking.productName} was declined.${
          updatedBooking.declineReason ? ` Reason: ${updatedBooking.declineReason}` : ""
        }`
        break

      case "active":
        notificationTitle = "Booking Active"
        notificationMessage = `Your booking for ${updatedBooking.productName} is now active.`
        break

      default:
        if (paymentComplete) {
          notificationTitle = "Payment Settled"
          notificationMessage = `Payment for your booking (${updatedBooking.productName}) has been successfully confirmed.`
        }
        break
    }

    if (notificationMessage) {
      const notification = new Notification({
        userId: updatedBooking.userId,
        title: notificationTitle,
        type: "info",
        message: notificationMessage,
        status: "unread",
        link: `/bookings/${updatedBooking._id}`,
      })

      await notification.save()
      console.log("Notification created successfully:", notificationTitle)
    }

    console.log(`Updated booking status to: ${updatedBooking.status}`)
    res.status(200).json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({ message: "Failed to update booking status.", error: error.message })
  }
}

export const updateBookingPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, paymentMethod, paymentComplete, totalRate } = req.body

    console.log(`[${new Date().toISOString()}] updateBookingPaymentStatus called for booking ID: ${id}`)
    console.log(`Request body:`, req.body)

    const booking = await Booking.findById(id)
    if (!booking) {
      console.log(`Booking not found for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found." })
    }

    if (booking.status !== "ongoing" && booking.status !== "pending") {
      return res.status(400).json({ message: "Payment can only be updated for ongoing or pending bookings." })
    }

    const updateFields = {}

    if (paymentMethod !== undefined) {
      updateFields.paymentMethod = paymentMethod
    }
    if (paymentComplete !== undefined) {
      updateFields.paymentComplete = paymentComplete
    }
    if (status !== undefined) {
      updateFields.status = status
    }

    if (totalRate !== undefined) {
      updateFields["pricing.totalRate"] = totalRate
      console.log(`Updating booking pricing.totalRate to: ${totalRate}`)
    }

    if (paymentComplete === true && status === "active") {
      updateFields.paymentCompleteDate = new Date()
    }

    console.log(`Final updateFields before DB call:`, JSON.stringify(updateFields, null, 2))
    const updatedBooking = await Booking.findByIdAndUpdate(id, updateFields, { new: true })

    if (!updatedBooking) {
      console.log(`Booking not found after update for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found after update." })
    }

    // === Notification Logic ===
    const formattedTime = formatTime12Hour(updatedBooking.bookingTime)
    const formattedDate = formatReadableDate(updatedBooking.bookingDate)
    let notificationTitle = ""
    let notificationMessage = ""
    let notificationType = "info"

    if (paymentComplete) {
      notificationTitle = "Payment Settled"
      notificationMessage = `Your payment for ${updatedBooking.productName} on ${formattedDate} at ${formattedTime} has been successfully confirmed. Your booking is now waiting for provider acceptance. If no provider accepts your booking, it will be automatically canceled 2 days prior to the scheduled date.`
      notificationType = "success"

      // ✅ Create user activity properly
      const userActivity = new UserActivity({
        userId: updatedBooking.userId,
        action: "Payment Settled",
        category: "payment",
        description: `Payment completed successfully for ${updatedBooking.productName} on ${formattedDate} at ${formattedTime}.`,
        status: "success",
        link: `/bookings/${updatedBooking._id}`,
        relatedEntityId: updatedBooking._id,
        relatedEntityType: "Booking",
      })

      await userActivity.save()
      console.log("✅ User activity logged successfully (Payment Settled).")
    } else if (paymentMethod) {
      notificationTitle = "Payment Method Updated"
      notificationMessage = `Your booking for ${updatedBooking.productName} on ${updatedBooking.bookingDate} at ${formattedTime} now uses ${updatedBooking.paymentMethod} as the payment method.`
      notificationType = "info"
    } else if (totalRate !== undefined) {
      notificationTitle = "Updated Service Rate"
      notificationMessage = `The total rate for your booking (${updatedBooking.productName}) has been updated to ₱${updatedBooking.pricing.totalRate}.`
      notificationType = "warning"
    }

    if (notificationMessage) {
      const notification = new Notification({
        userId: updatedBooking.userId,
        title: notificationTitle,
        type: notificationType,
        message: notificationMessage,
        status: "unread",
        link: `/bookings/${updatedBooking._id}`,
      })

      await notification.save()
      console.log("Notification created successfully:", notificationTitle)
    }

    console.log(
      `Updated booking payment status: ${updatedBooking.status}, Payment Complete: ${updatedBooking.paymentComplete}, Total Rate: ${updatedBooking.pricing?.totalRate}`,
    )

    res.status(200).json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking payment status:", error)
    res.status(500).json({ message: "Failed to update booking payment status.", error: error.message })
  }
}

export const getActiveBookingsWithProviderAccepted = async (req, res) => {
  try {
    const providerId = req.userId
    if (!providerId) {
      console.error("Provider ID not found in request - authentication middleware may not be working")
      return res.status(401).json({ message: "Authentication required. Provider ID not found." })
    }

    console.log(`[${new Date().toISOString()}] getActiveBookingsWithProviderAccepted called by provider: ${providerId}`)

    const activeBookings = await Booking.find({
      status: "active",
      providerAccepted: true,
      paymentComplete: true,
      $or: [{ serviceComplete: { $exists: false } }, { serviceComplete: false }],
    })
      .populate("userId", "firstName lastName middleName email mobileNumber profilePicture")
      .populate("assignedWorkers.workerId", "firstName lastName middleName email mobileNumber profilePicture")
      .sort({ createdAt: -1 })

    const transformedBookings = activeBookings.map((booking) => {
      const bookingObj = booking.toObject()
      const user = bookingObj.userId

      const firstWorker =
        bookingObj.assignedWorkers && bookingObj.assignedWorkers.length > 0 ? bookingObj.assignedWorkers[0] : null

      const workerIdToUse = firstWorker?.workerId?._id || firstWorker?.workerId
      const providerUser = firstWorker?.workerId

      const customerName = user
        ? `${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName}`.trim()
        : bookingObj.firstname || "Unknown Customer"

      const providerName = providerUser
        ? `${providerUser.firstName} ${providerUser.middleName ? providerUser.middleName + " " : ""}${providerUser.lastName}`.trim()
        : firstWorker?.name || bookingObj.providerName || "Unknown Provider"

      const confirmation = bookingObj.confirmation || false

      return {
        ...bookingObj,
        customerName,
        providerName,
        serviceName: bookingObj.productName,
        date: bookingObj.bookingDate,
        time: bookingObj.bookingTime,
        image: bookingObj.serviceImage || "/placeholder.svg",
        price: bookingObj.pricing?.baseRate || 0,
        distanceCharge: bookingObj.pricing?.distanceCharge || 0,
        total: bookingObj.pricing?.totalRate || 0,
        totalBalance: bookingObj.pricing?.totalRate || 0,
        workersRequired: bookingObj.workerCount || 1,
        workersAssigned: bookingObj.assignedWorkers?.length || 0,
        shortDescription: `${bookingObj.productName} service`,
        autoCancelDate:
          bookingObj.autoCancelDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(bookingObj.createdAt).toLocaleDateString(),
        userDetails: user,
        providerDetails: providerUser || null,
        assignedWorkers: bookingObj.assignedWorkers || [],
        paymentMethod: bookingObj.paymentMethod || null,
        paymentComplete: bookingObj.paymentComplete || false,
        confirmation,
        location:
          typeof bookingObj.location === "object" && bookingObj.location !== null
            ? bookingObj.location.name || "Location not available"
            : bookingObj.location || "Location not available",
        serviceProvider: {
          id: workerIdToUse || null,
          name: providerName,
          avatar: providerUser?.profilePicture || "/placeholder.svg",
          initials: providerName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          status: bookingObj.providerConfirmation ? "confirmed" : "waiting",
          email: providerUser?.email || "N/A",
          phone: providerUser?.mobileNumber || "N/A",
        },
        customer: {
          id: user?._id || bookingObj.userId,
          name: customerName,
          avatar: user?.profilePicture || "/placeholder.svg",
          initials: customerName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          status: bookingObj.customerConfirmation ? "confirmed" : "waiting",
          email: user?.email || "N/A",
          phone: user?.mobileNumber || "N/A",
        },
      }
    })

    // ===============================
    // 🕒 Notification Section
    // ===============================
    if (activeBookings.length > 0) {
      const existingNotification = await Notification.findOne({
        title: "New Holding Transactions Waiting for Release",
        userId: providerId,
        status: "unread",
      })

      // Only create a new notification if none exists
      if (!existingNotification) {
        const latestBooking = activeBookings[0]

        const formattedDate = new Date(latestBooking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        const formattedTime = (() => {
          if (!latestBooking.bookingTime) return "N/A"
          const [hour, minute] = latestBooking.bookingTime.split(":")
          const date = new Date()
          date.setHours(hour, minute)
          return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        })()

        const waitingNotification = new Notification({
          userId: providerId,
          title: "New Holding Transactions Waiting for Release",
          type: "info",
          message: `Here are new holding transactions from your completed services. Payment for ${latestBooking.productName} is currently being verified before release.`,
          status: "unread",
          link: `/provider/bookings/${latestBooking._id}`,
        })

        await waitingNotification.save()
        console.log("Notification created: New Holding Transactions Waiting for Release")
      } else {
        console.log("Notification already exists for holding transactions, skipping creation")
      }
    }

    console.log(`Found ${transformedBookings.length} active bookings with provider accepted`)
    res.status(200).json(transformedBookings)
  } catch (error) {
    console.error("Error fetching active bookings with provider accepted:", error)
    res.status(500).json({
      message: "Failed to fetch active bookings with provider accepted.",
      error: error.message,
    })
  }
}

export const updateServiceCompletion = async (req, res) => {
  try {
    const { id } = req.params
    const { providerConfirmation, customerConfirmation, serviceComplete, review, rating, destinationArrived } = req.body

    console.log(`[${new Date().toISOString()}] updateServiceCompletion called for booking ID: ${id}`)
    console.log(`Request body:`, req.body)

    const booking = await Booking.findById(id)
    if (!booking) {
      console.log(`Booking not found for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found." })
    }

    const updateFields = {}

    if (destinationArrived !== undefined) {
      updateFields.destinationArrived = destinationArrived
      console.log(`Destination arrived updated to: ${destinationArrived}`)
    }

    if (providerConfirmation !== undefined) {
      updateFields.providerConfirmation = providerConfirmation
      console.log(`Provider confirmation updated to: ${providerConfirmation}`)
    }

    if (customerConfirmation !== undefined) {
      updateFields.customerConfirmation = customerConfirmation
      console.log(`Customer confirmation updated to: ${customerConfirmation}`)
      // Do NOT change status to completed here - wait for admin to release payment
    }

    if (serviceComplete !== undefined) {
      updateFields.serviceComplete = serviceComplete
      console.log(`Service complete updated to: ${serviceComplete}`)
    }

    if (review !== undefined) {
      updateFields.review = review
      console.log(`Review updated to: ${review}`)
    }

    if (rating !== undefined) {
      updateFields.rating = rating
      console.log(`Rating updated to: ${rating}`)
    }

    console.log(`Final updateFields before DB call:`, JSON.stringify(updateFields, null, 2))
    const updatedBooking = await Booking.findByIdAndUpdate(id, updateFields, { new: true })

    if (!updatedBooking) {
      console.log(`Booking not found after update for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found after update." })
    }

    console.log(`Updated booking service completion status successfully`)

    // =========================
    // 🕒 Notifications Section
    // =========================

    // Helper: readable date and clean 12-hour time format
    const formatReadableDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const formatTime12Hour = (timeString) => {
      if (!timeString) return "N/A"
      const [hour, minute] = timeString.split(":")
      const date = new Date()
      date.setHours(hour, minute)
      return date.toLocaleTimeString([], {
        hour: "numeric", // removes leading zero
        minute: "2-digit",
        hour12: true,
      })
    }

    const formattedDate = formatReadableDate(booking.bookingDate)
    const formattedTime = formatTime12Hour(booking.bookingTime)

    if (serviceComplete === true) {
      // ✅ Notify Customer
      const customerNotification = new Notification({
        userId: booking.userId,
        title: "Service Completed",
        type: "success",
        message: `Your service for ${booking.productName} on ${formattedDate} at ${formattedTime} has been completed successfully. Thank you for using our service!`,
        status: "unread",
        link: `/bookings/${booking._id}`,
      })
      await customerNotification.save()

      // ✅ Notify Provider
      const providerNotification = new Notification({
        userId: booking.providerId,
        title: "Service Completion Confirmed",
        type: "success",
        message: `The service for ${booking.productName} on ${formattedDate} at ${formattedTime} has been marked as completed by the customer.`,
        status: "unread",
        link: `/provider/bookings/${booking._id}`,
      })
      await providerNotification.save()

      console.log("Notifications sent: Service Completed (Customer & Provider)")
    }

    res.status(200).json(updatedBooking)
  } catch (error) {
    console.error("Error updating service completion:", error)
    res.status(500).json({ message: "Failed to update service completion.", error: error.message })
  }
}

export const updateProviderArrival = async (req, res) => {
  try {
    const { id } = req.params
    const { destinationArrived, providerConfirmation } = req.body

    console.log(`[${new Date().toISOString()}] updateProviderArrival called for booking ID: ${id}`)
    console.log(`Request body:`, req.body)

    const booking = await Booking.findById(id)
    if (!booking) {
      console.log(`Booking not found for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found." })
    }

    const updateFields = {}

    if (destinationArrived !== undefined) {
      updateFields.destinationArrived = destinationArrived
      updateFields.arrivalTime = new Date()
      console.log(`Destination arrived updated to: ${destinationArrived}`)
    }

    if (providerConfirmation !== undefined) {
      updateFields.providerConfirmation = providerConfirmation
      console.log(`Provider confirmation updated to: ${providerConfirmation}`)
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateFields, { new: true })

    if (!updatedBooking) {
      console.log(`Booking not found after update for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found after update." })
    }

    console.log(`Updated provider arrival status successfully`)
    res.status(200).json(updatedBooking)
  } catch (error) {
    console.error("Error updating provider arrival:", error)
    res.status(500).json({ message: "Failed to update provider arrival.", error: error.message })
  }
}

export const updateBookingReview = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { rating, review } = req.body
    const userId = req.userId

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request." })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." })
    }

    const existingBooking = await Booking.findOne({ _id: bookingId, userId })
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found." })
    }

    if (existingBooking.status !== "completed" && existingBooking.status !== "active") {
      return res.status(400).json({ message: "Can only rate active or completed services." })
    }

    if (existingBooking.isRated) {
      return res.status(400).json({ message: "This booking has already been rated." })
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, userId },
      {
        rating: rating || null,
        review: review || null,
        reviewDate: rating ? new Date() : null,
        isRated: true,
        status: "completed",
        completedDate: new Date(),
      },
      { new: true },
    )

    if (rating && existingBooking.companyId) {
      const customer = await User.findById(userId)
      const Company = mongoose.model("Company") // Assuming you have a Company model

      if (customer) {
        const company = await Company.findById(existingBooking.companyId)

        if (company) {
          const newTotalRatingPoints = (company.totalRatingPoints || 0) + rating
          const newTotalReviews = (company.totalReviews || 0) + 1
          const newAverageRating = newTotalRatingPoints / newTotalReviews

          await Company.findByIdAndUpdate(existingBooking.companyId, {
            totalRatingPoints: newTotalRatingPoints,
            totalReviews: newTotalReviews,
            averageRating: Math.round(newAverageRating * 100) / 100,
            $push: {
              ratings: {
                bookingId: bookingId,
                customerId: userId,
                customerName: customer.username || `${customer.firstName} ${customer.lastName}`.trim(),
                rating: rating,
                review: review || "",
                serviceType: existingBooking.productName,
                reviewDate: new Date(),
              },
            },
          })
        }
      }
    }

    res.status(200).json(booking)
  } catch (error) {
    console.error("Error updating booking review:", error)
    res.status(500).json({ message: "Failed to update booking review.", error: error.message })
  }
}

export const skipBookingReview = async (req, res) => {
  try {
    const { bookingId } = req.params
    const userId = req.userId

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request." })
    }

    const existingBooking = await Booking.findOne({ _id: bookingId, userId })
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found." })
    }

    if (existingBooking.status !== "completed" && existingBooking.status !== "active") {
      return res.status(400).json({ message: "Can only complete active services." })
    }

    if (existingBooking.isRated) {
      return res.status(400).json({ message: "This booking has already been completed." })
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, userId },
      {
        isRated: true,
        status: "completed",
        completedDate: new Date(),
      },
      { new: true },
    )

    res.status(200).json(booking)
  } catch (error) {
    console.error("Error skipping booking review:", error)
    res.status(500).json({ message: "Failed to skip booking review.", error: error.message })
  }
}

export const getOngoingBookings = async (req, res) => {
  try {
    const providerId = req.userId
    if (!providerId) {
      return res.status(400).json({ message: "Provider ID not found in request." })
    }

    const ongoingBookings = await Booking.find({ status: "ongoing" })
      .populate("userId", "firstName lastName middleName email mobileNumber profilePicture")
      .sort({ createdAt: -1 })

    const transformedBookings = ongoingBookings.map((booking) => {
      const bookingObj = booking.toObject()
      const user = bookingObj.userId
      const customerName = user
        ? `${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName}`.trim()
        : bookingObj.firstname || "Unknown Customer"

      return {
        ...bookingObj,
        customerName,
        serviceName: bookingObj.productName,
        date: bookingObj.bookingDate,
        time: bookingObj.bookingTime,
        image: bookingObj.serviceImage || "/placeholder.svg",
        price: bookingObj.pricing?.baseRate || 0,
        distanceCharge: bookingObj.pricing?.distanceCharge || 0,
        total: bookingObj.pricing?.totalRate || 0,
        workersRequired: bookingObj.workerCount || 1,
        workersAssigned: bookingObj.assignedWorkers?.length || 0,
        shortDescription: `${bookingObj.productName} service`,
        autoCancelDate:
          bookingObj.autoCancelDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: new Date(bookingObj.createdAt).toLocaleDateString(),
        userDetails: user,
        assignedWorkers: bookingObj.assignedWorkers || [],
        paymentMethod: bookingObj.paymentMethod || null,
        paymentComplete: bookingObj.paymentComplete || false,
        location:
          typeof bookingObj.location === "object" && bookingObj.location !== null
            ? bookingObj.location.name || "Location not available"
            : bookingObj.location || "Location not available",
      }
    })

    // ==========================
    // 🕒 Notification Section
    // ==========================
    if (ongoingBookings.length > 0) {
      // Check if there's already an unread notification about ongoing bookings
      const existingNotification = await Notification.findOne({
        title: "Ongoing Service in Progress",
        status: "unread",
      })

      // Only create a new notification if none exists
      if (!existingNotification) {
        const latestBooking = ongoingBookings[0]

        const formattedDate = new Date(latestBooking.bookingDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        const formattedTime = (() => {
          if (!latestBooking.bookingTime) return "N/A"
          const [hour, minute] = latestBooking.bookingTime.split(":")
          const date = new Date()
          date.setHours(hour, minute)
          return date.toLocaleTimeString([], {
            hour: "numeric", // no leading zero (e.g., 4:00 PM not 04:00 PM)
            minute: "2-digit",
            hour12: true,
          })
        })()

        // Notify provider about ongoing service
        const providerNotification = new Notification({
          userId: providerId,
          title: "Ongoing Service in Progress",
          type: "info",
          message: `Your service for ${latestBooking.productName} with ${latestBooking.firstname} is now ongoing. Scheduled on ${formattedDate} at ${formattedTime}.`,
          status: "unread",
          link: `/provider/bookings/${latestBooking._id}`,
        })
        await providerNotification.save()

        // Optional: notify COO/Admin
        const adminNotification = new Notification({
          userId: null, // or specific admin user ID if available
          title: "Ongoing Service in Progress",
          type: "info",
          message: `A service for ${latestBooking.productName} by ${latestBooking.firstname} is currently ongoing. Scheduled on ${formattedDate} at ${formattedTime}.`,
          status: "unread",
          link: `/coo/bookings/ongoing/${latestBooking._id}`,
        })
        await adminNotification.save()

        console.log("Notifications created: Ongoing Booking (Provider & Admin)")
      } else {
        console.log("Notification already exists, skipping creation")
      }
    }

    res.status(200).json(transformedBookings)
  } catch (error) {
    console.error("Error fetching ongoing bookings:", error)
    res.status(500).json({ message: "Failed to fetch ongoing bookings.", error: error.message })
  }
}

export const releasePayment = async (req, res) => {
  try {
    const { id } = req.params
    const { status, serviceComplete } = req.body

    console.log(`[${new Date().toISOString()}] releasePayment called for booking ID: ${id}`)
    console.log(`Request body:`, req.body)

    const booking = await Booking.findById(id)
    if (!booking) {
      console.log(`Booking not found for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found." })
    }

    if (booking.status !== "active") {
      return res.status(400).json({ message: "Payment can only be released for active bookings." })
    }

    if (!booking.paymentComplete) {
      return res.status(400).json({ message: "Payment must be completed before release." })
    }

    // 🧠 Ensure both sides marked completion
    if (!booking.providerConfirmation || !booking.customerConfirmation) {
      return res.status(400).json({
        message: "Both provider and customer must confirm completion before payment can be released.",
      })
    }

    const updateFields = {
      status: status || "completed",
      serviceComplete: serviceComplete !== undefined ? serviceComplete : true,
      completedDate: new Date(),
      paymentReleaseDate: new Date(),
    }

    console.log(`Final updateFields before DB call:`, JSON.stringify(updateFields, null, 2))

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateFields, { new: true })

    if (!updatedBooking) {
      console.log(`Booking not found after update for ID: ${id}`)
      return res.status(404).json({ message: "Booking not found after update." })
    }

    // ===============================
    // 🕒 Date & Time Formatting
    // ===============================
    const formatReadableDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const formatTime12Hour = (timeString) => {
      if (!timeString) return "N/A"
      const [hour, minute] = timeString.split(":")
      const date = new Date()
      date.setHours(hour, minute)
      return date.toLocaleTimeString([], {
        hour: "numeric", // removes leading zero
        minute: "2-digit",
        hour12: true,
      })
    }

    const formattedDate = formatReadableDate(booking.bookingDate)
    const formattedTime = formatTime12Hour(booking.bookingTime)

    // ===============================
    // 📢 Notifications Section
    // ===============================

    // ✅ Notify Provider
    const providerNotification = new Notification({
      userId: booking.providerId,
      title: "Booking Successfully Completed",
      type: "success",
      message: `Payment for ${booking.productName} on ${formattedDate} at ${formattedTime} has been successfully released. Thank you for your excellent service!`,
      status: "unread",
      link: `/provider/bookings/${booking._id}`,
    })
    await providerNotification.save()

    // ✅ Notify Customer
    const customerNotification = new Notification({
      userId: booking.userId,
      title: "Booking Successfully Completed",
      type: "success",
      message: `All set! Both parties have confirmed, and your payment for ${booking.productName} on ${formattedDate} at ${formattedTime} has been successfully processed and released. Thank you for using HandyGo — we look forward to helping you again with your next service!`,
      status: "unread",
      link: `/bookings/${booking._id}`,
    })
    await customerNotification.save()

    console.log("Notifications sent: Payment Released (Provider & Customer)")
    console.log(
      `✅ Payment released successfully for booking ${id}. Status: ${updatedBooking.status}, ServiceComplete: ${updatedBooking.serviceComplete}`,
    )

    res.status(200).json(updatedBooking)
  } catch (error) {
    console.error("Error releasing payment:", error)
    res.status(500).json({ message: "Failed to release payment.", error: error.message })
  }
}

export const updateProviderReview = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { providerRating, providerReview } = req.body
    const customerId = req.userId

    console.log(`[v0] updateProviderReview called for booking ID: ${bookingId}`)
    console.log(`[v0] Customer ID: ${customerId}, Rating: ${providerRating}, Review: ${providerReview}`)

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID not found in request." })
    }

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." })
    }

    const providerId = booking.providerId
    if (!providerId) {
      return res.status(400).json({ message: "Provider not found for this booking." })
    }

    const customer = await User.findById(customerId)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." })
    }

    const provider = await User.findById(providerId)
    if (!provider) {
      return res.status(404).json({ message: "Provider not found." })
    }

    const customerName =
      customer.username ||
      `${customer.firstName} ${customer.middleName ? customer.middleName + " " : ""}${customer.lastName}`.trim()

    // Helpers: readable date and clean 12-hour time
    const formatReadableDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const formatTime12Hour = (timeString) => {
      if (!timeString) return "N/A"
      const [hour, minute] = timeString.split(":")
      const date = new Date()
      date.setHours(hour, minute)
      return date.toLocaleTimeString([], {
        hour: "numeric", // removes leading zero
        minute: "2-digit",
        hour12: true,
      })
    }

    const formattedDate = formatReadableDate(booking.bookingDate)
    const formattedTime = formatTime12Hour(booking.bookingTime)

    // ===============================
    // Case 1: Customer skips rating
    // ===============================
    if (!providerRating) {
      const skipNotification = new Notification({
        userId: providerId,
        title: "Customer Skipped Rating",
        type: "info",
        message: `${customerName} has completed their service for ${booking.productName} on ${formattedDate} but chose not to leave a rating or review.`,
        status: "unread",
        link: `/provider/bookings/${booking._id}`,
      })
      await skipNotification.save()

      console.log("Notification created: Customer Skipped Rating")
      return res.status(200).json({ message: "Customer skipped rating and review." })
    }

    // ===============================
    // Case 2: Customer rates/reviews
    // ===============================
    if (providerRating < 1 || providerRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." })
    }

    const currentTotalRatingPoints = provider.totalRatingPoints || 0
    const currentTotalReviews = provider.totalReviews || 0
    const newTotalRatingPoints = currentTotalRatingPoints + providerRating
    const newTotalReviews = currentTotalReviews + 1
    const newAverageRating = newTotalRatingPoints / newTotalReviews

    const newRating = {
      bookingId,
      customerId,
      customerName,
      rating: providerRating,
      review: providerReview || "",
      serviceType: booking.productName,
      reviewDate: new Date(),
    }

    provider.totalRatingPoints = newTotalRatingPoints
    provider.totalReviews = newTotalReviews
    provider.averageRating = Math.round(newAverageRating * 100) / 100
    if (!provider.ratings) provider.ratings = []
    provider.ratings.push(newRating)

    const updatedProvider = await provider.save()

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        providerRating,
        providerReview: providerReview || "",
        providerReviewDate: new Date(),
      },
      { new: true },
    )

    console.log(`[v0] Booking updated with provider rating successfully.`)

    // ===============================
    // 🕒 Notifications Section
    // ===============================

    // ✅ Notify provider about new review
    const reviewNotification = new Notification({
      userId: providerId,
      title: "New Review Received",
      type: "success",
      message: `${customerName} rated your service for ${booking.productName} on ${formattedDate} at ${formattedTime} with ${providerRating} star(s). ${
        providerReview ? "Review: " + providerReview : ""
      }`,
      status: "unread",
      link: `/provider/bookings/${booking._id}`,
    })
    await reviewNotification.save()

    console.log("Notification created: New Review Received")

    // ✅ Notify customer that feedback was submitted
    const customerNotification = new Notification({
      userId: customerId,
      title: "Thank You for Your Feedback",
      type: "success",
      message: `Thank you for rating ${booking.productName} ${providerRating} star(s) on ${formattedDate} at ${formattedTime}. We appreciate your feedback!`,
      status: "unread",
      link: `/bookings/${booking._id}`,
    })
    await customerNotification.save()

    res.status(200).json({
      message: "Provider rating updated successfully",
      booking: updatedBooking,
      provider: {
        _id: updatedProvider._id,
        averageRating: updatedProvider.averageRating,
        totalReviews: updatedProvider.totalReviews,
        totalRatingPoints: updatedProvider.totalRatingPoints,
      },
    })
  } catch (error) {
    console.error("[v0] Error updating provider review:", error)
    res.status(500).json({ message: "Failed to update provider review.", error: error.message })
  }
}

// Get all bookings by companyId
export const getBookingsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const bookings = await Booking.find({ companyId }).populate("userId providerId");
    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching company bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const getRevenueByCoo = async (req, res) => {
  try {
    const { cooId } = req.params;

    if (!cooId) {
      return res.status(400).json({ message: "COO ID is required." });
    }

    // 🟢 Fetch all completed bookings belonging to this COO (via companyId or providerId)
    const completedBookings = await Booking.find({
      status: "completed",
      $or: [
        { companyId: cooId },
        { providerId: cooId },
      ],
    });

    if (!completedBookings.length) {
      return res.json({
        totalRevenue: 0,
        monthlyRevenue: Array(12).fill(0),
      });
    }

    // 🟢 Calculate total revenue from pricing.totalRate
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalRate || 0);
    }, 0);

    // 🟢 Group monthly revenue
    const monthlyRevenue = Array(12).fill(0);
    completedBookings.forEach((booking) => {
      const date = new Date(booking.updatedAt || booking.createdAt);
      const month = date.getMonth(); // 0 = January
      monthlyRevenue[month] += booking.pricing?.totalRate || 0;
    });

    // ✅ Return results
    res.json({
      totalRevenue,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    res.status(500).json({ message: "Server error while calculating revenue." });
  }
}

export const getMonthlyRevenueByCoo = async (req, res) => {
  try {
    const { cooId } = req.params;

    console.log("[📊] Monthly Revenue Request received for COO/Company ID:", cooId);

    if (!cooId) {
      console.warn("[⚠️] Missing COO ID in request.");
      return res.status(400).json({ message: "COO ID is required." });
    }

    // 🟢 Aggregate completed bookings per month
    const results = await Booking.aggregate([
      {
        $match: {
          status: "completed",
          $or: [
            { companyId: new mongoose.Types.ObjectId(cooId) },
            { providerId: new mongoose.Types.ObjectId(cooId) },
          ],
        },
      },
      {
        $project: {
          month: { $month: "$updatedAt" },
          totalRate: "$pricing.totalRate",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$totalRate" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("[✅] Aggregation Results:", JSON.stringify(results, null, 2));

    // 🧠 Build a 12-month array with zeros for missing months
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const monthlyRevenue = months.map((name, index) => {
      const found = results.find((r) => r._id === index + 1);
      return { name, total: found ? found.total : 0 };
    });

    console.log("[📅] Final Monthly Revenue Array:", monthlyRevenue);

    return res.json({ monthlyRevenue });
  } catch (error) {
    console.error("[❌] Error calculating monthly revenue:", error);
    return res.status(500).json({ message: "Server error while calculating monthly revenue." });
  }
}

export const getPendingBookingsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    if (!providerId) return res.status(400).json({ message: "Provider ID is required" });

    const bookings = await Booking.find({ providerId, status: "pending" })
      .populate("userId providerId")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching pending bookings by provider:", error);
    res.status(500).json({ message: "Server error fetching pending bookings" });
  }
}

export const getOngoingBookingsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    if (!providerId) return res.status(400).json({ message: "Provider ID is required" });

    const bookings = await Booking.find({ providerId, status: "ongoing" })
      .populate("userId providerId")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching ongoing bookings by provider:", error);
    res.status(500).json({ message: "Server error fetching ongoing bookings" });
  }
}

export const getActiveBookingsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    if (!providerId) return res.status(400).json({ message: "Provider ID is required" });

    const bookings = await Booking.find({ providerId, status: "active" })
      .populate("userId providerId")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching active bookings by provider:", error);
    res.status(500).json({ message: "Server error fetching active bookings" });
  }
}

export const getCompletedBookingsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    if (!providerId) return res.status(400).json({ message: "Provider ID is required" });

    const bookings = await Booking.find({ providerId, status: "completed" })
      .populate("userId providerId")
      .sort({ completedDate: -1, createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching completed bookings by provider:", error);
    res.status(500).json({ message: "Server error fetching completed bookings" });
  }
}

export const getAllCompletedBookings = async (req, res) => {
  console.log("[BACKEND] getAllCompletedBookings called");

  try {
    console.log("[BACKEND] Fetching completed bookings from MongoDB...");
    const completedBookings = await Booking.find({ status: "completed" })
      .populate("userId", "firstName lastName middleName email mobileNumber profilePicture")
      .populate("providerId", "firstName lastName middleName businessName email mobileNumber profilePicture")
      .sort({ createdAt: -1 });

    console.log(`[BACKEND] Found ${completedBookings.length} completed bookings`);

    const transformedBookings = completedBookings.map((booking, index) => {
      const b = booking.toObject();

      // ✅ Handle arrays or single populated documents
      const user = Array.isArray(b.userId) ? b.userId[0] : b.userId;
      const provider = Array.isArray(b.providerId) ? b.providerId[0] : b.providerId;

      // ✅ Construct customer full name
      const customerName = user
        ? `${user.firstName || ""} ${user.middleName ? user.middleName + " " : ""}${user.lastName || ""}`.trim()
        : b.firstname || "Unknown Customer";

      // ✅ Construct provider name (handle businessName)
      const providerName = provider
        ? provider.businessName?.trim() ||
          `${provider.firstName || ""} ${provider.middleName ? provider.middleName + " " : ""}${provider.lastName || ""}`.trim()
        : b.providerName || "Unknown Provider";

      return {
        id: b._id,
        serviceName: b.productName,
        paymentMethod: b.paymentMethod || "Unknown",
        confirmation: b.providerConfirmation && b.customerConfirmation,
        serviceComplete: b.serviceComplete,
        total: b.pricing?.totalRate || 0,
        totalBalance: b.pricing?.totalRate || 0,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,

        customerName,
        providerName,

        serviceProvider: {
          id: provider?._id || null,
          name: providerName,
          avatar: provider?.profilePicture || "/placeholder.svg",
          initials: providerName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          status: b.status,
          email: provider?.email || "N/A",
          phone: provider?.mobileNumber || "N/A",
        },

        customer: {
          id: user?._id || null,
          name: customerName,
          avatar: user?.profilePicture || "/placeholder.svg",
          initials: customerName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          status: b.status,
          email: user?.email || "N/A",
          phone: user?.mobileNumber || "N/A",
        },

        userDetails: user,
        providerDetails: provider,
        pricing: b.pricing,
        location: b.location?.name || "Location not available",
      };
    });

    console.log("[BACKEND] Completed transformation. Sending data to frontend...");
    res.status(200).json(transformedBookings);
  } catch (error) {
    console.error("[BACKEND] Error fetching all completed bookings:", error);
    res.status(500).json({
      message: "Failed to fetch completed bookings.",
      error: error.message,
    });
  }
}