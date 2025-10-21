// lib/locationUtils.ts

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param lat1 Latitude of the first point in degrees.
 * @param lon1 Longitude of the first point in degrees.
 * @param lat2 Latitude of the second point in degrees.
 * @param lon2 Longitude of the second point in degrees.
 * @returns Distance in kilometers.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

/**
 * Checks if a given geographical point is within a circular boundary.
 * @param pointLat Latitude of the point to check in degrees.
 * @param pointLng Longitude of the point to check in degrees.
 * @param centerLat Latitude of the circle's center in degrees.
 * @param centerLng Longitude of the circle's center in degrees.
 * @param radiusMeters Radius of the circle in meters.
 * @returns True if the point is within the circle, false otherwise.
 */
export const isPointInCircle = (
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
): boolean => {
  const distanceKm = calculateDistance(pointLat, pointLng, centerLat, centerLng)
  const distanceMeters = distanceKm * 1000 // Convert km to meters
  return distanceMeters <= radiusMeters
}

/**
 * Performs reverse geocoding to get a location name and zip code from coordinates.
 * @param lat Latitude.
 * @param lng Longitude.
 * @returns An object containing the location name and zip code.
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<{ name: string; zipCode: string }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    )
    const data = await response.json()

    let name = "Unknown location"
    let zipCode = ""

    if (data && data.display_name) {
      const parts = data.display_name.split(",")
      name = parts.slice(0, 3).join(", ")

      if (data.address) {
        zipCode = data.address.postcode || ""
        if (!zipCode) {
          const postalCodePattern = /\b\d{5,6}\b/
          for (const part of parts) {
            const trimmedPart = part.trim()
            const match = trimmedPart.match(postalCodePattern)
            if (match) {
              zipCode = match[0]
              break
            }
          }
        }
      }
    }
    return { name, zipCode }
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    return { name: "Unknown location", zipCode: "" }
  }
}

/**
 * Performs forward geocoding to get coordinates from a location name.
 * @param query The location name to geocode.
 * @returns An object containing latitude and longitude, or null if not found.
 */
export const forwardGeocode = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: Number.parseFloat(data[0].lat),
        lng: Number.parseFloat(data[0].lon),
      }
    }
    return null
  } catch (error) {
    console.error("Error forward geocoding:", error)
    return null
  }
}
