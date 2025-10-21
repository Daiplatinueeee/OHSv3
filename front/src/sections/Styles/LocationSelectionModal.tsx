import { useState, useEffect, useRef } from "react"
import { X, Search, Edit, Trash2, Check, Loader2 } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine"
import OutOfBoundaryModal from "../Styles/OutOfBoundary"
import axios from "axios"

interface Location {
  name: string
  lat: number
  lng: number
  distance: number
  estimatedTime?: number
  id?: string
  price?: number
  lightTrafficTime?: number
  midTrafficTime?: number
  heavyTrafficTime?: number
  weatherIssuesTime?: number
  zipCode?: string
}

interface LocationSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (location: Location) => void
  companyLocation: {
    lat: number
    lng: number
    name: string
  }
  savedLocations?: Location[]
  previousLocation?: Location | null
}

// Define custom icon for user's current location
const userLocationIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const LocationSelectionModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  companyLocation,
  savedLocations = [],
  previousLocation = null,
}: LocationSelectionModalProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [, setSearchResults] = useState<Location[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedMapLocation, setSelectedMapLocation] = useState<Location | null>(null)
  const [savedLocationsList, setSavedLocationsList] = useState<Location[]>([])
  const [isEditingLocation, setIsEditingLocation] = useState<string | null>(null)
  const [editLocationName, setEditLocationName] = useState<string>("")
  const [originalLocation, setOriginalLocation] = useState<Location | null>(null)
  const [isEditingPosition, setIsEditingPosition] = useState<boolean>(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false)
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false)

  // New states for fetching user's current location
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [isFetchingUserLocation, setIsFetchingUserLocation] = useState(false)
  const [userLocationError, setUserLocationError] = useState<string | null>(null)

  // Add a new state to track the active tab
  const [activeTab, setActiveTab] = useState<"locations" | "travelTimes">("locations")

  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const companyMarkerRef = useRef<L.Marker | null>(null)
  const selectedMarkerRef = useRef<L.Marker | null>(null)
  const routeLineRef = useRef<L.Polyline | null>(null)
  const routeControlRef = useRef<any>(null)
  const editMarkerRef = useRef<L.Marker | null>(null)
  const routeAnimationRef = useRef<number | null>(null)
  const routePulseRef = useRef<any>(null)

  // Define Cebu City boundary parameters
  const cebuCityCenterLat = 10.3178 // Approx. Ayala Center Cebu
  const cebuCityCenterLng = 123.9054
  const cebuCityRadiusMeters = 7000 // Approx. 7km radius

  // Utility function to check if a point is within a circle
  const isPointInCircle = (
    pointLat: number,
    pointLng: number,
    centerLat: number,
    centerLng: number,
    radiusMeters: number,
  ): boolean => {
    const distance = calculateDistance(pointLat, pointLng, centerLat, centerLng) * 1000 // Convert km to meters
    return distance <= radiusMeters
  }

  const handleContactCustomerService = () => {
    console.log("Contacting customer service...")
    setIsWarningModalOpen(false)
  }

  // Add CSS for route animations
  useEffect(() => {
    // Add CSS for route animations if not already present
    if (!document.getElementById("route-animations-css")) {
      const style = document.createElement("style")
      style.id = "route-animations-css"
      style.innerHTML = `
  @keyframes routePulse {
    0% { stroke-opacity: 0.6; stroke-width: 5px; }
    50% { stroke-opacity: 0.8; stroke-width: 7px; }
    100% { stroke-opacity: 0.6; stroke-width: 5px; }
  }
  
  @keyframes routeFlow {
    0% { stroke-dashoffset: 1000; }
    100% { stroke-dashoffset: 0; }
  }
  
  .route-pulse {
    animation: routePulse 2s ease-in-out infinite;
  }
  
  .route-flow {
    stroke-dasharray: 15, 10;
    animation: routeFlow 30s linear infinite;
  }
`
      document.head.appendChild(style)
    }
  }, [])

  useEffect(() => {
    const defaultLocations = savedLocations.length
      ? savedLocations
      : [
          {
            id: "loc-1",
            name: "Manhattan Home Service",
            lat: 40.7831,
            lng: -73.9712,
            distance: calculateDistance(40.7831, -73.9712, companyLocation.lat, companyLocation.lng),
            price: 85.5,
          },
          {
            id: "loc-2",
            name: "Brooklyn Home Service",
            lat: 40.6782,
            lng: -73.9442,
            distance: calculateDistance(40.6782, -73.9442, companyLocation.lat, companyLocation.lng),
            price: 75.25,
          },
          {
            id: "loc-3",
            name: "Queens Home Service",
            lat: 40.7282,
            lng: -73.7949,
            distance: calculateDistance(40.7282, -73.7949, companyLocation.lat, companyLocation.lng),
            price: 80.0,
          },
          {
            id: "loc-4",
            name: "Bronx Home Service",
            lat: 40.8448,
            lng: -73.8648,
            distance: calculateDistance(40.8448, -73.8648, companyLocation.lat, companyLocation.lng),
            price: 90.75,
          },
          {
            id: "loc-5",
            name: "Staten Island Service",
            lat: 40.5795,
            lng: -74.1502,
            distance: calculateDistance(40.5795, -74.1502, companyLocation.lat, companyLocation.lng),
            price: 95.5,
          },
          {
            id: "loc-6",
            name: "Jersey City Service",
            lat: 40.7178,
            lng: -74.0431,
            distance: calculateDistance(40.7178, -74.0431, companyLocation.lat, companyLocation.lng),
            price: 82.75,
          },
        ]

    const locationsWithIds = defaultLocations.map((loc) => {
      if (!loc.id) {
        return {
          ...loc,
          id: `loc-${Math.random().toString(36).substr(2, 9)}`,
        }
      }
      return loc
    })

    setSavedLocationsList(locationsWithIds)
  }, [savedLocations, companyLocation.lat, companyLocation.lng])

  // Effect to fetch user's current location when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset states when modal closes
      setUserLocation(null)
      setIsFetchingUserLocation(false)
      setUserLocationError(null)
      return
    }

    const fetchUserCurrentLocation = async () => {
      setIsFetchingUserLocation(true)
      setUserLocationError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setUserLocationError("Authentication token missing. Please log in.")
          setIsFetchingUserLocation(false)
          return
        }

        const API_BASE_URL = "http://localhost:3000" // Consistent with MyProfileProvider.tsx
        const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.user && response.data.user.location) {
          // Ensure distance is calculated if not present or needs re-calculation
          const fetchedLocation = {
            ...response.data.user.location,
            distance: calculateDistance(
              response.data.user.location.lat,
              response.data.user.location.lng,
              companyLocation.lat,
              companyLocation.lng,
            ),
          }
          setUserLocation(fetchedLocation)
        } else {
          setUserLocationError("User location not found in profile data.")
        }
      } catch (err: any) {
        console.error("Error fetching user location:", err)
        setUserLocationError("Failed to fetch user location. Please try again.")
      } finally {
        setIsFetchingUserLocation(false)
      }
    }

    fetchUserCurrentLocation()
  }, [isOpen, companyLocation.lat, companyLocation.lng]) // Re-fetch if company location changes

  useEffect(() => {
    if (isOpen && mapContainerRef.current && !mapRef.current) {
      initializeMap()
    }

    return () => {
      if (mapRef.current && !isOpen) {
        // Clear all routes and animations
        if (routeAnimationRef.current) {
          cancelAnimationFrame(routeAnimationRef.current)
          routeAnimationRef.current = null
        }

        // Stop pulse animation
        if (routePulseRef.current) {
          clearInterval(routePulseRef.current)
          routePulseRef.current = null
        }

        // Remove all polylines and route elements
        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Polyline) {
            // Check if this is a route layer (not a base map layer)
            if (
              layer.options.className === "route-line" ||
              layer.options.className === "route-shadow" ||
              layer.options.color === "#3b82f6"
            ) {
              layer.remove()
            }
          }
        })

        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = []
        companyMarkerRef.current = null
        selectedMarkerRef.current = null
        routeLineRef.current = null
        editMarkerRef.current = null

        if (routeControlRef.current) {
          routeControlRef.current.remove()
          routeControlRef.current = null
        }
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (mapRef.current && isOpen) {
      markersRef.current.forEach((marker) => {
        marker.remove()
      })
      markersRef.current = []

      addMarkersForLocations(savedLocationsList)
    }
  }, [savedLocationsList, isOpen])

  // Modified useEffect to handle previousLocation and userLocation
  useEffect(() => {
    if (isOpen && mapRef.current) {
      const locationToPin = userLocation || previousLocation // Prioritize userLocation

      if (locationToPin) {
        // Remove previous marker if it exists
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.remove()
        }

        const markerIcon =
          locationToPin === userLocation
            ? userLocationIcon
            : L.icon({
                iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                shadowSize: [41, 41],
              })

        const marker = L.marker([locationToPin.lat, locationToPin.lng], { icon: markerIcon })
          .addTo(mapRef.current)
          .bindPopup(locationToPin.name)
          .openPopup()

        selectedMarkerRef.current = marker

        // Center the map on the location
        mapRef.current.setView([locationToPin.lat, locationToPin.lng], 14)

        // Draw the route to the company
        drawRouteToCompany(locationToPin)

        // Also set this as the selectedMapLocation so the UI reflects it
        setSelectedMapLocation(locationToPin)
      }
    }
  }, [isOpen, previousLocation, userLocation, mapRef.current]) // Add userLocation to dependencies

  useEffect(() => {
    if (isEditingPosition && mapRef.current) {
      if (selectedMapLocation) {
        mapRef.current.setView([selectedMapLocation.lat, selectedMapLocation.lng], 14)

        const instructionDiv = document.createElement("div")
        instructionDiv.id = "edit-instructions"
        instructionDiv.className =
          "bg-yellow-100 text-yellow-800 p-3 rounded-md shadow-md absolute top-4 left-4 z-50 max-w-xs"
        instructionDiv.innerHTML = '<p class="text-sm font-medium">Click anywhere on the map to move this location</p>'
        mapContainerRef.current?.appendChild(instructionDiv)

        const handleMapClick = (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng

          if (editMarkerRef.current) {
            editMarkerRef.current.setLatLng([lat, lng])
          } else {
            const locationIcon = L.icon({
              iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
              shadowSize: [41, 41],
            })

            const marker = L.marker([lat, lng], {
              icon: locationIcon,
              draggable: true,
            }).addTo(mapRef.current!)

            editMarkerRef.current = marker
          }

          if (selectedMapLocation) {
            const distance = calculateDistance(lat, lng, companyLocation.lat, companyLocation.lng)
            setSelectedMapLocation({
              ...selectedMapLocation,
              lat,
              lng,
              distance: Math.round(distance * 10) / 10,
              price: calculatePrice(distance),
            })

            drawRouteToCompany({
              ...selectedMapLocation,
              lat,
              lng,
              distance: Math.round(distance * 10) / 10,
            })
          }
        }

        mapRef.current.on("click", handleMapClick)

        return () => {
          mapRef.current?.off("click", handleMapClick)
          document.getElementById("edit-instructions")?.remove()

          if (editMarkerRef.current && mapRef.current) {
            editMarkerRef.current.remove()
            editMarkerRef.current = null
          }
        }
      }
    }
  }, [isEditingPosition, selectedMapLocation])

  const initializeMap = () => {
    if (!mapContainerRef.current) return

    const companyIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      shadowSize: [41, 41],
    })

    const map = L.map(mapContainerRef.current, {
      center: [companyLocation.lat, companyLocation.lng],
      zoom: 12,
      attributionControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      crossOrigin: "anonymous",
      maxZoom: 19,
    }).addTo(map)

    // Add Cebu City boundary circle
    L.circle([cebuCityCenterLat, cebuCityCenterLng], {
      radius: cebuCityRadiusMeters, // Radius in meters
      color: "rgba(128, 128, 128, 0.7)", // Gray boundary line
      fillColor: "rgba(128, 128, 128, 0.1)", // Light gray transparent fill
      fillOpacity: 0.5,
      weight: 3,
    }).addTo(map)

    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    const companyMarker = L.marker([companyLocation.lat, companyLocation.lng], { icon: companyIcon })
      .addTo(map)
      .bindPopup(companyLocation.name)

    addMarkersForLocations(savedLocationsList)

    map.on("click", async (e) => {
      if (isEditingPosition) return

      const { lat, lng } = e.latlng

      // Remove previous marker if it exists
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove()
        selectedMarkerRef.current = null
      }

      const locationIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        shadowSize: [41, 41],
      })

      const marker = L.marker([lat, lng], { icon: locationIcon }).addTo(map)
      selectedMarkerRef.current = marker

      const distance = calculateDistance(lat, lng, companyLocation.lat, companyLocation.lng)
      const name = await reverseGeocode(lat, lng)
      const estimatedTimeInMinutes = Math.round(distance * 2) // 2 minutes per km

      // Calculate different traffic condition times
      const lightTrafficTime = Math.round(estimatedTimeInMinutes * 0.8) // 20% faster than normal
      const midTrafficTime = estimatedTimeInMinutes // Normal traffic
      const heavyTrafficTime = Math.round(estimatedTimeInMinutes * 1.5) // 50% slower than normal
      const weatherIssuesTime = Math.round(estimatedTimeInMinutes * 1.8) // 80% slower than normal

      const newLocation = {
        name: name || "Selected Location",
        lat,
        lng,
        distance: Math.round(distance * 10) / 10,
        estimatedTime: estimatedTimeInMinutes,
        lightTrafficTime: lightTrafficTime,
        midTrafficTime: midTrafficTime,
        heavyTrafficTime: heavyTrafficTime,
        weatherIssuesTime: weatherIssuesTime,
        price: calculatePrice(distance),
        id: `loc-${Math.random().toString(36).substr(2, 9)}`,
      }

      setSelectedMapLocation(newLocation)

      drawRouteToCompany(newLocation)
    })

    mapRef.current = map
    companyMarkerRef.current = companyMarker
  }

  const addMarkersForLocations = (locations: Location[]) => {
    if (!mapRef.current) return

    const locationIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      shadowSize: [41, 41],
    })

    locations.forEach((location) => {
      const marker = L.marker([location.lat, location.lng], { icon: locationIcon })
        .addTo(mapRef.current!)
        .bindPopup(location.name)
        .on("click", () => {
          setSelectedMapLocation(location)
          drawRouteToCompany(location)
        })

      markersRef.current.push(marker)
    })
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      )
      const data = await response.json()

      const results = data.map((item: any) => {
        const distance = calculateDistance(
          Number.parseFloat(item.lat),
          Number.parseFloat(item.lon),
          companyLocation.lat,
          companyLocation.lng,
        )
        const estimatedTimeInMinutes = Math.round(distance * 2) // 2 minutes per km

        return {
          name: item.display_name,
          lat: Number.parseFloat(item.lat),
          lng: Number.parseFloat(item.lon),
          distance: distance,
          estimatedTime: estimatedTimeInMinutes,
          price: calculatePrice(distance),
          id: `search-${Math.random().toString(36).substr(2, 9)}`,
        }
      })

      setSearchResults(results)

      if (mapRef.current) {
        markersRef.current.forEach((marker) => {
          marker.remove()
        })
        markersRef.current = []

        addMarkersForLocations(results)

        addMarkersForLocations(savedLocationsList)

        if (results.length > 0) {
          const bounds = L.latLngBounds(results.map((loc: { lat: any; lng: any }) => [loc.lat, loc.lng]))
          bounds.extend([companyLocation.lat, companyLocation.lng])
          mapRef.current.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    } catch (error) {
      console.error("Error searching location:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const saveLocation = () => {
    if (selectedMapLocation) {
      const isWithinBoundary = isPointInCircle(
        selectedMapLocation.lat,
        selectedMapLocation.lng,
        cebuCityCenterLat,
        cebuCityCenterLng,
        cebuCityRadiusMeters,
      )

      if (isWithinBoundary) {
        const locationExists = savedLocationsList.some(
          (loc) => loc.lat === selectedMapLocation.lat && loc.lng === selectedMapLocation.lng,
        )

        if (!locationExists) {
          const newLocation = {
            ...selectedMapLocation,
            id: selectedMapLocation.id || `loc-${Math.random().toString(36).substr(2, 9)}`,
          }

          const updatedLocations = [...savedLocationsList, newLocation]
          setSavedLocationsList(updatedLocations)

          onSelectLocation(newLocation)
        }
      } else {
        setIsWarningModalOpen(true)
      }
    }
  }

  // Also update the deleteLocation function to clean up routes properly
  const deleteLocation = (locationId: string) => {
    setShowDeleteConfirm(null)

    const updatedLocations = savedLocationsList.filter((loc) => loc.id !== locationId)
    setSavedLocationsList(updatedLocations)

    if (selectedMapLocation && selectedMapLocation.id === locationId) {
      setSelectedMapLocation(null)

      // Clear all routes when deleting the selected location
      if (mapRef.current) {
        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Polyline) {
            // Check if this is a route layer (not a base map layer)
            if (
              layer.options.className === "route-line" ||
              layer.options.className === "route-shadow" ||
              layer.options.color === "#3b82f6"
            ) {
              layer.remove()
            }
          }
        })
      }

      if (routeLineRef.current && mapRef.current) {
        routeLineRef.current.remove()
        routeLineRef.current = null
      }

      if (routeControlRef.current) {
        routeControlRef.current.remove()
        routeControlRef.current = null
      }

      if (selectedMarkerRef.current && mapRef.current) {
        selectedMarkerRef.current.remove()
        selectedMarkerRef.current = null
      }

      // Cancel any ongoing animations
      if (routeAnimationRef.current) {
        cancelAnimationFrame(routeAnimationRef.current)
        routeAnimationRef.current = null
      }

      // Stop pulse animation
      if (routePulseRef.current) {
        clearInterval(routePulseRef.current)
        routePulseRef.current = null
      }
    }

    if (mapRef.current) {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      addMarkersForLocations(updatedLocations)
    }
  }

  const startEditLocation = (location: Location) => {
    setOriginalLocation(location)

    setSelectedMapLocation(location)

    setIsEditingLocation(location.id || null)
    setEditLocationName(location.name)

    setIsEditingPosition(true)

    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], 15)
    }
  }

  const saveEditLocation = () => {
    if (!selectedMapLocation || !isEditingLocation) return

    const updatedLocations = savedLocationsList.map((loc) => {
      if (loc.id === isEditingLocation) {
        return {
          ...selectedMapLocation,
          name: editLocationName || selectedMapLocation.name,
        }
      }
      return loc
    })

    setSavedLocationsList(updatedLocations)

    setSelectedMapLocation({
      ...selectedMapLocation,
      name: editLocationName || selectedMapLocation.name,
    })

    setIsEditingLocation(null)
    setIsEditingPosition(false)
    setOriginalLocation(null)

    if (editMarkerRef.current && mapRef.current) {
      editMarkerRef.current.remove()
      editMarkerRef.current = null
    }

    if (mapRef.current) {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      addMarkersForLocations(updatedLocations)
    }
  }

  const cancelEditLocation = () => {
    if (originalLocation && selectedMapLocation) {
      setSelectedMapLocation(originalLocation)

      drawRouteToCompany(originalLocation)
    }

    setIsEditingLocation(null)
    setIsEditingPosition(false)
    setOriginalLocation(null)

    if (editMarkerRef.current && mapRef.current) {
      editMarkerRef.current.remove()
      editMarkerRef.current = null
    }
  }

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()

      if (data && data.display_name) {
        const parts = data.display_name.split(",")
        return parts.slice(0, 3).join(", ")
      }

      return "Unknown location"
    } catch (error) {
      console.error("Error reverse geocoding:", error)
      return "Unknown location"
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
  }

  const calculatePrice = (distance: number): number => {
    const basePrice = 50
    const pricePerKm = 2.5
    return Math.round((basePrice + distance * pricePerKm) * 100) / 100
  }

  // Get route using OSRM API - FIX: Corrected the endpoint coordinates
  const getRouteCoordinates = async (start: [number, number], end: [number, number]): Promise<[number, number][]> => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
      )
      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
      }

      // Fallback to straight line if route not found
      return [start, end]
    } catch (error) {
      console.error("Error fetching route:", error)
      // Fallback to straight line
      return [start, end]
    }
  }

  // Update the drawRouteToCompany function to apply animation to the entire route
  const drawRouteToCompany = async (location: Location) => {
    if (!mapRef.current) return

    setIsRouteLoading(true)

    // Clear existing route and ALL previous routes
    if (routeLineRef.current) {
      routeLineRef.current.remove()
      routeLineRef.current = null
    }

    if (routeControlRef.current) {
      routeControlRef.current.remove()
      routeControlRef.current = null
    }

    // Stop any existing pulse animation
    if (routePulseRef.current) {
      clearInterval(routePulseRef.current)
      routePulseRef.current = null
    }

    // Clear any route shadows or additional elements
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Polyline && layer !== routeLineRef.current) {
        // Check if this is a route layer (not a base map layer)
        if (
          layer.options.className === "route-line" ||
          layer.options.className === "route-shadow" ||
          layer.options.color === "#3b82f6"
        ) {
          layer.remove()
        }
      }
    })

    // Cancel any ongoing animations
    if (routeAnimationRef.current) {
      cancelAnimationFrame(routeAnimationRef.current)
      routeAnimationRef.current = null
    }

    // Remove any existing pulse markers
    document.querySelectorAll(".pulse-icon-wrapper").forEach((el) => {
      const parent = el.parentElement
      if (parent) parent.remove()
    })

    try {
      // Get route coordinates that follow roads
      const routeCoords = await getRouteCoordinates(
        [location.lat, location.lng],
        [companyLocation.lat, companyLocation.lng],
      )

      // Create a polyline with the route
      const routeLine = L.polyline([], {
        color: "#3b82f6",
        weight: 5,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
        className: "route-line",
      }).addTo(mapRef.current)

      routeLineRef.current = routeLine

      // Animate the route drawing
      let step = 0
      const totalSteps = routeCoords.length

      const animateRoute = () => {
        if (step <= totalSteps) {
          const animatedRoute = routeCoords.slice(0, step)
          if (routeLineRef.current) {
            routeLineRef.current.setLatLngs(animatedRoute)
          }
          step += Math.max(1, Math.floor(totalSteps / 100)) // Speed up animation for long routes
          routeAnimationRef.current = requestAnimationFrame(animateRoute)
        } else {
          // Animation complete - switch to steady state
          // Add route shadow for better visibility
          const routeShadow = L.polyline(routeCoords, {
            color: "#000",
            weight: 8,
            opacity: 0.2,
            lineCap: "round",
            lineJoin: "round",
            className: "route-shadow",
          }).addTo(mapRef.current!)

          routeShadow.bringToBack()

          // Set the final route with idle animation
          if (routeLineRef.current) {
            routeLineRef.current.setLatLngs(routeCoords)

            // Apply both animations to the route line
            const routeElement = routeLineRef.current.getElement()
            if (routeElement) {
              routeElement.classList.add("route-pulse")
              routeElement.classList.add("route-flow")

              // Set the stroke-dasharray and stroke-dashoffset for the flowing animation
              routeElement.setAttribute("stroke-dasharray", "15, 10")
              routeElement.setAttribute("stroke-dashoffset", "1000")
            }
          }
        }
      }

      routeAnimationRef.current = requestAnimationFrame(animateRoute)

      // Fit map to show the route
      const bounds = L.latLngBounds(routeCoords)
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })

      // Update distance and time based on actual route
      if (routeCoords.length > 2) {
        let totalDistance = 0
        for (let i = 1; i < routeCoords.length; i++) {
          totalDistance += calculateDistance(
            routeCoords[i - 1][0],
            routeCoords[i - 1][1],
            routeCoords[i][0],
            routeCoords[i][1],
          )
        }

        const estimatedTimeInMinutes = Math.round(totalDistance * 2)

        // Calculate different traffic condition times
        const lightTrafficTime = Math.round(estimatedTimeInMinutes * 0.8) // 20% faster than normal
        const midTrafficTime = estimatedTimeInMinutes // Normal traffic
        const heavyTrafficTime = Math.round(estimatedTimeInMinutes * 1.5) // 50% slower than normal
        const weatherIssuesTime = Math.round(estimatedTimeInMinutes * 1.8) // 80% slower than normal

        // Update location with actual route distance and time
        setSelectedMapLocation((prev) => {
          if (!prev) return null
          return {
            ...prev,
            distance: Math.round(totalDistance * 10) / 10,
            estimatedTime: estimatedTimeInMinutes,
            lightTrafficTime: lightTrafficTime,
            midTrafficTime: midTrafficTime,
            heavyTrafficTime: heavyTrafficTime,
            weatherIssuesTime: weatherIssuesTime,
            price: calculatePrice(totalDistance),
          }
        })
      }
    } catch (error) {
      console.error("Error drawing route:", error)

      // Fallback to simple line if route API fails
      const routeLine = L.polyline(
        [
          [location.lat, location.lng],
          [companyLocation.lat, companyLocation.lng],
        ],
        {
          color: "#3b82f6",
          weight: 4,
          opacity: 0.7,
          className: "route-line",
        },
      ).addTo(mapRef.current)

      routeLineRef.current = routeLine

      // Apply animations to the fallback route as well
      const routeElement = routeLineRef.current.getElement()
      if (routeElement) {
        routeElement.classList.add("route-pulse")
        routeElement.classList.add("route-flow")

        // Set the stroke-dasharray and stroke-dashoffset for the flowing animation
        routeElement.setAttribute("stroke-dasharray", "15, 10")
        routeElement.setAttribute("stroke-dashoffset", "1000")
      }

      const bounds = L.latLngBounds([
        [location.lat, location.lng],
        [companyLocation.lat, companyLocation.lng],
      ])
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    } finally {
      setIsRouteLoading(false)
    }
  }

  const selectLocationItem = (location: Location) => {
    if (isEditingPosition) return

    setSelectedMapLocation(location)

    if (mapRef.current) {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove()
      }
      const locationIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        shadowSize: [41, 41],
      })

      const marker = L.marker([location.lat, location.lng], { icon: locationIcon })
        .addTo(mapRef.current)
        .bindPopup(location.name)
        .openPopup()

      selectedMarkerRef.current = marker

      mapRef.current.setView([location.lat, location.lng], 14)

      drawRouteToCompany(location)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Full-screen Map */}
      <div className="absolute inset-0">
        <div ref={mapContainerRef} className="h-full w-full z-10"></div>

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
            onClick={() => mapRef.current?.zoomIn()}
          >
            <span className="text-gray-800 font-bold">+</span>
          </button>
          <button
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
            onClick={() => mapRef.current?.zoomOut()}
          >
            <span className="text-gray-800 font-bold">-</span>
          </button>
        </div>

        {/* Map instructions */}
        <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-md shadow-md text-sm text-gray-600 max-w-xs z-10">
          {isEditingPosition ? (
            <p>Click anywhere on the map to move this location</p>
          ) : (
            <p>Click anywhere on the map to select a service location</p>
          )}
        </div>

        {/* Route loading indicator */}
        {isRouteLoading && (
          <div className="absolute top-4 left-4 bg-white/90 p-2 rounded-md shadow-md z-50">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Calculating route...</span>
            </div>
          </div>
        )}

        {/* User location fetching indicator */}
        {isFetchingUserLocation && (
          <div className="absolute top-4 left-4 bg-white/90 p-2 rounded-md shadow-md z-50">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Fetching your location...</span>
            </div>
          </div>
        )}

        {/* User location error message */}
        {userLocationError && (
          <div className="absolute top-4 left-4 bg-red-100 p-2 rounded-md shadow-md">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">{userLocationError}</span>
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-4 left-4 w-90 max-h-[calc(100vh-200px)] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/40 flex flex-col z-30 overflow-hidden">
        {/* Header with close button */}
        <div className="p-4 flex justify-between items-center bg-white/95 backdrop-blur-sm border-b border-gray-100/50">
          <h2 className="text-lg font-medium text-gray-700">Select your service location</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-gray-100/50">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by address"
              className="w-full p-3 pl-10 bg-gray-100/70 border-none rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
              onKeyDown={(e) => e.key === "Enter" && searchLocation()}
            />
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={searchLocation}
              disabled={isSearching}
              className="flex-1 px-3 py-2 bg-gray-200/80 text-gray-800 rounded-xl hover:bg-gray-300/80 transition-all disabled:opacity-50 text-sm font-medium"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Edit mode controls */}
          {isEditingPosition && (
            <div className="flex gap-2 mt-2 p-2 bg-yellow-50 rounded-md">
              <div className="flex-1">
                <p className="text-xs text-yellow-800 mb-1">Editing location position</p>
                <input
                  type="text"
                  value={editLocationName}
                  onChange={(e) => setEditLocationName(e.target.value)}
                  placeholder="Location name"
                  className="w-full p-1.5 text-sm border border-gray-300 rounded"
                />
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={saveEditLocation}
                  className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                  title="Save changes"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={cancelEditLocation}
                  className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100/50">
          <button
            className={`flex-1 py-2 px-4 font-medium rounded-t-lg ${
              activeTab === "locations"
                ? "bg-gray-50 text-gray-800"
                : "bg-transparent text-gray-500 hover:bg-gray-50/50"
            }`}
            onClick={() => setActiveTab("locations")}
          >
            Saved Locations
          </button>
          <button
            className={`flex-1 py-2 px-4 font-medium rounded-t-lg flex items-center justify-center ${
              activeTab === "travelTimes"
                ? "bg-blue-50/70 text-blue-600"
                : "bg-transparent text-gray-500 hover:bg-blue-50/30"
            }`}
            onClick={() => {
              if (selectedMapLocation) {
                setActiveTab("travelTimes")
              }
            }}
            disabled={!selectedMapLocation}
          >
            <span className="text-sm">Travel Times</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "locations" ? (
            // Saved Locations Content
            savedLocationsList.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>
                  No saved locations yet. Search or click on the map to select a location, then click "Save Location".
                </p>
              </div>
            ) : (
              savedLocationsList.map((location) => (
                <div
                  key={`saved-${location.id}`}
                  className={`p-3 border-b border-gray-100/50 ${
                    selectedMapLocation && selectedMapLocation.id === location.id
                      ? "bg-blue-50/70 rounded-lg my-1 mx-1"
                      : "hover:bg-gray-50/70 rounded-lg my-1 mx-1"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => selectLocationItem(location)}>
                      <h3 className="font-medium text-gray-800">{location.name.split(",")[0]}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {location.distance.toFixed(1)} km • ~
                        {location.estimatedTime || Math.round(location.distance * 2)} min • $
                        {location.price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {showDeleteConfirm === location.id ? (
                        <>
                          <button
                            onClick={() => deleteLocation(location.id || "")}
                            className="p-1 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors"
                            title="Confirm Delete"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="p-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditLocation(location)}
                            disabled={isEditingPosition}
                            className={`p-1 ${isEditingPosition ? "text-gray-400" : "text-blue-600 hover:text-blue-800"} transition-colors`}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(location.id ?? null)}
                            disabled={isEditingPosition}
                            className={`p-1 ${isEditingPosition ? "text-gray-400" : "text-red-600 hover:text-red-800"} transition-colors`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : // Travel Times Content
          selectedMapLocation ? (
            <div className="p-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h5 className="text-sm font-medium mb-3 border-b pb-2">Estimated Travel Times</h5>

                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        Light Traffic
                      </span>
                      <span className="font-medium text-green-600">{selectedMapLocation.lightTrafficTime} min</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">20% faster than normal conditions</p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                        Medium Traffic
                      </span>
                      <span className="font-medium text-yellow-600">{selectedMapLocation.midTrafficTime} min</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Normal traffic conditions</p>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                        Heavy Traffic
                      </span>
                      <span className="font-medium text-orange-600">{selectedMapLocation.heavyTrafficTime} min</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">50% slower than normal conditions</p>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                        Weather Issues
                      </span>
                      <span className="font-medium text-red-600">{selectedMapLocation.weatherIssuesTime} min</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">80% slower due to adverse weather</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Select a location on the map to view estimated travel times.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100/50 bg-gray-50/80">
          {isEditingPosition ? (
            <div className="flex gap-2">
              <button
                onClick={saveEditLocation}
                className="flex-1 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={cancelEditLocation}
                className="flex-1 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <button
              onClick={saveLocation}
              disabled={!selectedMapLocation}
              className={`w-full py-3 rounded-xl transition-all font-medium ${
                selectedMapLocation
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm Location
            </button>
          )}
        </div>
      </div>

      {/* Out of Boundary Warning Modal */}
      <OutOfBoundaryModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        onContactCustomerService={handleContactCustomerService}
      />
    </div>
  )
}

export default LocationSelectionModal