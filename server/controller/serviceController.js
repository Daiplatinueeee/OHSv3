import { Service } from "../models/service.js"
import { classifyServiceAI } from "../AI/aiController.js"
import Notification from "../models/notification.js"

export const createService = async (req, res, io) => {
  try {
    const { name, price, description, image, chargePerKm } = req.body
    const cooId = req.userId

    if (!cooId) {
      return res.status(401).json({ message: "Authentication required: COO ID missing." })
    }

    // Validate required fields
    if (!name || !price || !description || !chargePerKm) {
      return res
        .status(400)
        .json({ message: "Missing required fields: name, price, description, and charge per KM are required." })
    }

    // --- AI Classification Step --- //
    let aiData = null
    try {
      aiData = await classifyServiceAI(name, description)
    } catch (aiError) {
      console.warn("AI classification failed:", aiError.message)
      aiData = null
    }

    let mainCategory = ""
    let subCategory = name
    let isValidService = true
    let invalidReason = ""
    let workersNeeded = 1
    let estimatedTime = "Varies"

    if (aiData) {
      isValidService = aiData.isValid
      if (isValidService) {
        mainCategory = aiData.mainCategory || ""
        subCategory = aiData.subCategory || subCategory
        workersNeeded = aiData.workersNeeded || 1
        estimatedTime = aiData.estimatedTime || "Varies"
      } else {
        mainCategory = "Invalid Service"
        subCategory = name
        invalidReason = aiData.reason || "Service deemed invalid by AI."
        workersNeeded = 1
      }
    } else {
      console.warn("AI classification returned null, using defaults")
      isValidService = true
      mainCategory = ""
      subCategory = name
      workersNeeded = 1
    }

    // Guard: never store "Uncategorized Services", "Other", or blank as mainCategory
    const vagueCategories = ["uncategorized services", "uncategorized", "other", "others", ""]
    if (isValidService && vagueCategories.includes(mainCategory.trim().toLowerCase())) {
      const words = name.trim().split(/\s+/)
      const keyword = words[words.length - 1] || words[0] || "General"
      mainCategory = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Services`
      console.warn(`serviceController (create): Overriding vague category to "${mainCategory}"`)
    }

    console.log("Service Classification Result:", {
      isValidService,
      mainCategory,
      subCategory,
      invalidReason,
      workersNeeded,
      estimatedTime,
    })

    // --- Create Service --- //
    const newService = new Service({
      cooId,
      name,
      price,
      description,
      image: image || "/placeholder.svg?height=48&width=48",
      chargePerKm,
      mainCategory,
      subCategory,
      totalRating: 0,
      totalReviews: 0,
      workersNeeded,
      estimatedTime,
    })

    await newService.save()

    // ========================== //
    // Notification Section
    // ========================== //
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Notify the COO (service creator)
    const cooNotification = new Notification({
      userId: cooId,
      title: "Service Created Successfully",
      type: "success",
      message: `Your service "${name}" has been successfully created on ${formattedDate}. It's now available for booking under the "${mainCategory}" category.`,
      status: "unread",
      link: `/coo/services/${newService._id}`,
    })
    await cooNotification.save()

    // Emit WebSocket event
    if (io) {
      io.emit("service_update", { type: "created", service: newService })
    }

    res.status(201).json({
      message: "Service created successfully!",
      service: newService,
      aiClassification: {
        isValid: isValidService,
        mainCategory,
        subCategory,
        workersNeeded,
        estimatedTime,
        reason: invalidReason,
      },
    })
  } catch (error) {
    console.error("Error creating service:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }
    res.status(500).json({ message: "Server error during service creation." })
  }
}

export const getServices = async (req, res) => {
  try {
    // Allow fetching all services if no cooId is provided (for public display on Home page)
    const cooId = req.userId
    let services

    if (cooId) {
      // If a COO ID is provided (e.g., from authenticateToken), fetch only their services
      services = await Service.find({ cooId }).populate({
        path: "cooId",
        select: "firstName middleName lastName profilePicture location.name", // NEW: Select middleName and location.name
      })
    } else {
      // If no COO ID, fetch all services (for public display)
      // Ensure this endpoint is accessible without authentication if intended for public
      services = await Service.find({}).populate({
        path: "cooId",
        select: "firstName middleName lastName profilePicture location.name", // NEW: Select middleName and location.name
      })
    }

    // Add console.log to inspect services fetched from backend
    console.log(
      "Backend: Fetched services with COO details:",
      services.map((s) => ({
        id: s._id.toString(), // FIX: Convert ObjectId to string
        name: s.name,
        mainCategory: s.mainCategory,
        subCategory: s.subCategory,
        totalRating: s.totalRating, // NEW: Log totalRating
        totalReviews: s.totalReviews, // NEW: Log totalReviews
        workersNeeded: s.workersNeeded, // NEW: Log workersNeeded
        cooDetails: s.cooId
          ? {
              _id: s.cooId._id.toString(), // FIX: Convert ObjectId to string
              firstName: s.cooId.firstName,
              middleName: s.cooId.middleName, // NEW: Log middleName
              lastName: s.cooId.lastName,
              profilePicture: s.cooId.profilePicture,
              location: s.cooId.location ? s.cooId.location.name : "N/A", // NEW: Log COO location
            }
          : null,
      })),
    )

    res.status(200).json({
      services: services.map((s) => ({
        ...s.toObject(),
        id: s._id.toString(),
        cooId: s.cooId
          ? {
              ...s.cooId.toObject(),
              _id: s.cooId._id.toString(),
            }
          : null,
      })),
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    res.status(500).json({ message: "Server error during service retrieval." })
  }
}

export const getServicesByUserId = async (req, res) => {
  try {
    const { userId } = req.params
    const requestingUserId = req.userId

    console.log("Fetching services for userId:", userId)
    console.log("Requesting user ID from token:", requestingUserId)

    if (userId !== requestingUserId) {
      return res.status(403).json({
        message: "Unauthorized: You can only view your own services.",
      })
    }

    const services = await Service.find({ cooId: userId }).populate({
      path: "cooId",
      select: "firstName middleName lastName profilePicture location.name",
    })

    console.log(
      "Backend: Fetched services for user with COO details:",
      services.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        mainCategory: s.mainCategory,
        subCategory: s.subCategory,
        totalRating: s.totalRating,
        totalReviews: s.totalReviews,
        workersNeeded: s.workersNeeded,
        cooDetails: s.cooId
          ? {
              _id: s.cooId._id.toString(),
              firstName: s.cooId.firstName,
              middleName: s.cooId.middleName,
              lastName: s.cooId.lastName,
              profilePicture: s.cooId.profilePicture,
              location: s.cooId.location ? s.cooId.location.name : "N/A",
            }
          : null,
      })),
    )

    res.status(200).json({
      services: services.map((s) => ({
        ...s.toObject(),
        id: s._id.toString(),
        cooId: s.cooId
          ? {
              ...s.cooId.toObject(),
              _id: s.cooId._id.toString(),
            }
          : null,
      })),
    })
  } catch (error) {
    console.error("Error fetching services by user ID:", error)
    res.status(500).json({ message: "Server error during service retrieval." })
  }
}

export const getServicesByCompanyId = async (req, res) => {
  try {
    const { userId } = req.params

    console.log("Fetching services for userId:", userId)

    const services = await Service.find({ cooId: userId }).populate({
      path: "cooId",
      select: "firstName middleName lastName profilePicture location.name",
    })

    res.status(200).json({
      services: services.map((s) => ({
        ...s.toObject(),
        id: s._id.toString(),
        cooId: s.cooId
          ? {
              ...s.cooId.toObject(),
              _id: s.cooId._id.toString(),
            }
          : null,
      })),
    })
  } catch (error) {
    console.error("Error fetching services by user ID:", error)
    res.status(500).json({ message: "Server error during service retrieval." })
  }
}

export const deleteService = async (req, res, io) => {
  try {
    const { id } = req.params
    const cooId = req.userId

    if (!cooId) {
      return res.status(401).json({ message: "Authentication required: COO ID missing." })
    }

    const service = await Service.findOneAndDelete({ _id: id, cooId: cooId })

    if (!service) {
      return res.status(404).json({ message: "Service not found or you are not authorized to delete this service." })
    }

    res.status(200).json({ message: "Service terminated successfully!", serviceId: id })

    // Emit WebSocket event after successful deletion
    if (io) {
      io.emit("service_update", { type: "deleted", serviceId: id })
    }
  } catch (error) {
    console.error("Error terminating service:", error)
    res.status(500).json({ message: "Server error during service termination." })
  }
}

export const getTotalServicesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params
    const total = await Service.countDocuments({ cooId: companyId })
    res.status(200).json({ total })
  } catch (error) {
    res.status(500).json({ message: "Failed to get total services count." })
  }
}

export const updateServiceDetails = async (req, res, io) => {
  try {
    const { id } = req.params
    const cooId = req.userId
    const { name, price, description, image, chargePerKm, mainCategory, subCategory, workersNeeded, estimatedTime } =
      req.body

    if (!cooId) {
      return res.status(401).json({ message: "Authentication required: COO ID missing." })
    }

    if (!id) {
      return res.status(400).json({ message: "Service ID is required." })
    }

    // Validate required fields
    if (!name || price === undefined || !description || chargePerKm === undefined) {
      return res
        .status(400)
        .json({ message: "Missing required fields: name, price, description, and chargePerKm are required." })
    }

    // Find the service and verify ownership
    const service = await Service.findOne({ _id: id, cooId: cooId })

    if (!service) {
      return res.status(404).json({ message: "Service not found or you are not authorized to update this service." })
    }

    // --- AI Classification Step --- //
    const aiData = await classifyServiceAI(name, description)

    let newMainCategory = ""
    let newSubCategory = name
    let isValidService = true
    let invalidReason = ""
    let newWorkersNeeded = 1

    if (aiData) {
      isValidService = aiData.isValid
      if (isValidService) {
        newMainCategory = aiData.mainCategory || ""
        newSubCategory = aiData.subCategory || newSubCategory
        newWorkersNeeded = aiData.workersNeeded || 1
      } else {
        newMainCategory = "Invalid Service"
        newSubCategory = name
        invalidReason = aiData.reason || "Service deemed invalid by AI."
        newWorkersNeeded = 1
      }
    }

    // Guard: never store "Uncategorized Services", "Other", or blank as mainCategory
    const vagueCategories = ["uncategorized services", "uncategorized", "other", "others", ""]
    if (isValidService && vagueCategories.includes(newMainCategory.trim().toLowerCase())) {
      const words = name.trim().split(/\s+/)
      const keyword = words[words.length - 1] || words[0] || "General"
      newMainCategory = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Services`
      console.warn(`serviceController (update): Overriding vague category to "${newMainCategory}"`)
    }

    console.log("Service Reclassification Result:", {
      isValidService,
      newMainCategory,
      newSubCategory,
      invalidReason,
      newWorkersNeeded,
    })

    // --- Update Service Fields --- //
    service.name = name
    service.price = price
    service.description = description
    service.image = image || service.image
    service.chargePerKm = chargePerKm
    service.mainCategory = newMainCategory || mainCategory || service.mainCategory
    service.subCategory = newSubCategory || subCategory || service.subCategory
    service.workersNeeded = newWorkersNeeded || workersNeeded || service.workersNeeded
    service.estimatedTime = estimatedTime || service.estimatedTime

    await service.save()

    // ✅ Emit WebSocket event
    if (io) {
      io.emit("service_update", { type: "updated", service })
    }

    // ✅ Send success response
    res.status(200).json({
      message: "Service updated successfully!",
      service,
      aiClassification: { isValid: isValidService, reason: invalidReason },
    })
  } catch (error) {
    console.error("Error updating service:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }
    res.status(500).json({ message: "Server error during service update." })
  }
}