import { useState, useEffect } from "react"
import {
    Search,
    X,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Star,
} from "lucide-react"

import CompanyProfile, { CompanyProfileProps } from "../../COO-tabs/CompanyProfile"

interface CooUser {
    _id: string
    businessName: string
    profilePicture: string | null
    coverPhoto: string | null
    aboutCompany: string
    location?: {
        name: string
        lat: number
        lng: number
        distance: number
        zipCode: string
    }
    averageRating: number
    totalReviews: number
    foundedDate?: Date
    teamSize?: string
    companyNumber?: string
    cityCoverage?: string[]
    messengerLink?: string
}

export default function Companies() {
    const [companies, setCompanies] = useState<CooUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCities, setSelectedCities] = useState<string[]>([])
    const [showAllCompanies, setShowAllCompanies] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<CooUser | null>(null) // ✅ make it visible
    const [, setLoadingDetails] = useState(false) // ✅ keep for future use

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true)
                setError(null)

                const token = localStorage.getItem("token")

                const response = await fetch("http://localhost:3000/api/accounts/users?accountType=coo", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    console.log("Companies.tsx: Fetched COO users:", data)
                    setCompanies(data.users || data)
                } else if (response.status === 401) {
                    setError("Unauthorized — please log in again.")
                    console.warn("Companies.tsx: 401 Unauthorized — missing or invalid token")
                } else {
                    const errorData = await response.json().catch(() => ({}))
                    console.error("Companies.tsx: Failed to fetch companies:", response.status, errorData)
                    setError("Failed to load companies.")
                }
            } catch (error) {
                console.error("Companies.tsx: Error fetching companies:", error)
                setError("Network error. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchCompanies()
    }, [])

    const allCities = Array.from(
        new Set(companies.map((company) => company.location?.name).filter((city): city is string => !!city)),
    )

    const filteredCompanies = companies.filter((company) => {
        const matchesSearch =
            company.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.aboutCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.location?.name?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCity =
            selectedCities.length === 0 || (company.location?.name && selectedCities.includes(company.location.name))

        return matchesSearch && matchesCity
    })

    const displayedCompanies = showAllCompanies ? filteredCompanies : filteredCompanies.slice(0, 8)

    const handleCityToggle = (city: string) => {
        setSelectedCities((prev) => {
            if (prev.includes(city)) {
                return prev.filter((c) => c !== city)
            } else {
                return [...prev, city]
            }
        })
    }

    const clearFilters = () => {
        setSearchQuery("")
        setSelectedCities([])
    }

    const toggleShowAllCompanies = () => {
        setShowAllCompanies((prev) => !prev)
    }

    const handleViewDetails = async (companyId: string) => {
        try {
            setLoadingDetails(true)
            const response = await fetch(`http://localhost:3000/api/users/${companyId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                const data = await response.json()
                console.log("Fetched company details:", data)
                setSelectedCompany(data)
            } else {
                console.error("Failed to fetch company details:", response.status)
                const company = companies.find((c) => c._id === companyId)
                if (company) {
                    setSelectedCompany(company)
                }
            }
        } catch (error) {
            console.error("Error fetching company details:", error)
            const company = companies.find((c) => c._id === companyId)
            if (company) {
                setSelectedCompany(company)
            }
        } finally {
            setLoadingDetails(false)
        }
    }

    const handleBackToCompanies = () => {
        setSelectedCompany(null)
    }

    if (selectedCompany) {
        // ✅ Explicitly type mappedSeller as CompanyProfileProps["seller"]
        const mappedSeller: CompanyProfileProps["seller"] = {
            id: selectedCompany._id,
            _id: selectedCompany._id,
            name: selectedCompany.businessName,
            businessName: selectedCompany.businessName,
            profilePicture: selectedCompany.profilePicture ?? undefined,
            totalRating: selectedCompany.averageRating || 0,
            reviews: selectedCompany.totalReviews || 0,
            totalReviews: selectedCompany.totalReviews || 0,
            location: selectedCompany.location?.name || "Unknown Location",
            startingRate: 0,
            ratePerKm: 0,
            badges: ["Company"],
            description: selectedCompany.aboutCompany || "No description available.",
            workerCount: 1,
            estimatedTime: "1-2 hours",
            coverPhoto: selectedCompany.coverPhoto ?? undefined,
            aboutCompany: selectedCompany.aboutCompany,
            cityCoverage: selectedCompany.cityCoverage || [],
            companyNumber: selectedCompany.companyNumber,
            teamSize: (["1-5", "6-10", "11-25", "26-50", "51-100", "101-500", "500+"].includes(selectedCompany.teamSize || "")
                ? (selectedCompany.teamSize as "1-5" | "6-10" | "11-25" | "26-50" | "51-100" | "101-500" | "500+")
                : undefined),
            foundedDate: selectedCompany.foundedDate ? String(selectedCompany.foundedDate) : undefined,
            isVerified: true,
        }

        return (
            <div className="fixed inset-0 z-[70] bg-white overflow-y-auto">
                <CompanyProfile seller={mappedSeller} onBack={handleBackToCompanies} />
            </div>
        )
    }


    if (loading) {
        return (
            <div className="min-h-screen bg-white/90 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading companies...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white/90 flex items-center justify-center">
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
    }

    return (
        <div className="min-h-screen bg-white/90 text-black py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-3xl font-medium text-gray-700">List of all <span className="text-sky-500 text-[40px] ml-1">Companies</span></h2>
                        <p className="text-sm text-gray-500">
                            Showing {displayedCompanies.length} of {filteredCompanies.length} companies
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center bg-gray-200/70 p-4 rounded-lg">
                        {/* Search Bar */}
                        <div className="relative flex-grow w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search companies"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* City Filters */}
                        {allCities.length > 0 && (
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center text-gray-700">
                                {allCities.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => handleCityToggle(city)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCities.includes(city)
                                            ? "bg-blue-500 text-white"
                                            : "bg-white text-black hover:bg-gray-300 cursor-pointer"
                                            }`}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Clear Filters */}
                        {(searchQuery || selectedCities.length > 0) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all w-full sm:w-auto justify-center"
                            >
                                <X className="h-4 w-4" />
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* Companies Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {displayedCompanies.map((company) => (
                            <div
                                key={company._id}
                                className="group cursor-pointer bg-gray-200/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Company Image */}
                                <div className="relative overflow-hidden rounded-lg mb-4">
                                    <img
                                        src={company.profilePicture || "/placeholder.svg?height=256&width=256&query=company logo"}
                                        alt={company.businessName}
                                        className="w-full h-64 object-cover transform transition duration-500 group-hover:scale-105"
                                    />
                                </div>

                                {/* Company Name */}
                                <h3 className="text-lg font-medium mb-2 text-gray-800">{company.businessName}</h3>

                                {/* Company Description */}
                                <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                                    {company.aboutCompany || "No description available"}
                                </p>

                                {/* Rating and Location */}
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-1 text-sm text-gray-700">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span>{company.averageRating.toFixed(1)}</span>
                                        <span className="text-gray-500">({company.totalReviews} reviews)</span>
                                    </div>

                                </div>

                                {/* View Details Button */}
                                <div className="mt-auto flex justify-end items-center pt-4">
                                    <button
                                        onClick={() => handleViewDetails(company._id)}
                                        className="text-sky-500 flex items-center transition-all duration-300 hover:text-blue-600 hover:translate-x-1"
                                    >
                                        View Details <ChevronRight className="h-4 w-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Show More/Less Button */}
                    {filteredCompanies.length > 8 && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={toggleShowAllCompanies}
                                className="text-sky-500 flex items-center transition-all duration-300 hover:text-blue-600 hover:translate-x-1"
                            >
                                {showAllCompanies ? (
                                    <>
                                        Show Less <ChevronUp className="h-4 w-4 ml-1" />
                                    </>
                                ) : (
                                    <>
                                        Show More Companies <ChevronDown className="h-4 w-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* No Results Message */}
                    {filteredCompanies.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No companies found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}