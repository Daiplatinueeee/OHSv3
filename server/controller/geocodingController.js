// Geocoding controller for converting addresses to lat/lng coordinates
// Uses OpenStreetMap Nominatim API (free, no API key required)

export const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.body

    console.log("[v0] Geocoding request received for address:", address)

    if (!address) {
      console.log("[v0] ERROR: Address is missing")
      return res.status(400).json({ error: "Address is required" })
    }

    // Use OpenStreetMap Nominatim API for geocoding (free, no API key)
    const encodedAddress = encodeURIComponent(address)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`

    console.log("[v0] Calling Nominatim API:", nominatimUrl)

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "ServiceBookingApp/1.0", // Nominatim requires a User-Agent
      },
    })

    if (!response.ok) {
      console.log("[v0] ERROR: Nominatim API failed with status:", response.status)
      return res.status(500).json({ error: "Geocoding service unavailable" })
    }

    const data = await response.json()
    console.log("[v0] Nominatim API response:", data)

    if (!data || data.length === 0) {
      console.log("[v0] ERROR: No results found for address:", address)
      return res.status(404).json({
        error: "Address not found",
        message: "Could not find coordinates for the provided address",
      })
    }

    const result = data[0]
    const coordinates = {
      lat: Number.parseFloat(result.lat),
      lng: Number.parseFloat(result.lon),
      name: result.display_name,
    }

    console.log("[v0] Geocoding successful:", coordinates)

    res.json(coordinates)
  } catch (error) {
    console.error("[v0] ERROR in geocoding:", error)
    res.status(500).json({
      error: "Geocoding failed",
      details: error.message,
    })
  }
}

// Get user location from database
export const getUserLocation = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id

    console.log("[v0] Get user location request for userId:", userId)

    if (!userId) {
      console.log("[v0] ERROR: User ID not found in request")
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Import User model (adjust path as needed)
    const User = (await import("./models/user.js")).default

    const user = await User.findById(userId).select("location")

    if (!user) {
      console.log("[v0] ERROR: User not found:", userId)
      return res.status(404).json({ error: "User not found" })
    }

    console.log("[v0] User location retrieved:", user.location)

    res.json({ location: user.location })
  } catch (error) {
    console.error("[v0] ERROR getting user location:", error)
    res.status(500).json({
      error: "Failed to get user location",
      details: error.message,
    })
  }
}