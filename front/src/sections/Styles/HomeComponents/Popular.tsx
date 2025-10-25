"use client"

import { useState, useRef, useEffect } from "react"
import { Radio, Star, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

import image1 from "@/assets/Home/undraw_hot-air-balloon_6knx.png"
import defualtPhoto from "@/assets/default-avatar-profile-icon-social-600nw-1913928688.png"

interface CooUser {
  _id: string
  businessName: string
  email: string
  profilePicture: string | null
  location?: {
    name: string
    lat: number
    lng: number
    distance: number
    zipCode: string
  }
  averageRating: number
  totalReviews: number
  accountType: string
  services?: any[]
}

interface RankedCompany extends CooUser {
  rank: number
  trend: number
  totalServices: number
  previousRank?: number
}

const mockCompanies: CooUser[] = [
  {
    _id: "1",
    businessName: "SparkleClean Pro",
    email: "contact@sparkleclean.com",
    profilePicture: null,
    location: { name: "New York", lat: 40.7128, lng: -74.006, distance: 0, zipCode: "10001" },
    averageRating: 4.9,
    totalReviews: 3245,
    accountType: "coo",
    services: Array(32).fill(null),
  },
  {
    _id: "2",
    businessName: "FixIt Masters",
    email: "info@fixitmasters.com",
    profilePicture: null,
    location: { name: "Los Angeles", lat: 34.0522, lng: -118.2437, distance: 0, zipCode: "90001" },
    averageRating: 4.8,
    totalReviews: 2891,
    accountType: "coo",
    services: Array(48).fill(null),
  },
  {
    _id: "3",
    businessName: "ColorPerfect Painters",
    email: "hello@colorperfect.com",
    profilePicture: null,
    location: { name: "Chicago", lat: 41.8781, lng: -87.6298, distance: 0, zipCode: "60601" },
    averageRating: 4.7,
    totalReviews: 1876,
    accountType: "coo",
    services: Array(16).fill(null),
  },
  {
    _id: "4",
    businessName: "GreenThumb Gardens",
    email: "support@greenthumb.com",
    profilePicture: null,
    location: { name: "Boston", lat: 42.3601, lng: -71.0589, distance: 0, zipCode: "02101" },
    averageRating: 4.6,
    totalReviews: 1523,
    accountType: "coo",
    services: Array(24).fill(null),
  },
  {
    _id: "5",
    businessName: "TechFix Solutions",
    email: "help@techfix.com",
    profilePicture: null,
    location: { name: "San Francisco", lat: 37.7749, lng: -122.4194, distance: 0, zipCode: "94101" },
    averageRating: 4.5,
    totalReviews: 1298,
    accountType: "coo",
    services: Array(19).fill(null),
  },
  {
    _id: "6",
    businessName: "PlumbPro Services",
    email: "contact@plumbpro.com",
    profilePicture: null,
    location: { name: "Austin", lat: 30.2672, lng: -97.7431, distance: 0, zipCode: "73301" },
    averageRating: 4.4,
    totalReviews: 1087,
    accountType: "coo",
    services: Array(15).fill(null),
  },
  {
    _id: "7",
    businessName: "CleanSweep Elite",
    email: "info@cleansweep.com",
    profilePicture: null,
    location: { name: "Dallas", lat: 32.7767, lng: -96.797, distance: 0, zipCode: "75201" },
    averageRating: 4.3,
    totalReviews: 945,
    accountType: "coo",
    services: Array(21).fill(null),
  },
  {
    _id: "8",
    businessName: "HandyPro Experts",
    email: "support@handypro.com",
    profilePicture: null,
    location: { name: "Houston", lat: 29.7604, lng: -95.3698, distance: 0, zipCode: "77001" },
    averageRating: 4.2,
    totalReviews: 823,
    accountType: "coo",
    services: Array(28).fill(null),
  },
  {
    _id: "9",
    businessName: "PetCare Plus",
    email: "hello@petcareplus.com",
    profilePicture: null,
    location: { name: "Miami", lat: 25.7617, lng: -80.1918, distance: 0, zipCode: "33101" },
    averageRating: 4.1,
    totalReviews: 712,
    accountType: "coo",
    services: Array(12).fill(null),
  }
]

export default function Popular() {
  const [displayCount, setDisplayCount] = useState(5)
  const tableBodyRef = useRef(null)

  const [companies, setCompanies] = useState<RankedCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)
  const [totalServices, setTotalServices] = useState<Record<string, number>>({})

  // ✅ Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        let cooUsers: CooUser[] = []

        try {
          const res = await fetch("http://localhost:3000/api/accounts/users?accountType=coo", {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          })
          if (res.ok) {
            const data = await res.json()
            cooUsers = data.users || data
          } else {
            setUsingMockData(true)
            cooUsers = mockCompanies
          }
        } catch {
          setUsingMockData(true)
          cooUsers = mockCompanies
        }

        const previousRankings = JSON.parse(localStorage.getItem("previousRankings") || "[]")

        const sortedCompanies = [...cooUsers].sort((a, b) => {
          if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating
          return b.totalReviews - a.totalReviews
        })

        const rankedCompanies = sortedCompanies.map((company, index) => {
          const currentRank = index + 1
          const previousRank = previousRankings.find((p: any) => p._id === company._id)?.rank || currentRank
          const trend = previousRank - currentRank
          return {
            ...company,
            rank: currentRank,
            trend,
            totalServices: 0,
            previousRank,
          }
        })

        setCompanies(rankedCompanies)
        localStorage.setItem(
          "previousRankings",
          JSON.stringify(rankedCompanies.map((c) => ({ _id: c._id, rank: c.rank })))
        )
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load companies")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  // ✅ Fetch total services per company
  useEffect(() => {
    const fetchTotals = async () => {
      const totals: Record<string, number> = {}

      await Promise.all(
        companies.map(async (company) => {
          try {
            const res = await fetch(`http://localhost:3000/total/${company._id}`)
            if (res.ok) {
              const data = await res.json()
              totals[company._id] = data.total || 0
            } else {
              totals[company._id] = 0
            }
          } catch {
            totals[company._id] = 0
          }
        })
      )

      setTotalServices(totals)
    }

    if (companies.length > 0) fetchTotals()
  }, [companies.length])

  const handleExpand = () => setDisplayCount(9)
  const handleCollapse = () => setDisplayCount(5)
  const rowHeight = 68
  const currentMaxHeight = displayCount * rowHeight

  const getCompanyData = (rank: number) => {
    const company = companies.find((c) => c.rank === rank)
    if (!company) {
      return {
        businessName: "TBA",
        email: "TBA",
        profilePicture: defualtPhoto,
        averageRating: 0,
        totalReviews: 0,
        location: { name: "TBA" },
        totalServices: 0,
        trend: 0,
      }
    }
    return { ...company, totalServices: totalServices[company._id] || 0 }
  }

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => {
      const full = i < Math.floor(rating)
      const half = i === Math.floor(rating) && rating % 1 >= 0.5
      return (
        <div key={i} className="relative w-4 h-4">
          <Star className="w-4 h-4 text-yellow-400" />
          {full && <Star className="absolute top-0 left-0 w-4 h-4 text-yellow-400 fill-yellow-400" />}
          {half && (
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          )}
        </div>
      )
    })

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading top companies...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Connection Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )

  const top1 = getCompanyData(1)
  const top2 = getCompanyData(2)
  const top3 = getCompanyData(3)
  const leaderboardCompanies = Array.from({ length: 6 }, (_, i) => ({ ...getCompanyData(i + 4), rank: i + 4 }))

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans mt-10">
      <div className="max-w-7xl mx-auto">
        {usingMockData && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-800">
              <strong>Preview Mode:</strong> Showing mock data. Connect to your API at localhost:3000 to see live data.
            </p>
          </div>
        )}

        {/* Header for Online Home Services */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center gap-1 mt-6 text-gray-600">
            <img src={image1} width={400} height={400} className="ml-20" />
          </div>
          <h2 className="text-4xl font-medium text-gray-700 mb-4 tracking-tight">
            Top Rated <span className="text-sky-500">Online Home Services</span>
          </h2>
          <p className="text-md text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover the most popular and highly-rated services in your area
          </p>
        </div>

        {/* Top 3 Services Section */}
        <div className="relative flex flex-col md:flex-row justify-center items-center gap-20 mb-12 mt-48">
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-gray-200 to-transparent opacity-50 rounded-t-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gray-100 opacity-70 rounded-t-3xl" />

          {/* 2nd Place */}
          <div
            className="relative z-20 flex flex-col items-center text-center p-8 
  bg-gradient-to-b from-white/90 via-white/80 to-white/60 
  backdrop-blur-xl rounded-3xl border
  shadow-[0_4px_20px_rgba(160,160,160,0.25)] border-gray-300 
  w-full max-w-xs md:max-w-[280px] lg:max-w-[320px]
  pb-10 pt-20 mb-10 transition-all duration-500"
          >
            <div className="absolute -top-16">
              <div className="relative">
                <img
                  src={top2.profilePicture || "/placeholder.svg?height=110&width=110&query=company logo"}
                  width={110}
                  height={110}
                  className="relative rounded-full h-25 w-25 border-[2px] border-gray-200 shadow-[0_4px_20px_rgba(224,224,224,0.25)] object-cover"
                />
              </div>
            </div>

            <div className="mt-3 text-sm tracking-wide text-gray-600 font-semibold uppercase">Top 2 Company</div>

            <div className="w-10 border-t border-gray-200 mt-5"></div>

            <h3 className="text-[22px] font-semibold text-gray-900 mt-4 tracking-tight">{top2.businessName}</h3>
            <p className="text-[14px] text-gray-500 mt-1">Where Quality Meets Dedication</p>

            <div className="mt-5">
              <div className="flex items-center justify-center gap-1 mb-1">{renderStars(top2.averageRating)}</div>

              <span className="text-[32px] font-bold text-yellow-400 leading-none">
                {top2.averageRating > 0 ? top2.averageRating.toFixed(1) : "N/A"}
              </span>

              <div className="text-sm text-gray-500 mt-1">
                {top2.totalReviews > 0 ? `${top2.totalReviews.toLocaleString()}+ reviews` : "No reviews yet"}
              </div>
            </div>

            <div className="w-2/3 border-t border-gray-200 my-6"></div>

            <div className="flex flex-col items-center">
              <span className="text-[30px] font-semibold text-gray-800">{top2.totalServices}</span>
              <span className="text-sm text-gray-500">Total Services</span>
            </div>

            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div
                className="absolute top-0 left-[-50%] w-[200%] h-full 
      bg-gradient-to-tr from-transparent via-white/20 to-transparent 
      animate-[shine_5s_infinite_linear]"
              ></div>
            </div>
          </div>

          {/* 1st Place */}
          <div
            className="relative z-20 flex flex-col items-center text-center p-8 
  bg-gradient-to-b from-white/90 via-white/80 to-white/60 
  backdrop-blur-xl rounded-3xl border
  shadow-[0_4px_20px_rgba(250,204,21,0.25)] border-yellow-300 
  w-full max-w-xs md:max-w-[280px] lg:max-w-[320px]
  pb-10 pt-20 mb-25 transition-all duration-500"
          >
            <div className="absolute -top-16">
              <div className="relative">
                <img
                  src={top1.profilePicture || "/placeholder.svg?height=110&width=110&query=company logo"}
                  width={110}
                  height={110}
                  className="relative rounded-full h-25 w-25 border-[2px] border-yellow-300 shadow-[0_4px_20px_rgba(250,204,21,0.25)] object-cover"
                />
              </div>
            </div>

            <div className="mt-3 text-sm tracking-wide text-gray-600 font-semibold uppercase">Top 1 Company</div>

            <div className="w-10 border-t border-gray-200 mt-5"></div>

            <h3 className="text-[22px] font-semibold text-gray-900 mt-4 tracking-tight">{top1.businessName}</h3>
            <p className="text-[14px] text-gray-500 mt-1">Leading the Way in Service Innovation</p>

            <div className="mt-5">
              <div className="flex items-center justify-center gap-1 mb-1">{renderStars(top1.averageRating)}</div>
              <span className="text-[32px] font-bold text-yellow-400 leading-none">
                {top1.averageRating > 0 ? top1.averageRating.toFixed(1) : "N/A"}
              </span>
              <div className="text-sm text-gray-500 mt-1">
                {top1.totalReviews > 0 ? `${top1.totalReviews.toLocaleString()}+ reviews` : "No reviews yet"}
              </div>
            </div>

            <div className="w-2/3 border-t border-gray-200 my-6"></div>

            <div className="flex flex-col items-center">
              <span className="text-[30px] font-semibold text-gray-800">{top1.totalServices}</span>
              <span className="text-sm text-gray-500">Total Services</span>
            </div>

            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div
                className="absolute top-0 left-[-50%] w-[200%] h-full 
      bg-gradient-to-tr from-transparent via-white/20 to-transparent 
      animate-[shine_5s_infinite_linear]"
              ></div>
            </div>
          </div>

          {/* 3rd Place */}
          <div
            className="relative z-20 flex flex-col items-center text-center p-8 
  bg-gradient-to-b from-white/90 via-white/80 to-white/60 
  backdrop-blur-xl rounded-3xl border
  shadow-[0_4px_20px_rgba(160,160,160,0.25)] border-gray-300 
  w-full max-w-xs md:max-w-[280px] lg:max-w-[320px]
  pb-10 pt-20 mb-10 transition-all duration-500"
          >
            <div className="absolute -top-16">
              <div className="relative">
                <img
                  src={top3.profilePicture || "/placeholder.svg?height=110&width=110&query=company logo"}
                  width={110}
                  height={110}
                  className="relative h-25 w-25 rounded-full border-[2px] border-gray-300 shadow-[0_4px_20px_rgba(224,224,224,0.25)]  object-cover"
                />
              </div>
            </div>

            <div className="mt-3 text-sm tracking-wide text-gray-600 font-semibold uppercase">Top 3 Company</div>

            <div className="w-10 border-t border-gray-200 mt-5"></div>

            <h3 className="text-[22px] font-semibold text-gray-900 mt-4 tracking-tight">{top3.businessName}</h3>
            <p className="text-[14px] text-gray-500 mt-1">Proudly Serving with Commitment</p>

            <div className="mt-5">
              <div className="flex items-center justify-center gap-1 mb-1">{renderStars(top3.averageRating)}</div>

              <span className="text-[32px] font-bold text-yellow-400 leading-none">
                {top3.averageRating > 0 ? top3.averageRating.toFixed(1) : "N/A"}
              </span>

              <div className="text-sm text-gray-500 mt-1">
                {top3.totalReviews > 0 ? `${top3.totalReviews.toLocaleString()}+ reviews` : "No reviews yet"}
              </div>
            </div>

            <div className="w-2/3 border-t border-gray-200 my-6"></div>

            <div className="flex flex-col items-center">
              <span className="text-[30px] font-semibold text-gray-800">{top3.totalServices}</span>
              <span className="text-sm text-gray-500">Total Services</span>
            </div>

            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div
                className="absolute top-0 left-[-50%] w-[200%] h-full 
      bg-gradient-to-tr from-transparent via-white/20 to-transparent 
      animate-[shine_5s_infinite_linear]"
              ></div>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="flex justify-center mb-12">
          <div className="px-6 py-3 text-sm text-gray-600 flex items-center gap-2 flex-col">
            <div className="flex flex-col items-center gap-1 mt-6 text-gray-600">
              <Radio className="w-6 h-6" />
              <span className="text-xs">Live Leaderboard as of</span>
              <span className="text-sm font-medium text-sky-500">Today, 2 PM : 2025</span>
            </div>
            <div className="mt-2">
              Discover top-rated services with over{" "}
              <span className="text-sm font-medium text-sky-500">
                {companies.reduce((sum, c) => sum + c.totalReviews, 0).toLocaleString()}
              </span>{" "}
              satisfied customers
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white/70 rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto min-w-[700px]">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-gray-600 font-medium text-sm">Rank</th>
                  <th className="px-6 py-4 text-gray-600 font-medium text-sm">Service Provider</th>
                  <th className="px-6 py-4 text-gray-600 font-medium text-sm text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>Reviews</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-gray-600 font-medium text-sm text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>Rating</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-gray-600 font-medium text-sm text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>Location</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-gray-600 font-medium text-sm">Trends</th>
                </tr>
              </thead>
              <tbody
                ref={tableBodyRef}
                className="transition-all duration-500 ease-in-out"
                style={{ maxHeight: `${currentMaxHeight}px`, overflow: "hidden" }}
              >
                {leaderboardCompanies.slice(0, displayCount).map((company) => (
                  <tr
                    key={company.rank}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-700 font-medium">{company.rank}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={company.profilePicture || "/placeholder.svg?height=40&width=40&query=company logo"}
                          alt={company.businessName}
                          width={50}
                          height={30}
                          className="rounded-full border border-gray-200 object-cover"
                        />
                        <div>
                          <div className="font-semibold text-gray-700">{company.businessName}</div>
                          <div className="text-xs text-gray-500">
                            @{company.email !== "TBA" ? company.email.split("@")[0] : "TBA"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-center">
                      {company.totalReviews > 0 ? company.totalReviews.toLocaleString() : "TBA"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-center">
                      {company.averageRating > 0 ? company.averageRating.toFixed(1) : "TBA"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-center">{company.location?.name || "TBA"}</td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 font-semibold ${company.trend > 0 ? "text-green-500" : company.trend < 0 ? "text-red-500" : "text-gray-500"
                          }`}
                      >
                        {company.trend > 0 ? `+${company.trend}` : company.trend < 0 ? company.trend : "—"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center mt-6 gap-4">
          {displayCount < 7 && (
            <Button onClick={handleExpand} variant="outline" className="text-sky-500 bg-transparent">
              <ChevronDown className="w-4 h-4 mr-2" /> Show More
            </Button>
          )}
          {displayCount > 5 && (
            <Button onClick={handleCollapse} variant="outline" className="text-sky-500 bg-transparent">
              <ChevronUp className="w-4 h-4 mr-2" /> Show Less
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}