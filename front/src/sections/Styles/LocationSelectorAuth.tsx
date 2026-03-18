import { useState, useEffect, useRef, useCallback, Component } from "react"
import { X, Search, Check, MapPin, Menu, Eye, EyeOff } from "lucide-react"
import "ol/ol.css"
import { Map, View } from "ol"
import TileLayer from "ol/layer/Tile"
import VectorTileLayer from "ol/layer/VectorTile"
import VectorTileSource from "ol/source/VectorTile"
import MVT from "ol/format/MVT"
import OSM from "ol/source/OSM"
import XYZ from "ol/source/XYZ"
import { fromLonLat, toLonLat } from "ol/proj"
import { Feature, Overlay } from "ol"
import { Point, Circle as GeomCircle } from "ol/geom"
import { Vector as VectorSource } from "ol/source"
import { Vector as VectorLayer } from "ol/layer"
import { Style, Circle, Fill, Stroke } from "ol/style"
import { Viewer, ViewerOptions } from "mapillary-js"
import "mapillary-js/dist/mapillary.css"
import OutOfBoundaryModal from "../Styles/OutOfBoundary"
import { calculateDistance, isPointInCircle, reverseGeocode } from "../LocationUtils/LocationUtil"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Location {
  name: string
  lat: number
  lng: number
  distance: number
  price?: number
  id?: string
  zipCode?: string
  isUserLocation?: boolean
}

interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (location: Location) => void
  companyLocation: { lat: number; lng: number }
  savedLocations?: Location[]
  previousLocation?: Location | null
  mapillaryAccessToken?: string
}

// ---------------------------------------------------------------------------
// Mapillary Viewer – class component wrapper (as per Mapillary JS docs)
// ---------------------------------------------------------------------------

interface MapillaryViewerProps {
  accessToken: string
  imageId: string
  style?: React.CSSProperties
  onViewerReady?: (viewer: Viewer) => void
}

class MapillaryViewerComponent extends Component<MapillaryViewerProps> {
  private containerRef = { current: null as HTMLDivElement | null }
  private viewer: Viewer | null = null

  componentDidMount() {
    if (!this.containerRef.current) return
    const options: ViewerOptions = {
      accessToken: this.props.accessToken,
      container: this.containerRef.current,
      imageId: this.props.imageId,
    }
    this.viewer = new Viewer(options)
    if (this.props.onViewerReady) this.props.onViewerReady(this.viewer)
  }

  componentWillUnmount() {
    if (this.viewer) {
      this.viewer.remove()
      this.viewer = null
    }
  }

  render() {
    return (
      <div
        ref={(el) => { this.containerRef.current = el }}
        style={this.props.style}
      />
    )
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAPILLARY_TOKEN = "MLY|26550848887865226|e63d8c300f950207074f046168955b84"
// Coverage tile endpoint – shows green lines where Mapillary photos exist
// Coverage is only rendered when zoom >= this threshold to avoid loading too many tiles
const MIN_ZOOM_FOR_COVERAGE = 15

// mly1_computed_public = map-matched, vehicle-captured sequences only (no foot/bike)
const MAPILLARY_COVERAGE_TILES = `https://tiles.mapillary.com/maps/vtp/mly1_computed_public/2/{z}/{x}/{y}?access_token=${MAPILLARY_TOKEN}`

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LocationSelector({
  isOpen,
  onClose,
  onSelectLocation,
  companyLocation,
  savedLocations = [],
  previousLocation = null,
  mapillaryAccessToken = MAPILLARY_TOKEN,
}: LocationSelectorProps) {

  // Core map state
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [, setSearchResults] = useState<Location[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [selectedMapLocation, setSelectedMapLocation] = useState<Location | null>(previousLocation)
  const [savedLocationsList, setSavedLocationsList] = useState<Location[]>([])
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [notFound, setNotFound] = useState<boolean>(false)
  const [, setIsSearchBarFocused] = useState<boolean>(false)
  const [mapLayers, setMapLayers] = useState<string>("standard")
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [isTrackingLocation, setIsTrackingLocation] = useState<boolean>(false)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Coverage overlay toggle
  const [showCoverage, setShowCoverage] = useState(true)

  // Viewport culling state
  const [zoomLevel, setZoomLevel] = useState<number>(14)
  const [isBelowMinZoom, setIsBelowMinZoom] = useState(false)
  const coverageDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Street view state
  const [isStreetViewOpen, setIsStreetViewOpen] = useState(false)
  const [isStreetViewFullscreen, setIsStreetViewFullscreen] = useState(false)
  const [streetViewImageId, setStreetViewImageId] = useState<string>("")
  const [isLoadingStreetView, setIsLoadingStreetView] = useState(false)
  const [streetViewUnavailable, setStreetViewUnavailable] = useState(false)
  const streetViewerRef = useRef<Viewer | null>(null)

  // OpenLayers refs
  const mapRef = useRef<Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const companyMarkerRef = useRef<Overlay | null>(null)
  const coverageLayerRef = useRef<VectorTileLayer | null>(null)
  const allMarkersSourceRef = useRef(new VectorSource())
  const allMarkersLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  // Cursor position in canvas pixels — updated on pointermove, read in prerender
  const cursorPixelRef = useRef<[number, number] | null>(null)
  // Radius in CSS pixels of the coverage spotlight circle around the cursor
  const CURSOR_CLIP_RADIUS = 60

  // Cebu City boundary
  const cebuCityCenterLat = 10.243302
  const cebuCityCenterLng = 123.788994
  const cebuCityRadiusMeters = 30000

  const memoizedReverseGeocode = useCallback(reverseGeocode, [])

  // Select a location item — centres OSM map
  const selectLocationItem = useCallback((location: Location) => {
    setSelectedMapLocation(location)
    if (mapRef.current) {
      mapRef.current.getView().setCenter(fromLonLat([location.lng, location.lat]))
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Find nearest Mapillary image for coords using Graph API
  // ---------------------------------------------------------------------------
  const fetchNearestMapillaryImage = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    try {
      const url =
        `https://graph.mapillary.com/images?access_token=${mapillaryAccessToken}` +
        `&fields=id&bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&limit=1`
      const res = await fetch(url)
      const json = await res.json()
      if (json.data && json.data.length > 0) return json.data[0].id
      return null
    } catch {
      return null
    }
  }, [mapillaryAccessToken])

  // Open street view at given coords
  const openStreetViewAt = useCallback(async (lat: number, lng: number) => {
    setIsLoadingStreetView(true)
    setStreetViewUnavailable(false)
    const imageId = await fetchNearestMapillaryImage(lat, lng)
    if (imageId) {
      setStreetViewImageId(imageId)
      setIsStreetViewOpen(true)
      // If viewer already mounted, navigate it
      if (streetViewerRef.current) {
        streetViewerRef.current.moveTo(imageId).catch(() => {})
      }
    } else {
      setStreetViewUnavailable(true)
      setTimeout(() => setStreetViewUnavailable(false), 3000)
    }
    setIsLoadingStreetView(false)
  }, [fetchNearestMapillaryImage])

  // ---------------------------------------------------------------------------
  // Saved locations list
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const cebuLocations: Location[] = [
      { id: "loc-1", name: "Cebu City Downtown, Cebu, Philippines", lat: 10.2931, lng: 123.9017, distance: calculateDistance(10.2931, 123.9017, companyLocation.lat, companyLocation.lng), price: 0, zipCode: "6000" },
      { id: "loc-2", name: "Ayala Center Cebu, Cebu City, Philippines", lat: 10.3178, lng: 123.9054, distance: calculateDistance(10.3178, 123.9054, companyLocation.lat, companyLocation.lng), price: 0, zipCode: "6000" },
      { id: "loc-3", name: "SM City Cebu, Cebu City, Philippines", lat: 10.3114, lng: 123.9187, distance: calculateDistance(10.3114, 123.9187, companyLocation.lat, companyLocation.lng), price: 0, zipCode: "6000" },
      { id: "loc-4", name: "IT Park Cebu, Cebu City, Philippines", lat: 10.3308, lng: 123.906, distance: calculateDistance(10.3308, 123.906, companyLocation.lat, companyLocation.lng), price: 0, zipCode: "6000" },
      { id: "loc-5", name: "Fuente Osmeña Circle, Cebu City, Philippines", lat: 10.3116, lng: 123.8916, distance: calculateDistance(10.3116, 123.8916, companyLocation.lat, companyLocation.lng), price: 0, zipCode: "6000" },
    ]
    setSavedLocationsList(savedLocations.length ? savedLocations : cebuLocations)
  }, [savedLocations, companyLocation.lat, companyLocation.lng])

  // ---------------------------------------------------------------------------
  // OpenLayers map initialisation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Base tile layers
    const osmLayer = new TileLayer({ source: new OSM(), visible: true })
    osmLayer.set("name", "standard")

    const satelliteLayer = new TileLayer({
      source: new XYZ({ url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attributions: "Tiles © Esri", maxZoom: 19 }),
      visible: false,
    })
    satelliteLayer.set("name", "satellite")

    const buildingsLayer = new TileLayer({
      source: new XYZ({ url: "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", attributions: "© OpenStreetMap contributors, HOT", maxZoom: 19 }),
      visible: false,
    })
    buildingsLayer.set("name", "buildings")

    // ── Mapillary coverage vector tile layer ──
    // Viewport-culled: only loads tiles within the current view extent,
    // and completely deactivates below MIN_ZOOM_FOR_COVERAGE to prevent device freezing.

    // Only blue pano sequences — non-pano features are filtered out before
    // the style function is even called, via setFilter on the source.

    const coverageTileSource = new VectorTileSource({
      format: new MVT(),
      url: MAPILLARY_COVERAGE_TILES,
      maxZoom: 14,
      transition: 0,
    })
    // Filter at the source level — non-pano features are discarded before
    // any style function runs, eliminating all null/empty-array style calls
    coverageTileSource.setTileLoadFunction((tile: any, url: string) => {
      tile.setLoader((extent: any, _resolution: any, projection: any) => {
        fetch(url)
          .then(r => {
            // Tile not found or empty — set no features so nothing renders
            if (!r.ok) { tile.setFeatures([]); return null }
            return r.arrayBuffer()
          })
          .then(data => {
            if (!data) return
            const format = tile.getFormat()
            const all = format.readFeatures(data, { extent, featureProjection: projection })
            // Keep only pano features that actually have geometry — drops null vectors
            tile.setFeatures(
              all.filter((f: any) =>
                f.get("is_pano") === true && f.getGeometry() != null
              )
            )
          })
          .catch(() => tile.setFeatures([]))
      })
    })

    const coverageLayer = new VectorTileLayer({
      source: coverageTileSource,
      visible: false,
      zIndex: 6,
      minZoom: MIN_ZOOM_FOR_COVERAGE,
      renderBuffer: 0,
    })
    coverageLayer.set("name", "coverage")
    coverageLayerRef.current = coverageLayer

    // ── Canvas clip: only paint coverage inside a radius around the cursor ──
    // prerender  → set circular clip path centred on cursor pixel
    // postrender → restore canvas so other layers are unaffected
    coverageLayer.on("prerender", (evt: any) => {
      const ctx = evt.context as CanvasRenderingContext2D
      const cursor = cursorPixelRef.current
      ctx.save()
      ctx.beginPath()
      if (cursor) {
        // Scale pixel coords by devicePixelRatio because OL canvas is HiDPI
        const ratio = window.devicePixelRatio || 1
        ctx.arc(cursor[0] * ratio, cursor[1] * ratio, CURSOR_CLIP_RADIUS * ratio, 0, Math.PI * 2)
      }
      // If no cursor, beginPath with no arc = empty clip = nothing renders
      ctx.clip()
    })

    coverageLayer.on("postrender", (evt: any) => {
      const ctx = evt.context as CanvasRenderingContext2D
      ctx.restore()
    })

    // Cebu City boundary circle
    const cebuBoundaryFeature = new Feature({
      geometry: new GeomCircle(fromLonLat([cebuCityCenterLng, cebuCityCenterLat]), cebuCityRadiusMeters),
    })
    const boundaryLayer = new VectorLayer({
      source: new VectorSource({ features: [cebuBoundaryFeature] }),
      style: new Style({
        stroke: new Stroke({ color: "rgba(128,128,128,0.7)", width: 3 }),
        fill: new Fill({ color: "rgba(128,128,128,0.08)" }),
      }),
      zIndex: 5,
    })

    // Location markers layer
    allMarkersLayerRef.current = new VectorLayer({
      source: allMarkersSourceRef.current,
      style: (feature) => {
        const isSelected = feature.get("selected")
        const isUserLoc = feature.get("isUserLocation")
        return new Style({
          image: new Circle({
            radius: isSelected ? 10 : 8,
            fill: new Fill({ color: isSelected ? "rgba(59,130,246,0.9)" : isUserLoc ? "rgba(0,180,80,0.9)" : "rgba(59,130,246,0.7)" }),
            stroke: new Stroke({ color: "#ffffff", width: 2.5 }),
          }),
        })
      },
      zIndex: 10,
    })

    const initialCenter = previousLocation
      ? fromLonLat([previousLocation.lng, previousLocation.lat])
      : fromLonLat([companyLocation.lng, companyLocation.lat])

    const map = new Map({
      target: mapContainerRef.current,
      layers: [osmLayer, satelliteLayer, buildingsLayer, coverageLayer, boundaryLayer, allMarkersLayerRef.current],
      view: new View({ center: initialCenter, zoom: 14 }),
      controls: [],
    })

    // ── Viewport culling: moveend handler (placed after `const map` to avoid TDZ error) ──
    const handleMoveEnd = () => {
      const view = map.getView()
      const zoom = view.getZoom() ?? 0

      setZoomLevel(Math.round(zoom))

      if (zoom < MIN_ZOOM_FOR_COVERAGE) {
        setIsBelowMinZoom(true)
        coverageLayer.setVisible(false)
        const src = coverageLayer.getSource()
        if (src) { src.clear(); src.refresh() }
      } else {
        setIsBelowMinZoom(false)
        coverageLayer.setVisible(true)
      }
    }

    const debouncedMoveEnd = () => {
      if (coverageDebounceRef.current) clearTimeout(coverageDebounceRef.current)
      coverageDebounceRef.current = setTimeout(handleMoveEnd, 300)
    }

    map.on("moveend", debouncedMoveEnd)
    handleMoveEnd()

    // Company HQ marker
    const companyEl = document.createElement("div")
    companyEl.innerHTML = `<div style="background:#2563eb;color:white;border:2px solid white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.4)">HG</div>`
    const companyOverlay = new Overlay({ element: companyEl, positioning: "center-center", stopEvent: false })
    map.addOverlay(companyOverlay)
    companyOverlay.setPosition(fromLonLat([companyLocation.lng, companyLocation.lat]))
    companyMarkerRef.current = companyOverlay

    const style = document.createElement("style")
    style.textContent = `.ol-zoom { display: none; }`
    document.head.appendChild(style)

    // ── Cursor ring overlay — draws the visible dashed circle on top of the map ──
    // This is a separate canvas layered over the OL map so the user can see
    // exactly where the coverage reveal radius is.
    const ringCanvas = document.createElement("canvas")
    ringCanvas.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;z-index:9"
    mapContainerRef.current!.style.position = "relative"
    mapContainerRef.current!.appendChild(ringCanvas)

    const resizeRing = () => {
      const el = mapContainerRef.current
      if (!el) return
      ringCanvas.width = el.clientWidth * (window.devicePixelRatio || 1)
      ringCanvas.height = el.clientHeight * (window.devicePixelRatio || 1)
      ringCanvas.style.width = el.clientWidth + "px"
      ringCanvas.style.height = el.clientHeight + "px"
    }
    resizeRing()
    const resizeObs = new ResizeObserver(resizeRing)
    resizeObs.observe(mapContainerRef.current!)

    const drawRing = () => {
      const rctx = ringCanvas.getContext("2d")
      if (!rctx) return
      const ratio = window.devicePixelRatio || 1
      rctx.clearRect(0, 0, ringCanvas.width, ringCanvas.height)
      const cursor = cursorPixelRef.current
      if (!cursor) return
      const x = cursor[0] * ratio
      const y = cursor[1] * ratio
      const r = CURSOR_CLIP_RADIUS * ratio
      // Outer dashed ring
      rctx.beginPath()
      rctx.arc(x, y, r, 0, Math.PI * 2)
      rctx.strokeStyle = "rgba(255,255,255,0.9)"
      rctx.lineWidth = 2 * ratio
      rctx.setLineDash([8 * ratio, 5 * ratio])
      rctx.stroke()
      // Inner shadow ring for contrast on light backgrounds
      rctx.beginPath()
      rctx.arc(x, y, r, 0, Math.PI * 2)
      rctx.strokeStyle = "rgba(0,0,0,0.35)"
      rctx.lineWidth = 1 * ratio
      rctx.setLineDash([8 * ratio, 5 * ratio])
      rctx.lineDashOffset = 4 * ratio
      rctx.stroke()
      rctx.setLineDash([])
    }

    // Redraw ring on every OL postcompose (after all layers rendered)
    map.on("rendercomplete", drawRing)
    // Also redraw on pointermove so ring updates instantly
    map.on("pointermove", drawRing)

    // ── Map click handler ──
    // Clicks on Mapillary coverage lines open the street viewer for that spot
    map.on("click", async (evt) => {
      // Check if user clicked on a Mapillary coverage feature
      const coverageFeatures = map.getFeaturesAtPixel(evt.pixel, {
        layerFilter: (l) => l === coverageLayer,
        hitTolerance: 8,
      })

      if (coverageFeatures && coverageFeatures.length > 0) {
        // Clicked on a coverage line/dot — get the image ID from the tile feature
        const feat = coverageFeatures[0]
        const imageId = feat.get("image_id") || feat.get("id")
        const lonLat = toLonLat(evt.coordinate)
        const distance = calculateDistance(lonLat[1], lonLat[0], companyLocation.lat, companyLocation.lng)

        memoizedReverseGeocode(lonLat[1], lonLat[0]).then(({ name, zipCode }) => {
          setSelectedMapLocation({
            name: name || "Selected Location", lat: lonLat[1], lng: lonLat[0],
            distance: Math.round(distance * 10) / 10, price: 0,
            id: `click-${Math.random().toString(36).substr(2, 9)}`, zipCode,
          })
        })

        // Open street view using the image ID from the tile, or fall back to nearest lookup
        if (imageId && typeof imageId === "string") {
          setStreetViewImageId(imageId)
          setIsStreetViewOpen(true)
          if (streetViewerRef.current) streetViewerRef.current.moveTo(imageId).catch(() => {})
        } else {
          // imageId from tile might be a number, or absent — look up via Graph API
          const lonLat2 = toLonLat(evt.coordinate)
          const found = await (async () => {
            try {
              const url = `https://graph.mapillary.com/images?access_token=${mapillaryAccessToken}&fields=id&bbox=${lonLat2[0]-0.003},${lonLat2[1]-0.003},${lonLat2[0]+0.003},${lonLat2[1]+0.003}&limit=1`
              const res = await fetch(url)
              const json = await res.json()
              return json.data?.[0]?.id ?? null
            } catch { return null }
          })()
          if (found) {
            setStreetViewImageId(found)
            setIsStreetViewOpen(true)
            if (streetViewerRef.current) streetViewerRef.current.moveTo(found).catch(() => {})
          }
        }
        return
      }

      // Clicked on empty map area — select location only
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => {
        if (f.getGeometry() instanceof Point && f.get("location")) return f
        return undefined
      })
      if (feature?.get("location")) {
        selectLocationItem(feature.get("location"))
      } else {
        const lonLat = toLonLat(evt.coordinate)
        const distance = calculateDistance(lonLat[1], lonLat[0], companyLocation.lat, companyLocation.lng)
        memoizedReverseGeocode(lonLat[1], lonLat[0]).then(({ name, zipCode }) => {
          const newLocation: Location = {
            name: name || "Selected Location", lat: lonLat[1], lng: lonLat[0],
            distance: Math.round(distance * 10) / 10, price: 0,
            id: `click-${Math.random().toString(36).substr(2, 9)}`, zipCode,
          }
          setSelectedMapLocation(newLocation)
          mapRef.current?.getView().setCenter(evt.coordinate)
        })
      }
    })

    // pointermove — track cursor pixel for clip circle + show green cursor on coverage
    map.on("pointermove", (evt) => {
      cursorPixelRef.current = [evt.pixel[0], evt.pixel[1]]
      coverageLayer.changed()

      const hasCoverage = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: (l) => l === coverageLayer,
        hitTolerance: 8,
      })
      // Green circle cursor when hovering a coverage line, default otherwise
      const greenCursorSvg = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">',
        '<circle cx="12" cy="12" r="8" fill="none" stroke="#16a34a" stroke-width="2.5"/>',
        '<circle cx="12" cy="12" r="2" fill="#16a34a"/>',
        '</svg>',
      ].join("")
      const greenCursorUrl = `url("data:image/svg+xml,${encodeURIComponent(greenCursorSvg)}") 12 12, crosshair`
      map.getTargetElement().style.cursor = hasCoverage ? greenCursorUrl : ""
    })

    // When mouse leaves the map, clear cursor so clip collapses to nothing
    const mapEl = map.getTargetElement()
    const onMouseLeave = () => {
      cursorPixelRef.current = null
      coverageLayer.changed()
    }
    mapEl.addEventListener("mouseleave", onMouseLeave)

    mapRef.current = map
    setIsMapInitialized(true)

    return () => {
      if (coverageDebounceRef.current) clearTimeout(coverageDebounceRef.current)
      mapEl.removeEventListener("mouseleave", onMouseLeave)
      resizeObs.disconnect()
      if (ringCanvas.parentNode) ringCanvas.parentNode.removeChild(ringCanvas)
      if (mapRef.current) { mapRef.current.setTarget(undefined); mapRef.current = null }
      document.head.removeChild(style)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyLocation.lat, companyLocation.lng])

  // Toggle coverage visibility — respects BOTH the user toggle AND the zoom gate
  // This fires whenever showCoverage OR zoomLevel changes, keeping both in sync
  useEffect(() => {
    if (!coverageLayerRef.current) return
    const shouldShow = showCoverage && !isBelowMinZoom
    coverageLayerRef.current.setVisible(shouldShow)
    // When hiding, clear cached tiles to free memory
    if (!shouldShow) {
      const src = coverageLayerRef.current.getSource()
      if (src) src.clear()
    }
  }, [showCoverage, isBelowMinZoom])

  // ---------------------------------------------------------------------------
  // Sync markers
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isMapInitialized || !allMarkersSourceRef.current) return
    const features: Feature[] = []
    savedLocationsList.forEach((loc) => {
      if (!selectedMapLocation || loc.id !== selectedMapLocation.id) {
        features.push(new Feature({ geometry: new Point(fromLonLat([loc.lng, loc.lat])), selected: false, location: loc, id: loc.id }))
      }
    })
    if (userLocation && (!selectedMapLocation || selectedMapLocation.id !== userLocation.id)) {
      features.push(new Feature({ geometry: new Point(fromLonLat([userLocation.lng, userLocation.lat])), selected: false, location: userLocation, id: userLocation.id, isUserLocation: true }))
    }
    if (selectedMapLocation) {
      features.push(new Feature({ geometry: new Point(fromLonLat([selectedMapLocation.lng, selectedMapLocation.lat])), selected: true, id: "selected-marker", isUserLocation: selectedMapLocation.id === userLocation?.id }))
    }
    allMarkersSourceRef.current.clear()
    allMarkersSourceRef.current.addFeatures(features)
  }, [isMapInitialized, savedLocationsList, selectedMapLocation, userLocation])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestions.length > 0 && !(e.target as Element).closest(".search-container")) setSuggestions([])
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [suggestions])

  // Auto-request geolocation on open
  useEffect(() => {
    if (!isOpen || !navigator.geolocation) return
    setIsTrackingLocation(true)
    setLocationPermissionDenied(false)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const { name, zipCode } = await memoizedReverseGeocode(latitude, longitude)
          const distance = calculateDistance(latitude, longitude, companyLocation.lat, companyLocation.lng)
          const newUserLocation: Location = {
            name: name || "Your Current Location", lat: latitude, lng: longitude,
            distance: Math.round(distance * 10) / 10, price: 0,
            id: `user-location-${Date.now()}`, zipCode, isUserLocation: true,
          }
          setUserLocation(newUserLocation)
          setSelectedMapLocation(newUserLocation)
          if (mapRef.current) {
            mapRef.current.getView().setCenter(fromLonLat([longitude, latitude]))
            mapRef.current.getView().setZoom(16)
          }
        } catch (err) {
          console.error("Reverse geocode error:", err)
        } finally {
          setIsTrackingLocation(false)
        }
      },
      (err) => { console.error("Geolocation error:", err); setLocationPermissionDenied(true); setIsTrackingLocation(false) },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }, [isOpen, companyLocation.lat, companyLocation.lng, memoizedReverseGeocode])

  // ---------------------------------------------------------------------------
  // Search helpers
  // ---------------------------------------------------------------------------
  const handleSearchInput = (query: string) => {
    setSearchQuery(query); setNotFound(false)
    if (query.trim().length < 2) { setSuggestions([]); return }
    fetchSuggestions(query.trim())
  }

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) return
    try {
      setIsSearching(true)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5`)
      const data = await res.json()
      if (data.length === 0) { setNotFound(true); setSuggestions([]) }
      else {
        setNotFound(false)
        setSuggestions(data.map((item: any) => ({
          name: item.display_name, lat: Number.parseFloat(item.lat), lng: Number.parseFloat(item.lon),
          distance: calculateDistance(Number.parseFloat(item.lat), Number.parseFloat(item.lon), companyLocation.lat, companyLocation.lng),
          price: 0, id: `search-${Math.random().toString(36).substr(2, 9)}`, zipCode: item.address?.postcode ?? "",
        })))
      }
    } catch (err) {
      console.error("Suggestions error:", err); setSuggestions([])
    } finally { setIsSearching(false) }
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true); setSuggestions([])
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ph&city=Cebu&limit=5`)
      const data = await res.json()
      if (data.length === 0) { setNotFound(true); setSearchResults([]); return }
      setSearchResults(data.map((item: any) => ({
        name: item.display_name, lat: Number.parseFloat(item.lat), lng: Number.parseFloat(item.lon),
        distance: calculateDistance(Number.parseFloat(item.lat), Number.parseFloat(item.lon), companyLocation.lat, companyLocation.lng),
        price: 0, id: `search-${Math.random().toString(36).substr(2, 9)}`, zipCode: item.address?.postcode ?? "",
      })))
      setNotFound(false)
    } catch (err) { console.error("Search error:", err) }
    finally { setIsSearching(false) }
  }

  const confirmSelection = () => {
    if (!selectedMapLocation) return
    const within = isPointInCircle(selectedMapLocation.lat, selectedMapLocation.lng, cebuCityCenterLat, cebuCityCenterLng, cebuCityRadiusMeters)
    if (within) { onSelectLocation(selectedMapLocation); onClose() }
    else setIsWarningModalOpen(true)
  }

  const handleContactCustomerService = () => { console.log("Contacting customer service..."); setIsWarningModalOpen(false) }

  const changeMapLayer = (layerName: string) => {
    setMapLayers(layerName)
    mapRef.current?.getLayers().forEach((lyr) => {
      if (["standard", "satellite", "buildings"].includes(lyr.get("name"))) lyr.setVisible(lyr.get("name") === layerName)
    })
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation is not supported by this browser."); return }
    setIsTrackingLocation(true); setLocationPermissionDenied(false)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const { name, zipCode } = await memoizedReverseGeocode(latitude, longitude)
          const distance = calculateDistance(latitude, longitude, companyLocation.lat, companyLocation.lng)
          const newUserLocation: Location = {
            name: name || "Your Current Location", lat: latitude, lng: longitude,
            distance: Math.round(distance * 10) / 10, price: 0,
            id: `user-location-${Date.now()}`, zipCode, isUserLocation: true,
          }
          setUserLocation(newUserLocation); setSelectedMapLocation(newUserLocation)
          if (mapRef.current) {
            mapRef.current.getView().setCenter(fromLonLat([longitude, latitude]))
            mapRef.current.getView().setZoom(16)
          }
        } catch (err) { console.error("Error:", err) }
        finally { setIsTrackingLocation(false) }
      },
      (err) => { console.error("Geolocation error:", err); setLocationPermissionDenied(true); setIsTrackingLocation(false) },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  if (!isOpen) return null

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-white z-50 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">

      {/* ── Split layout: map (left/full) + street view (right, when open) ── */}
      <div className="absolute inset-0 flex">

        {/* OSM + Mapillary coverage map */}
        <div className={`relative transition-all duration-300 ${isStreetViewOpen ? "w-1/2" : "w-full"}`}>
          <div ref={mapContainerRef} className="h-full w-full" />

          {/* Coverage controls – top right */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">

            {/* Coverage toggle button */}
            <button
              onClick={() => setShowCoverage(!showCoverage)}
              title={showCoverage ? "Hide Mapillary coverage" : "Show Mapillary coverage"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow text-xs font-medium transition-all ${
                showCoverage ? "bg-green-500 text-white hover:bg-green-600" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="inline-block w-3 h-1.5 rounded-full" style={{ background: showCoverage ? "white" : "#05b45a" }} />
              {showCoverage ? "Coverage ON" : "Coverage OFF"}
            </button>

            {/* Zoom-too-low warning — shown when coverage is on but zoom is insufficient */}
            {showCoverage && isBelowMinZoom && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-2.5 py-1.5 rounded-lg shadow max-w-[190px] text-center leading-tight">
                <span className="font-semibold">Zoom in</span> to see Mapillary coverage
                <br />
                <span className="text-amber-500">(zoom {zoomLevel} → need {MIN_ZOOM_FOR_COVERAGE}+)</span>
              </div>
            )}

            {/* Hint — shown when coverage is visible and zoom is sufficient */}
            {showCoverage && !isBelowMinZoom && !isStreetViewOpen && (
              <div className="bg-white/90 backdrop-blur-sm text-xs text-gray-500 px-2.5 py-1.5 rounded-lg shadow max-w-[180px] text-center leading-tight">
                Click a <span className="text-green-600 font-medium">green line</span> to open street view
              </div>
            )}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-6 right-4 flex flex-col gap-2 z-10">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => mapRef.current?.getView().animate({ zoom: (mapRef.current.getView().getZoom() ?? 14) + 1, duration: 250 })}>
              <span className="text-gray-800 font-bold text-lg">+</span>
            </button>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => mapRef.current?.getView().animate({ zoom: (mapRef.current.getView().getZoom() ?? 14) - 1, duration: 250 })}>
              <span className="text-gray-800 font-bold text-lg">−</span>
            </button>
          </div>

          {/* Manual street view button (for selected location without clicking a line) */}
          <div className="absolute bottom-24 right-4 z-10 flex flex-col items-end gap-1.5">
            <button
              onClick={() => {
                if (isStreetViewOpen) { setIsStreetViewOpen(false); setIsStreetViewFullscreen(false); return }
                const loc = selectedMapLocation
                if (loc) openStreetViewAt(loc.lat, loc.lng)
                else {
                  const centre = mapRef.current?.getView().getCenter()
                  if (centre) { const ll = toLonLat(centre); openStreetViewAt(ll[1], ll[0]) }
                }
              }}
              disabled={isLoadingStreetView}
              title={isStreetViewOpen ? "Close Street View" : "Open Street View for selected location"}
              className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-sm font-medium transition-all ${
                isStreetViewOpen ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-gray-700 hover:bg-gray-50"
              } disabled:opacity-60`}
            >
              {isLoadingStreetView
                ? <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                : isStreetViewOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{isStreetViewOpen ? "Close View" : "Street View"}</span>
            </button>
            {streetViewUnavailable && (
              <div className="bg-white text-xs text-red-500 rounded-lg shadow px-2 py-1">
                No imagery available here
              </div>
            )}
          </div>

          {/* Map loading spinner */}
          {!isMapInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
              <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* ── Mapillary Street View panel ── */}
        {isStreetViewOpen && streetViewImageId && (
          <div className={`bg-gray-900 flex flex-col ${
            isStreetViewFullscreen
              ? "fixed inset-0 z-[100]"
              : "relative w-1/2 border-l border-gray-300"
          }`} style={isStreetViewFullscreen ? { width: "100vw", height: "100vh" } : {}}>
            {/* Header */}
            <div className="flex items-center justify-between bg-black/70 backdrop-blur-sm px-3 py-2 shrink-0">
              <span className="text-white text-xs font-medium flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Mapillary</span>
                <span className="text-white/60">Street View</span>
                {selectedMapLocation && (
                  <span className="text-white/50 ml-1">· {selectedMapLocation.name.split(",")[0]}</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {/* Fullscreen / Minimize toggle */}
                <button
                  onClick={() => setIsStreetViewFullscreen(!isStreetViewFullscreen)}
                  className="text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                  title={isStreetViewFullscreen ? "Minimize" : "Full screen"}
                >
                  {isStreetViewFullscreen ? (
                    /* Minimize icon — two inward arrows */
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                      <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                    </svg>
                  ) : (
                    /* Fullscreen icon — two outward arrows */
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                      <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                    </svg>
                  )}
                </button>
                {/* Close */}
                <button
                  onClick={() => { setIsStreetViewOpen(false); setIsStreetViewFullscreen(false) }}
                  className="text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                  title="Close street view"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mapillary viewer — key forces remount on fullscreen toggle so
                the internal canvas resizes correctly to the new container dimensions */}
            <div className="flex-1 min-h-0 overflow-hidden" style={{ position: "relative" }}>
              <MapillaryViewerComponent
                key={isStreetViewFullscreen ? "fs" : "split"}
                accessToken={mapillaryAccessToken}
                imageId={streetViewImageId}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                onViewerReady={(v) => { streetViewerRef.current = v }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Floating sidebar ── */}
      <div
        className={`absolute top-4 left-4 bg-white rounded-lg shadow-xl transition-all duration-300 z-30 ${
          isSidebarCollapsed ? "w-12" : "w-80"
        } max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          {!isSidebarCollapsed && <h2 className="text-base text-gray-700">Select Location</h2>}
          <div className="flex items-center gap-1">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            {!isSidebarCollapsed && (
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {!isSidebarCollapsed && (
          <>
            {/* Search section */}
            <div className="p-3 border-b border-gray-100 relative search-container shrink-0">
              <div className="relative">
                <input
                  type="text" value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Search by address"
                  className="w-full p-2.5 pl-9 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === "Enter" && searchLocation()}
                  onFocus={() => { setIsSearchBarFocused(true); if (searchQuery.trim().length >= 2) fetchSuggestions(searchQuery.trim()) }}
                  onBlur={() => setTimeout(() => setIsSearchBarFocused(false), 200)}
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="flex gap-2 mt-2">
                <button onClick={searchLocation} disabled={isSearching} className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-xs font-medium">
                  {isSearching ? "Searching..." : "Search"}
                </button>
                <button onClick={handleUseMyLocation} disabled={isTrackingLocation} className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-xs font-medium flex items-center gap-1.5" title="Use my current location">
                  {isTrackingLocation ? <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" /> : <MapPin className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Map layer controls */}
              <div className="flex gap-1 mt-2">
                {(["standard", "satellite", "buildings"] as const).map((layer) => (
                  <button key={layer} onClick={() => changeMapLayer(layer)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${mapLayers === layer ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {layer}
                  </button>
                ))}
              </div>

              {/* Status messages */}
              {isTrackingLocation && <div className="mt-2 p-2 bg-blue-50 text-blue-600 rounded-lg text-xs flex items-center gap-1.5"><div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />Getting your location...</div>}
              {locationPermissionDenied && <div className="mt-2 p-2 bg-orange-50 text-orange-600 rounded-lg text-xs">Location access denied. Search or click the map.</div>}
              {userLocation && <div className="mt-2 p-2 bg-green-50 text-green-600 rounded-lg text-xs flex items-center gap-1.5"><MapPin className="h-3 w-3" />Current location detected</div>}
              {notFound && suggestions.length === 0 && searchQuery.trim().length > 0 && <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs">Location not found. Try a different search.</div>}

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 left-3 right-3 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {suggestions.map((s) => (
                    <div key={s.id} className="p-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => { selectLocationItem(s); setSuggestions([]); setSearchQuery(s.name.split(",")[0]) }}>
                      <div className="font-medium text-xs">{s.name.split(",")[0]}</div>
                      <div className="text-xs text-gray-400 truncate">{s.name}</div>
                      {s.zipCode && <div className="text-xs text-sky-500">ZIP: {s.zipCode}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Locations list */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Saved Locations</h3>
              </div>

              {userLocation && (
                <div className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMapLocation?.id === userLocation.id ? "bg-blue-50" : ""}`} onClick={() => selectLocationItem(userLocation)}>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-xs">Your Current Location</h4>
                      <p className="text-gray-400 text-xs">{userLocation.distance.toFixed(1)} km from company</p>
                      {userLocation.zipCode && <p className="text-xs text-sky-500">ZIP: {userLocation.zipCode}</p>}
                    </div>
                    {selectedMapLocation?.id === userLocation.id && <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                  </div>
                </div>
              )}

              {savedLocationsList.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">No saved locations. Search or click the map.</div>
              ) : (
                savedLocationsList.map((location) => (
                  <div key={`saved-${location.id}`}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMapLocation?.id === location.id ? "bg-blue-50" : ""}`}
                    onClick={() => selectLocationItem(location)}
                  >
                    <div className="flex items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-xs truncate">{location.name.split(",")[0]}</h4>
                        <p className="text-gray-400 text-xs">{location.distance.toFixed(1)} km from company</p>
                        {location.zipCode && <p className="text-xs text-sky-500">ZIP: {location.zipCode}</p>}
                      </div>
                      {selectedMapLocation?.id === location.id && <Check className="h-3.5 w-3.5 text-green-500 shrink-0 ml-1" />}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Confirm button */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 shrink-0">
              <button
                onClick={confirmSelection} disabled={!selectedMapLocation}
                className={`w-full py-2.5 rounded-lg transition-colors font-medium text-sm ${selectedMapLocation ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                Confirm Location
              </button>
            </div>
          </>
        )}
      </div>

      <OutOfBoundaryModal isOpen={isWarningModalOpen} onClose={() => setIsWarningModalOpen(false)} onContactCustomerService={handleContactCustomerService} />
    </div>
  )
}