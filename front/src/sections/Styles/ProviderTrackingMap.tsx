import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { MapPin, Navigation, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Star, Calendar, User } from "lucide-react"
import "ol/ol.css"
import { Map, View } from "ol"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { fromLonLat } from "ol/proj"
import { Feature, Overlay } from "ol"
import { LineString } from "ol/geom"
import { Vector as VectorSource } from "ol/source"
import { Vector as VectorLayer } from "ol/layer"
import { Style, Stroke } from "ol/style"

const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "ServiceBookingApp/1.0",
      },
    })

    if (!response.ok) {
      console.error("Reverse geocoding API failed with status:", response.status)
      return null
    }

    const data = await response.json()

    if (!data || !data.display_name) {
      console.error("No address found for coordinates:", lat, lng)
      return null
    }

    return data.display_name
  } catch (error) {
    console.error("Error in reverse geocoding:", error)
    return null
  }
}

const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser")
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        console.error("Error getting current location:", error)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  })
}

interface ProviderTrackingMapProps {
  providerName: string
  firstName?: string
  lastName?: string
  bookingId: string
  customerLocation: {
    lat: number
    lng: number
  }
  providerLocation: {
    lat: number
    lng: number
  }
  onProviderArrived?: () => void
  onServiceCompleted?: () => void
}

interface ProviderTrackingMapRef {
  showReviewForm: () => void
}

const ProviderTrackingMap = forwardRef<ProviderTrackingMapRef, ProviderTrackingMapProps>(
  (
    {
      providerName,
      firstName = "",
      lastName = "",
      bookingId,
      customerLocation: initialCustomerLocation,
      providerLocation: initialProviderLocation,
      onProviderArrived,
      onServiceCompleted,
    },
    ref,
  ) => {
    const [, setProviderLocation] = useState(initialProviderLocation)
    const [estimatedTime, setEstimatedTime] = useState(15)
    const [providerStatus, setProviderStatus] = useState<"moving" | "stopped">("moving")
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [providerArrived, setProviderArrived] = useState(false)
    const [arrivalTime, setArrivalTime] = useState<Date | null>(null)
    const [bookingDetails, setBookingDetails] = useState<any>(null)
    const [, setDestinationArrived] = useState(false)
    const [customerLocationName, setCustomerLocationName] = useState<string>("Customer Location")
    const [currentCustomerLocation, setCurrentCustomerLocation] = useState(initialCustomerLocation)
    const [currentProviderLocation] = useState(initialProviderLocation)

    const [providerRating, setProviderRating] = useState<number | null>(null)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [showThankYouMessage, setShowThankYouMessage] = useState(false)
    const [, setIsCompleted] = useState(false)
    const [reviewText, setReviewText] = useState("")

    const mapRef = useRef<Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const carMarkerElementRef = useRef<HTMLDivElement | null>(null)
    const routeLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const currentRouteRef = useRef<[number, number][]>([])
    const currentPointIndexRef = useRef<number>(0)
    const isMovingRef = useRef<boolean>(true)

    const simulationStartLocation = currentProviderLocation
    const simulationEndLocation = currentCustomerLocation

    useImperativeHandle(ref, () => ({
      showReviewForm: () => {
        setShowReviewForm(true)
      },
    }))

    useEffect(() => {
      const fetchCurrentLocation = async () => {
        const userLocation = await getCurrentLocation()
        if (userLocation) {
          setCurrentCustomerLocation(userLocation)
          console.log("User's current location:", userLocation)
        } else {
          console.log("Using provided customer location")
        }
      }

      fetchCurrentLocation()
    }, [])

    useEffect(() => {
      const fetchLocationNames = async () => {
        const customerName = await reverseGeocode(currentCustomerLocation.lat, currentCustomerLocation.lng)
        if (customerName) {
          setCustomerLocationName(customerName)
        }
      }

      fetchLocationNames()
    }, [currentCustomerLocation.lat, currentCustomerLocation.lng])

    useEffect(() => {
      const locationUpdateInterval = setInterval(() => {
        if (!providerArrived && isMovingRef.current) {
        }
      }, 10000)

      return () => clearInterval(locationUpdateInterval)
    }, [providerArrived])

    useEffect(() => {
      if (!document.getElementById("provider-tracking-animations")) {
        const style = document.createElement("style")
        style.id = "provider-tracking-animations"
        style.innerHTML = `
          .provider-marker {
            filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
            transition: transform 0.3s ease-out;
          }

          .provider-marker:hover {
            transform: scale(1.1);
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes bounceIn {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes slideInRight {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          .success-icon-container {
            animation: pulse 2s ease-in-out infinite;
          }

          .success-icon {
            animation: bounceIn 0.6s ease-out;
          }

          .success-title {
            animation: slideInUp 0.4s ease-out;
          }

          .success-message {
            animation: fadeIn 0.5s ease-out 0.2s both;
          }

          .success-button {
            animation: fadeIn 0.5s ease-out 0.3s both;
          }

          .success-detail {
            animation: slideInRight 0.4s ease-out forwards;
          }

          .success-detail:nth-child(2) {
            animation-delay: 0.1s;
          }

          .success-detail:nth-child(3) {
            animation-delay: 0.2s;
          }

          .success-detail:nth-child(4) {
            animation-delay: 0.3s;
          }

          .car-marker {
            width: 44px;
            height: 44px;
            background-color: #10b981;
            border-radius: 50%;
            position: relative;
            transform-origin: center center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3), 0 0 0 6px rgba(16, 185, 129, 0.2);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .car-marker:before {
            content: '';
            position: absolute;
            width: 0;
            height: 0;
            top: -12px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 16px solid #10b981;
            transform-origin: bottom center;
          }

          .car-marker:after {
            content: '';
            position: absolute;
            width: 28px;
            height: 28px;
            background-color: white;
            border-radius: 50%;
            z-index: 1;
          }

          .car-marker-inner {
            width: 20px;
            height: 20px;
            background-color: #10b981;
            border-radius: 50%;
            position: relative;
            z-index: 2;
          }

          .customer-marker {
            width: 22px;
            height: 22px;
            background-color: #3b82f6;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
          }
        `
        document.head.appendChild(style)
      }
    }, [])

    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return

      const osmLayer = new TileLayer({
        source: new OSM(),
        visible: true,
      })

      const routeSource = new VectorSource()
      const routeLayer = new VectorLayer({
        source: routeSource,
        style: new Style({
          stroke: new Stroke({
            color: "#3b82f6",
            width: 6,
          }),
        }),
        zIndex: 10,
      })
      routeLayerRef.current = routeLayer

      const markersSource = new VectorSource()
      const markersLayer = new VectorLayer({
        source: markersSource,
        zIndex: 20,
      })

      const map = new Map({
        target: mapContainerRef.current,
        layers: [osmLayer, routeLayer, markersLayer],
        view: new View({
          center: fromLonLat([simulationStartLocation.lng, simulationStartLocation.lat]),
          zoom: 14,
        }),
        controls: [],
      })

      const carMarkerElement = document.createElement("div")
      carMarkerElement.className = "car-marker"
      const carMarkerInner = document.createElement("div")
      carMarkerInner.className = "car-marker-inner"
      carMarkerElement.appendChild(carMarkerInner)
      carMarkerElementRef.current = carMarkerElement

      const carMarkerOverlay = new Overlay({
        element: carMarkerElement,
        positioning: "center-center",
        stopEvent: false,
      })
      map.addOverlay(carMarkerOverlay)
      carMarkerOverlay.setPosition(fromLonLat([simulationStartLocation.lng, simulationStartLocation.lat]))

      const customerMarkerElement = document.createElement("div")
      customerMarkerElement.className = "customer-marker"

      const customerMarkerOverlay = new Overlay({
        element: customerMarkerElement,
        positioning: "center-center",
        stopEvent: false,
      })
      map.addOverlay(customerMarkerOverlay)
      customerMarkerOverlay.setPosition(fromLonLat([simulationEndLocation.lng, simulationEndLocation.lat]))

      mapRef.current = map

      setTimeout(() => {
        map.updateSize()
        setIsMapLoaded(true)
      }, 100)

      initializeRouteAndSimulation()

      return () => {
        if (mapRef.current) {
          mapRef.current.setTarget(undefined)
          mapRef.current = null
        }

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }

        if (simulationTimeoutRef.current) {
          clearTimeout(simulationTimeoutRef.current)
          simulationTimeoutRef.current = null
        }
      }
    }, [])

    useEffect(() => {
      if (providerArrived && mapRef.current) {
        setTimeout(() => {
          mapRef.current?.updateSize()
        }, 100)
      }
    }, [providerArrived])

    useEffect(() => {
      const handleForceArrival = (event: CustomEvent<{ bookingId: string }>) => {
        if (event.detail.bookingId === bookingId) {
          if (carMarkerElementRef.current && mapRef.current) {
            const customerPos = fromLonLat([simulationEndLocation.lng, simulationEndLocation.lat])
            const overlay = mapRef.current
              .getOverlays()
              .getArray()
              .find((overlay) => overlay.getElement() === carMarkerElementRef.current)
            if (overlay) {
              overlay.setPosition(customerPos)
            }

            if (simulationTimeoutRef.current) {
              clearTimeout(simulationTimeoutRef.current)
              simulationTimeoutRef.current = null
            }

            setProviderStatus("stopped")
            setProviderArrived(true)
            setArrivalTime(new Date())

            localStorage.setItem(
              "providerArrived",
              JSON.stringify({
                bookingId: bookingId,
                providerName: providerName,
                timestamp: new Date().getTime(),
              }),
            )

            if (onProviderArrived) {
              onProviderArrived()
            }
          }
        }
      }

      window.addEventListener("providerForceArrival", handleForceArrival as EventListener)

      return () => {
        window.removeEventListener("providerForceArrival", handleForceArrival as EventListener)
      }
    }, [bookingId, providerName, onProviderArrived, simulationEndLocation])

    useEffect(() => {
      const fetchBookingDetails = async () => {
        try {
          const token = localStorage.getItem("token")
          if (!token) return

          const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const booking = await response.json()
            setBookingDetails(booking)
            setDestinationArrived(booking.destinationArrived || false)

            if (booking.destinationArrived && !providerArrived) {
              setTimeout(() => {
                if (carMarkerElementRef.current && mapRef.current) {
                  const customerPos = fromLonLat([simulationEndLocation.lng, simulationEndLocation.lat])
                  const overlay = mapRef.current
                    .getOverlays()
                    .getArray()
                    .find((overlay) => overlay.getElement() === carMarkerElementRef.current)
                  if (overlay) {
                    overlay.setPosition(customerPos)
                  }

                  setProviderStatus("stopped")
                  setProviderArrived(true)
                  setArrivalTime(new Date())

                  if (onProviderArrived) {
                    onProviderArrived()
                  }
                }
              }, 1000)
            }
          }
        } catch (error) {
          console.error("Error fetching booking details:", error)
        }
      }

      fetchBookingDetails()
    }, [bookingId, providerArrived, onProviderArrived, simulationEndLocation])

    const initializeRouteAndSimulation = async () => {
      const routeCoords = await getRouteCoordinates(simulationStartLocation, simulationEndLocation)

      if (routeCoords && routeCoords.length > 0) {
        currentRouteRef.current = routeCoords
        currentPointIndexRef.current = 0

        drawRoute(routeCoords)

        calculateRealisticETA(simulationStartLocation, simulationEndLocation)

        setTimeout(() => {
          simulateProviderMovement()
        }, 1000)
      }
    }

    const getRouteCoordinates = async (
      start: { lat: number; lng: number },
      end: { lat: number; lng: number },
    ): Promise<[number, number][]> => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
        )
        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          return data.routes[0].geometry.coordinates as [number, number][]
        }

        return [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ]
      } catch (error) {
        console.error("Error fetching route:", error)
        return [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ]
      }
    }

    const drawRoute = (routeCoords: [number, number][]) => {
      if (!mapRef.current || !routeLayerRef.current) return

      routeLayerRef.current.getSource()?.clear()

      const olCoords = routeCoords.map((coord) => fromLonLat(coord))

      const routeFeature = new Feature({
        geometry: new LineString(olCoords),
      })

      routeLayerRef.current.getSource()?.addFeature(routeFeature)

      const extent = routeFeature.getGeometry()?.getExtent()
      if (extent) {
        mapRef.current.getView().fit(extent, { padding: [50, 50, 50, 50] })
      }
    }

    const simulateProviderMovement = () => {
      if (!mapRef.current || !carMarkerElementRef.current) return

      const routePoints = currentRouteRef.current
      if (routePoints.length === 0) return

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current)
        simulationTimeoutRef.current = null
      }

      const moveProvider = () => {
        if (currentPointIndexRef.current >= routePoints.length - 1) {
          setProviderStatus("stopped")
          setProviderArrived(true)
          setArrivalTime(new Date())

          localStorage.setItem(
            "providerArrived",
            JSON.stringify({
              bookingId: bookingId,
              providerName: providerName,
              timestamp: new Date().getTime(),
            }),
          )

          if (onProviderArrived) {
            onProviderArrived()
          }

          return
        }

        if (isMovingRef.current) {
          const currentPoint = routePoints[currentPointIndexRef.current]
          const nextPointIndex = Math.min(currentPointIndexRef.current + 1, routePoints.length - 1)
          const nextPoint = routePoints[nextPointIndex]

          const newBearing = calculateBearing(currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1])

          const olCoord = fromLonLat(currentPoint)
          const overlay = mapRef.current
            ?.getOverlays()
            .getArray()
            .find((overlay) => overlay.getElement() === carMarkerElementRef.current)
          if (overlay) {
            overlay.setPosition(olCoord)
          }

          if (carMarkerElementRef.current) {
            carMarkerElementRef.current.style.transform = `rotate(${newBearing}deg)`
          }

          mapRef.current?.getView().animate({
            center: olCoord,
            duration: 300,
          })

          setProviderLocation({
            lat: currentPoint[1],
            lng: currentPoint[0],
          })

          currentPointIndexRef.current++

          const remainingDistance = calculateRemainingDistance(routePoints, currentPointIndexRef.current)
          const newETA = Math.ceil((remainingDistance / 30) * 60)
          setEstimatedTime(newETA > 0 ? newETA : 1)

          const routeProgress = currentPointIndexRef.current / routePoints.length
          if (Math.random() < 0.05 && routeProgress > 0.3 && routeProgress < 0.7) {
            isMovingRef.current = false
            setProviderStatus("stopped")

            simulationTimeoutRef.current = setTimeout(
              () => {
                isMovingRef.current = true
                setProviderStatus("moving")
                moveProvider()
              },
              2000 + Math.random() * 1000,
            )

            return
          }
        }

        const movementDelay = 200 + Math.random() * 100
        simulationTimeoutRef.current = setTimeout(moveProvider, movementDelay)
      }

      moveProvider()
    }

    const calculateBearing = (lon1: number, lat1: number, lon2: number, lat2: number): number => {
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180)
      const x =
        Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
        Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon)
      const bearing = (Math.atan2(y, x) * 180) / Math.PI
      return (bearing + 360) % 360
    }

    const calculateRemainingDistance = (routePoints: [number, number][], currentIndex: number): number => {
      let distance = 0

      for (let i = currentIndex; i < routePoints.length - 1; i++) {
        distance += calculateDistance(
          routePoints[i][1],
          routePoints[i][0],
          routePoints[i + 1][1],
          routePoints[i + 1][0],
        )
      }

      return distance
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

    const calculateRealisticETA = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`,
        )
        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          const durationInSeconds = data.routes[0].duration
          const durationInMinutes = Math.ceil(durationInSeconds / 60)
          setEstimatedTime(durationInMinutes)
        }
      } catch (error) {
        console.error("Error calculating ETA:", error)
        const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng)
        const estimatedMinutes = Math.ceil((distance / 30) * 60)
        setEstimatedTime(estimatedMinutes)
      }
    }

    const handleReviewSubmit = () => {
      const saveReview = async () => {
        try {
          const token = localStorage.getItem("token")
          if (token) {
            await fetch(`http://localhost:3000/api/bookings/${bookingId}/review`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                providerRating: providerRating,
                providerReview: reviewText,
              }),
            })
          }
        } catch (error) {
          console.error("Error saving review:", error)
        }
      }

      saveReview()
      setShowReviewForm(false)
      setShowThankYouMessage(true)

      localStorage.setItem(
        "serviceCompleted",
        JSON.stringify({
          id: bookingId,
          timestamp: new Date().getTime(),
          reviewed: true,
          rating: providerRating,
          reviewText: reviewText,
        }),
      )

      if (onServiceCompleted) {
        onServiceCompleted()
      }

      setTimeout(() => {
        setShowThankYouMessage(false)
        setIsCompleted(true)
      }, 3000)
    }

    return (
      <div className="flex flex-col h-[500px]">
        <div className="bg-gray-100 p-3 rounded-lg mb-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <div className="bg-green-100 p-1.5 rounded-full mr-2">
                <Navigation className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">{providerName}</h4>
                {(firstName || lastName) && (
                  <p className="text-gray-500 text-xs">
                    {firstName} {lastName}
                  </p>
                )}
                {providerArrived && bookingDetails?.providerRating > 0 && (
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= bookingDetails.providerRating ? "text-amber-500 fill-amber-500" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({bookingDetails.providerRating}.0)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                  providerStatus === "moving" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {providerStatus === "moving" ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Moving
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Stopped
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{providerArrived ? "Arrived at your location" : "Your provider is right on the track"}</span>
            </div>
            {!providerArrived && (
              <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                <Clock className="h-3.5 w-3.5 mr-1 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {estimatedTime} min{estimatedTime !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex rounded-lg overflow-hidden bg-gray-200 relative">
          {!providerArrived && (
            <div
              ref={mapContainerRef}
              className="w-full h-full rounded-lg overflow-hidden bg-gray-200 relative"
              style={{ minHeight: "300px", visibility: "visible" }}
            >
              {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-t-sky-500 border-gray-200 rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading map...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {providerArrived && (
            <div className="w-full bg-white p-5 flex flex-col max-h-[500px] overflow-y-auto">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 success-icon-container">
                  <CheckCircle2 className="h-8 w-8 text-green-500 success-icon" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1 success-title">Provider Arrived!</h3>
                <p className="text-gray-600 text-sm success-message">{providerName} has arrived at your location.</p>
              </div>

              <div className="flex-1 flex flex-col space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg flex items-start success-detail">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Provider</h4>
                    <p className="text-gray-600 text-sm">{providerName}</p>
                    {(firstName || lastName) && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        {firstName} {lastName}
                      </p>
                    )}
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            bookingDetails?.providerRating && star <= bookingDetails.providerRating
                              ? "text-amber-500 fill-amber-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({bookingDetails?.providerRating || 0}.0)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg flex items-start success-detail">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Arrival Time</h4>
                    <p className="text-gray-600 text-sm">
                      {arrivalTime
                        ? arrivalTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Just now"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {arrivalTime
                        ? arrivalTime.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                        : new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg flex items-start success-detail">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Service Location</h4>
                    <p className="text-gray-600 text-sm">{customerLocationName || bookingDetails?.location?.name || "Customer's location"}</p>
                    <p className="text-xs text-gray-500">Booking #{bookingId}</p>
                    <p className="text-xs text-gray-400">
                      {currentCustomerLocation.lat.toFixed(4)}, {currentCustomerLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4 text-center">Rate Your Provider</h3>

              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={`provider-rating-${rating}`}
                      onClick={() => setProviderRating(rating)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          providerRating !== null && rating <= providerRating
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                  Share your experience (optional)
                </label>
                <textarea
                  id="review"
                  className="w-full p-3 border rounded-md text-sm"
                  rows={3}
                  placeholder="How was your experience with this provider?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                  onClick={() => setShowReviewForm(false)}
                >
                  Skip
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  onClick={handleReviewSubmit}
                  disabled={providerRating === null}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}

        {showThankYouMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg max-w-md w-full text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Thank You for Your Review!</h3>
              <p className="text-gray-600 mb-4">
                We're grateful for your feedback and the opportunity to serve you. Your review helps us improve our
                services. We hope to see you again soon!
              </p>
            </div>
          </div>
        )}
      </div>
    )
  },
)

ProviderTrackingMap.displayName = "ProviderTrackingMap"

export default ProviderTrackingMap