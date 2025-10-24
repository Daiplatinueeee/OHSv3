import { Messages } from "../models/message.js"

export const recentChats = async (req, res, io) => {
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

    let mainCategory = "Uncategorized Services"
    let subCategory = name
    let isValidService = true
    let invalidReason = ""
    let workersNeeded = 1
    let estimatedTime = "Varies"

    if (aiData) {
      isValidService = aiData.isValid
      if (isValidService) {
        mainCategory = aiData.mainCategory || mainCategory
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
      mainCategory = "Uncategorized Services"
      subCategory = name
      workersNeeded = 1
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