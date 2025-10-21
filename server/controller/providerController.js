import { Provider } from "../models/provider.js"

export const fethProviders = async (req, res) => {
  try {
    // Fetch all providers
    const providers = await Provider.find({})
      .populate("userId", "fullname email")
      .populate("cooId", "fullname email")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    })
  } catch (error) {
    console.error("Error fetching providers:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch providers.",
      error: error.message,
    })
  }
}

export const bulkAddProviders = async (req, res) => {
  try {
    const { providers, cooId } = req.body

    // Validate input
    if (!providers || !Array.isArray(providers) || providers.length === 0) {
      return res.status(400).json({ message: "Providers array is required and must not be empty" })
    }

    if (!cooId) {
      return res.status(400).json({ message: "COO ID is required" })
    }

    // Validate each provider has required fields
    const invalidProviders = []
    const validProviders = []

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]

      if (!provider.fullname || !provider.email || !provider.location || !provider.age || !provider.providerNumber) {
        invalidProviders.push({
          index: i,
          provider,
          reason: "Missing required fields",
        })
      } else {
        validProviders.push({
          userId: cooId, // Use cooId as userId for now
          cooId: cooId,
          fullname: provider.fullname,
          email: provider.email,
          company: provider.company || "Home Services Inc.",
          location: provider.location,
          age: provider.age,
          providerNumber: provider.providerNumber,
          status: provider.status || "Active",
          avatar: provider.avatar || "/placeholder.svg?height=40&width=40",
        })
      }
    }

    // If there are invalid providers, return error
    if (invalidProviders.length > 0) {
      return res.status(400).json({
        message: "Some providers have invalid data",
        invalidProviders,
        validCount: validProviders.length,
        invalidCount: invalidProviders.length,
      })
    }

    // Insert all valid providers
    const insertedProviders = await Provider.insertMany(validProviders, { ordered: false })

    res.status(201).json({
      message: "Providers added successfully",
      count: insertedProviders.length,
      providers: insertedProviders,
    })
  } catch (error) {
    console.error("Error bulk adding providers:", error)

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Some providers have duplicate email or provider numbers",
        error: error.message,
      })
    }

    res.status(500).json({ message: "Server error", error: error.message })
  }
}