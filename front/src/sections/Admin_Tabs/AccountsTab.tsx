import { useState, useEffect } from "react"
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ChevronDown,
  CheckCircle,
  Shield,
  ChevronRight,
  BarChart3,
  PieChart,
  ArrowRight,
  RefreshCw,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

import AccountReviewer from "../AccountReviewers/COOReviewer"
import CustomerReviewer from "../AccountReviewers/CustomerReviewer"
import EmployeeReviewer from "../AccountReviewers/ProviderReviewer"
import AdminReviewer from "../AccountReviewers/AdminReviewer"
import MyFloatingDock from "../Styles/MyFloatingDock"

import { io } from "socket.io-client"

interface Account {
  id: number
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  lastLogin: string
  avatar: string
  phone: string
  location: string
  rating: number
  paymentMethod: string
  verificationStatus: string
  // New fields for COO document previews
  secRegistrationPreview?: string | null
  businessPermitPreview?: string | null
  birRegistrationPreview?: string | null
  eccCertificatePreview?: string | null
  generalLiabilityPreview?: string | null
  workersCompPreview?: string | null
  professionalIndemnityPreview?: string | null
  propertyDamagePreview?: string | null
  businessInterruptionPreview?: string | null
  bondingInsurancePreview?: string | null
  // New fields for COO anomaly status
  secRegistrationAnomaly?: boolean
  businessPermitAnomaly?: boolean
  birRegistrationAnomaly?: boolean
  eccCertificateAnomaly?: boolean
  generalLiabilityAnomaly?: boolean
  workersCompAnomaly?: boolean
  professionalIndemnityAnomaly?: boolean
  propertyDamageAnomaly?: boolean
  businessInterruptionAnomaly?: boolean
  bondingInsuranceAnomaly?: boolean
  // New fields for Customer accounts
  gender?: string
  bio?: string
  frontIdPreview?: string | null
  backIdPreview?: string | null
  profilePicturePreview?: string | null
  coverPhoto?: string | null // Updated comment - Used by both COO and Customer
  selectedLocation?: {
    name: string
    lat: number
    lng: number
    distance: number
    zipCode?: string
  } | null
  // New fields for Customer document anomaly status
  frontIdAnomaly?: boolean
  backIdAnomaly?: boolean
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const transformBackendUserToAccount = (backendUser: any): Account => {
  const accountTypeToRole = {
    customer: "Customer",
    coo: "COO",
    provider: "Provider",
    admin: "Admin",
  }

  return {
    id: backendUser._id ? Number.parseInt(backendUser._id.slice(-6), 16) : Math.random() * 1000000, // Convert MongoDB _id to number
    name: `${backendUser.firstName || "User"} ${backendUser.lastName || ""}`.trim(),
    email: backendUser.email || "N/A",
    role: accountTypeToRole[backendUser.accountType as keyof typeof accountTypeToRole] || "Customer",
    status: backendUser.isActive ? "Active" : "Pending",
    joinDate: backendUser.createdAt
      ? new Date(backendUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : "N/A",
    lastLogin: "N/A", // Backend doesn't provide this
    avatar: backendUser.profilePicture || "/placeholder.svg?height=40&width=40",
    phone: backendUser.mobileNumber || "N/A",
    location: backendUser.location?.name || "N/A",
    rating: 0, // Backend doesn't provide this
    paymentMethod: "N/A", // Backend doesn't provide this
    verificationStatus: backendUser.isActive ? "Verified" : "Pending",
    // COO document previews
    secRegistrationPreview: backendUser.secRegistration || null,
    businessPermitPreview: backendUser.businessPermit || null,
    birRegistrationPreview: backendUser.birRegistration || null,
    eccCertificatePreview: backendUser.eccCertificate || null,
    generalLiabilityPreview: backendUser.generalLiability || null,
    workersCompPreview: backendUser.workersCompPreview || null,
    professionalIndemnityPreview: backendUser.professionalIndemnityPreview || null,
    propertyDamagePreview: backendUser.propertyDamagePreview || null,
    businessInterruptionPreview: backendUser.businessInterruptionPreview || null,
    bondingInsurancePreview: backendUser.bondingInsurancePreview || null,
    // COO anomaly status - default to false
    secRegistrationAnomaly: false,
    businessPermitAnomaly: false,
    birRegistrationAnomaly: false,
    eccCertificateAnomaly: false,
    generalLiabilityAnomaly: false,
    workersCompAnomaly: false,
    professionalIndemnityAnomaly: false,
    propertyDamageAnomaly: false,
    businessInterruptionAnomaly: false,
    bondingInsuranceAnomaly: false,
    // Customer fields
    gender: backendUser.gender || "prefer-not-to-say",
    bio: backendUser.bio || "",
    frontIdPreview: backendUser.idDocuments?.front || null,
    backIdPreview: backendUser.idDocuments?.back || null,
    profilePicturePreview: backendUser.profilePicture || null,
    coverPhoto: backendUser.coverPhoto || null,
    selectedLocation: backendUser.location || null,
    frontIdAnomaly: false,
    backIdAnomaly: false,
  }
}

function AccountsTab() {
  const [activeTab, setActiveTab] = useState("all")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const [newAccountFirstName, setNewAccountFirstName] = useState("")
  const [newAccountLastName, setNewAccountLastName] = useState("")
  const [newAccountGender, setNewAccountGender] = useState("")
  const [newAccountBusinessName, setNewAccountBusinessName] = useState("")
  const [newAccountFoundedDate, setNewAccountFoundedDate] = useState("")
  const [newAccountTeamSize, setNewAccountTeamSize] = useState("")
  const [newAccountTinNumber, setNewAccountTinNumber] = useState("")

  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [newAccountEmail, setNewAccountEmail] = useState("")
  const [newAccountPassword, setNewAccountPassword] = useState("")
  const [newAccountType, setNewAccountType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, setNewAccountData] = useState<any>(null)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New state for COOReviewer
  const [showAccountReviewer, setShowAccountReviewer] = useState(false)
  const [accountToReview, setAccountToReview] = useState<Account | null>(null)

  // New state for CustomerReviewer
  const [showCustomerReviewer, setShowCustomerReviewer] = useState(false)
  const [customerToReview, setCustomerToReview] = useState<Account | null>(null)

  // New state for ProviderReviewer
  const [showEmployeeReviewer, setShowEmployeeReviewer] = useState(false)
  const [employeeToReview, setEmployeeToReview] = useState<Account | null>(null)

  // New state for AdminReviewer
  const [showAdminReviewer, setShowAdminReviewer] = useState(false)
  const [adminToReview, setAdminToReview] = useState<Account | null>(null)

  const [page, setPage] = useState(1);
  const limit = 7;
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);


  const checkAdminPrivileges = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      return { isAdmin: false, error: "No authentication token found. Please log in." }
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]))
      console.log("[v0] Current user token payload:", tokenPayload)

      if (tokenPayload.accountType !== "admin") {
        return {
          isAdmin: false,
          error: `Current user has '${tokenPayload.accountType}' privileges. Admin privileges required for account management.`,
          userType: tokenPayload.accountType,
        }
      }

      return { isAdmin: true, error: null }
    } catch (tokenError) {
      console.log("[v0] Token validation error:", tokenError)
      return { isAdmin: false, error: "Invalid authentication token. Please log in again." }
    }
  }

  const fetchAccounts = async (forceRefresh = false) => {
    try {
      setIsLoading(true)
      setError(null)

      // Check local storage first (unless force refresh)
      if (!forceRefresh) {
        const cachedAccounts = localStorage.getItem("accounts_data")
        const cacheTimestamp = localStorage.getItem("accounts_cache_timestamp")
        const cacheExpiry = 5 * 60 * 1000 // 5 minutes

        // Use cached data if it's fresh
        if (cachedAccounts && cacheTimestamp) {
          const isExpired = Date.now() - Number.parseInt(cacheTimestamp) > cacheExpiry
          if (!isExpired) {
            setAccounts(JSON.parse(cachedAccounts))
            setIsLoading(false)
            return
          }
        }
      }

      const adminCheck = checkAdminPrivileges()
      if (!adminCheck.isAdmin) {
        setError(adminCheck.error || "Admin privileges required")

        const mockAccounts = [
          {
            _id: "demo1",
            email: "demo@example.com",
            accountType: "customer",
            firstName: "Demo",
            lastName: "User",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ]
        setAccounts(mockAccounts.map(transformBackendUserToAccount))
        toast.warning("Showing demo data - Admin access required for real account management")
        setIsLoading(false)
        return
      }

      // Fetch from API
      const response = await fetch(`http://localhost:3000/api/accounts/users?page=${page}&limit=${limit}`, {

        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setPagination(data.pagination)

      if (!data.users || !Array.isArray(data.users)) {
        throw new Error("Invalid response format: users array not found")
      }

      // Transform MongoDB user data to Account interface
      const transformedAccounts: Account[] = data.users.map((user: any, index: number) => ({
        id: user._id || index + 1,
        name: user.businessName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || `${user.businessName}`,
        email: user.email || "N/A",
        role:
          user.accountType === "customer"
            ? "Customer"
            : user.accountType === "coo"
              ? "COO" // Updated from "Service Provider" to "COO"
              : user.accountType === "provider"
                ? "Provider" // Updated from "Service Provider" to "Provider"
                : user.accountType === "employee"
                  ? "Provider" // Updated from "Employee" to "Provider"
                  : "Admin",
        status:
          user.status === "active"
            ? "Active"
            : user.status === "pending"
              ? "Pending"
              : user.status === "suspended"
                ? "Suspended"
                : "Inactive",
        joinDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          : "N/A",
        lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A",
        avatar: user.profilePicture || "/placeholder.svg?height=40&width=40",
        phone: user.mobileNumber || user.companyNumber || "N/A",
        location: user.location?.name || "N/A",
        rating: user.accountType === "customer" ? Math.random() * 2 + 3 : Math.random() * 1 + 4,
        paymentMethod: user.status === "active" ? "Credit Card" : "N/A",
        verificationStatus: user.isVerified ? "Verified" : "Pending",
        // Customer specific fields
        gender: user.gender || undefined,
        bio: user.bio || undefined,
        frontIdPreview: user.idDocuments?.front || undefined,
        backIdPreview: user.idDocuments?.back || undefined,
        profilePicturePreview: user.profilePicture || undefined,
        coverPhoto: user.coverPhoto || undefined,
        selectedLocation: user.location || undefined,
        // COO specific fields
        secRegistrationPreview: user.secRegistration || undefined,
        businessPermitPreview: user.businessPermit || undefined,
        birRegistrationPreview: user.birRegistration || undefined,
        eccCertificatePreview: user.eccCertificate || undefined,
        generalLiabilityPreview: user.generalLiability || undefined,
        workersCompPreview: user.workersComp || undefined,
        professionalIndemnityPreview: user.professionalIndemnity || undefined,
        propertyDamagePreview: user.propertyDamage || undefined,
        businessInterruptionPreview: user.businessInterruption || undefined,
        bondingInsurancePreview: user.bondingInsurance || undefined,
        // Anomaly flags
        frontIdAnomaly: user.anomalies?.frontId || false,
        backIdAnomaly: user.anomalies?.backId || false,
        secRegistrationAnomaly: user.anomalies?.secRegistration || false,
        businessPermitAnomaly: user.anomalies?.businessPermit || false,
        birRegistrationAnomaly: user.anomalies?.birRegistration || false,
        eccCertificateAnomaly: user.anomalies?.eccCertificate || false,
        generalLiabilityAnomaly: user.anomalies?.generalLiability || false,
        workersCompAnomaly: user.anomalies?.workersCompAnomaly || false,
        professionalIndemnityAnomaly: user.anomalies?.professionalIndemnityAnomaly || false,
        propertyDamageAnomaly: user.anomalies?.propertyDamageAnomaly || false,
        businessInterruptionAnomaly: user.anomalies?.businessInterruptionAnomaly || false,
        bondingInsuranceAnomaly: user.anomalies?.bondingInsuranceAnomaly || false,
      }))

      setAccounts(transformedAccounts)

      // Cache the data
      localStorage.setItem("accounts_data", JSON.stringify(transformedAccounts))
      localStorage.setItem("accounts_cache_timestamp", Date.now().toString())

      toast.success(`Successfully loaded ${transformedAccounts.length} accounts`)
    } catch (error) {
      console.error("[v0] Error fetching accounts:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch accounts")

      // Try to use cached data as fallback
      const cachedAccounts = localStorage.getItem("accounts_data")
      if (cachedAccounts) {
        setAccounts(JSON.parse(cachedAccounts))
        toast.warning("Using cached data due to network error")
      } else {
        toast.error("Failed to load accounts and no cached data available")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userString = localStorage.getItem("user")
    let userId = null
    let username = "Guest"

    if (userString) {
      try {
        const userData = JSON.parse(userString)
        // Assuming user data might be nested or direct
        userId = userData.user?._id || userData._id || userData.id
        username = userData.user?.firstName || userData.firstName || "User" // Use first name for username
      } catch (e) {
        console.error("Failed to parse user data from localStorage:", e)
      }
    }

    console.log("AccountsTab.tsx: Attempting to connect to Socket.IO with token and user info:", {
      token: token ? "present" : "missing",
      userId,
      username,
    })

    const socket = io("http://localhost:3000", {
      auth: {
        token: token,
        userId: userId, // Pass userId for server-side authentication/identification
        username: username, // Pass username for server-side identification
      },
      transports: ["websocket", "polling"], // Ensure WebSocket is preferred
    })

    socket.on("connect", () => {
      console.log("AccountsTab.tsx: Connected to Socket.IO server for account updates. Socket ID:", socket.id)
      // Initial fetch when the component mounts or reconnects
      fetchAccounts(true)
    })

    socket.on("disconnect", (reason) => {
      console.log("AccountsTab.tsx: Disconnected from Socket.IO server for account updates. Reason:", reason)
    })

    socket.on("connect_error", (err) => {
      console.error("AccountsTab.tsx: Socket.IO connection error:", err.message)
      if (err.message === "Authentication failed" || err.message === "Authentication token is required") {
        console.error("AccountsTab.tsx: Authentication error with WebSocket.")
      }
    })

    // Listen for account_update event from the backend
    socket.on("account_update", (data) => {
      console.log("AccountsTab.tsx: Received account_update via WebSocket:", data)
      // When an update is received, re-fetch all accounts
      fetchAccounts(true) // Force refresh to get latest data
    })

    // Clean up the socket connection when the component unmounts
    return () => {
      console.log("AccountsTab.tsx: Disconnecting Socket.IO client.")
      socket.disconnect()
    }
  }, [])

  const refreshAccounts = () => {
    fetchAccounts(true) // Force refresh
  }

  useEffect(() => {
    fetchAccounts(true)
  }, [page])

  // Animation keyframes
  const keyframes = `
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
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Format current time
  const timeString = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const dateString = currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })

  // Account statistics (now dynamic)
  const totalAccounts = accounts.length
  const activeUsers = accounts.filter((acc) => acc.status === "Active").length
  const newThisMonth = accounts.filter((acc) => {
    const joinDate = new Date(acc.joinDate)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear
  }).length
  const conversionRate = totalAccounts > 0 ? Math.round((activeUsers / totalAccounts) * 100) : 0

  const accountStats = {
    totalAccounts,
    activeUsers,
    newThisMonth,
    conversionRate,
  }

  // Account distribution data (now dynamic)
  const customerCount = accounts.filter((acc) => acc.role === "Customer").length
  const cooCount = accounts.filter((acc) => acc.role === "COO").length // Updated from serviceProviderCount to cooCount
  const providerCount = accounts.filter((acc) => acc.role === "Provider").length // Added providerCount
  const adminCount = accounts.filter((acc) => acc.role === "Admin").length

  const accountDistribution = [
    {
      role: "Customers",
      percentage: totalAccounts > 0 ? Math.round((customerCount / totalAccounts) * 100) : 0,
      count: customerCount,
    },
    {
      role: "COOs", // Updated from "Service Providers" to "COOs"
      percentage: totalAccounts > 0 ? Math.round((cooCount / totalAccounts) * 100) : 0,
      count: cooCount,
    },
    {
      role: "Providers", // Updated from "Employees" to "Providers"
      percentage: totalAccounts > 0 ? Math.round((providerCount / totalAccounts) * 100) : 0,
      count: providerCount,
    },
    {
      role: "Administrators",
      percentage: totalAccounts > 0 ? Math.round((adminCount / totalAccounts) * 100) : 0,
      count: adminCount,
    },
  ]

  // Account status data (now dynamic)
  const activeCount = accounts.filter((acc) => acc.status === "Active").length
  const inactiveCount = accounts.filter((acc) => acc.status === "Inactive").length
  const pendingCount = accounts.filter((acc) => acc.status === "Pending").length
  const suspendedCount = accounts.filter((acc) => acc.status === "Suspended").length

  const accountStatus = [
    {
      status: "Active",
      count: activeCount,
      percentage: totalAccounts > 0 ? Math.round((activeCount / totalAccounts) * 100) : 0,
    },
    {
      status: "Inactive",
      count: inactiveCount,
      percentage: totalAccounts > 0 ? Math.round((inactiveCount / totalAccounts) * 100) : 0,
    },
    {
      status: "Pending",
      count: pendingCount,
      percentage: totalAccounts > 0 ? Math.round((pendingCount / totalAccounts) * 100) : 0,
    },
    {
      status: "Suspended",
      count: suspendedCount,
      percentage: totalAccounts > 0 ? Math.round((suspendedCount / totalAccounts) * 100) : 0,
    },
  ]

  // Filter accounts based on active tab
  const filteredAccounts = accounts.filter((account) => {
    if (activeTab === "all") return true
    if (activeTab === "customers") return account.role === "Customer"
    if (activeTab === "providers") return account.role === "Provider" // Updated from checking "Service Provider" to "Provider"
    if (activeTab === "coos") return account.role === "COO" // Added COO filter
    if (activeTab === "admins") return account.role === "Admin"
    if (activeTab === "inactive") return account.status === "Inactive"
    if (activeTab === "pending") return account.status === "Pending"
    return true
  })

  // Status badge renderer
  const renderStatusBadge = (status: any) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-[#E8F8EF] text-[#30D158] hover:bg-[#E8F8EF]">{status}</Badge>
      case "Inactive":
        return <Badge className="bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#F2F2F7]">{status}</Badge>
      case "Pending":
        return <Badge className="bg-[#FFF8E6] text-[#FF9500] hover:bg-[#FFF8E6]">{status}</Badge>
      case "Suspended":
        return <Badge className="bg-[#FFE5E7] text-[#FF453A] hover:bg-[#FFE5E7]">{status}</Badge>
      default:
        return <Badge className="bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#F2F2F7]">{status}</Badge>
    }
  }

  // Role badge renderer
  const renderRoleBadge = (role: any) => {
    switch (role) {
      case "Customer":
        return <Badge className="bg-[#E9F6FF] text-[#0A84FF] hover:bg-[#E9F6FF]">{role}</Badge>
      case "COO": // Updated from "Service Provider" to "COO"
        return <Badge className="bg-[#F2EBFF] text-[#5E5CE6] hover:bg-[#F2EBFF]">{role}</Badge>
      case "Provider": // Updated from "Employee" to "Provider"
        return <Badge className="bg-[#E6F7FF] text-[#007AFF] hover:bg-[#E6F7FF]">{role}</Badge>
      case "Admin":
        return <Badge className="bg-[#E9F6FF] text-[#5AC8FA] hover:bg-[#E9F6FF]">{role}</Badge>
      default:
        return <Badge className="bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#F2F2F7]">{role}</Badge>
    }
  }

  // Handle account selection for details view
  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account === selectedAccount ? null : account)
  }

  const handleAddAccount = async () => {
    if (isLoading) return

    try {
      setIsLoading(true)
      setError("")

      const adminCheck = checkAdminPrivileges()
      if (!adminCheck.isAdmin) {
        throw new Error(adminCheck.error || "Admin privileges required")
      }

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required. Please log in as an admin.")
      }

      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]))
        console.log("[v0] Token payload:", tokenPayload)

        if (tokenPayload.accountType !== "admin" && tokenPayload.accountType !== "coo") {
          throw new Error("Admin privileges required. Current user is not an admin or COO.")
        }
      } catch (tokenError) {
        console.log("[v0] Token validation error:", tokenError)
        throw new Error("Invalid authentication token. Please log in again.")
      }

      // Validation - only email and password are required
      if (!newAccountEmail || !newAccountPassword || !newAccountType) {
        toast.error("Please fill in all required fields (Email, Password, Account Type)")
        return
      }

      setIsSubmitting(true)

      const endpoint =
        newAccountType === "provider" || newAccountType === "admin"
          ? "/api/admin/create-provider-admin"
          : "/api/admin/create-account"

      const requestBody: {
        email: string
        password: string
        accountType: string
        firstName?: string
        lastName?: string
        gender?: string
        minimalMode: boolean
        businessName?: string
        foundedDate?: string
        teamSize?: string
        tinNumber?: string
      } = {
        email: newAccountEmail,
        password: newAccountPassword,
        accountType: newAccountType,
        firstName: newAccountFirstName || undefined,
        lastName: newAccountLastName || undefined,
        gender: newAccountGender || undefined,
        minimalMode: true,
      }

      if (newAccountType === "coo") {
        requestBody.businessName = `${newAccountFirstName || "Business"} ${newAccountLastName || "Name"}`.trim()

        // Only include COO fields if they have actual values (not empty strings)
        if (newAccountFoundedDate) {
          requestBody.foundedDate = newAccountFoundedDate
        }
        if (newAccountTeamSize) {
          requestBody.teamSize = newAccountTeamSize
        }
        if (newAccountTinNumber) {
          requestBody.tinNumber = newAccountTinNumber
        }
      }

      console.log("[v0] Making API call to:", `http://localhost:3000${endpoint}`)
      console.log("[v0] Request body:", requestBody)

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Response status:", response.status)

      let data: any
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const textResponse = await response.text()
        console.log("[v0] Non-JSON response received:", textResponse.substring(0, 200))

        if (!response.ok) {
          throw new Error(
            `Server error (${response.status}): The endpoint ${endpoint} was not found. Please check if the server is running and the endpoint exists.`,
          )
        }

        data = { message: "Account created successfully" }
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        if (contentType && contentType.includes("application/json")) {
          try {
            if (response.status === 403) {
              errorMessage =
                data.message ||
                "Access denied. Admin privileges required. Please ensure you are logged in as an admin user."
            } else {
              errorMessage = data.message || data.error || errorMessage
            }
          } catch (parseError) {
            console.log("[v0] Failed to parse error response as JSON:", parseError)
          }
        } else {
          if (response.status === 403) {
            errorMessage = "Access denied. Admin privileges required. Please ensure you are logged in as an admin user."
          }
        }

        throw new Error(errorMessage)
      }

      console.log("[v0] Account creation successful:", data)

      let newAccountRole: string
      if (data.user) {
        const newAccount = transformBackendUserToAccount(data.user)
        setAccounts((prevAccounts) => [...prevAccounts, newAccount])
        setNewAccountData(newAccount)
        newAccountRole = newAccount.role
      } else {
        // Fallback if backend doesn't return user data
        const newId = Math.max(...accounts.map((a) => a.id)) + 1
        newAccountRole =
          newAccountType === "coo"
            ? "COO"
            : newAccountType === "provider"
              ? "Provider"
              : newAccountType === "admin"
                ? "Admin"
                : "Customer"

        const newAccountStatus = newAccountType === "admin" || newAccountType === "provider" ? "Active" : "Pending"

        const newAccountContact = "" // Define newAccountContact here

        const newAccount: Account = {
          id: newId,
          name: `${newAccountFirstName || "User"} ${newAccountLastName || ""}`.trim(),
          email: newAccountEmail,
          role: newAccountRole,
          status: newAccountStatus,
          joinDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          lastLogin: "Just now",
          avatar: "/placeholder.svg?height=40&width=40",
          phone: newAccountContact || "N/A",
          location: "N/A",
          rating: 0,
          paymentMethod: "N/A",
          verificationStatus: newAccountStatus === "Active" ? "Verified" : "Pending",
          secRegistrationPreview: null,
          businessPermitPreview: null,
          birRegistrationPreview: null,
          eccCertificatePreview: null,
          generalLiabilityPreview: null,
          workersCompPreview: null,
          professionalIndemnityPreview: null,
          propertyDamagePreview: null,
          businessInterruptionPreview: null,
          bondingInsurancePreview: null,
          coverPhoto: null,
          secRegistrationAnomaly: false,
          businessPermitAnomaly: false,
          birRegistrationAnomaly: false,
          eccCertificateAnomaly: false,
          generalLiabilityAnomaly: false,
          workersCompAnomaly: false,
          professionalIndemnityAnomaly: false,
          propertyDamageAnomaly: false,
          businessInterruptionAnomaly: false,
          bondingInsuranceAnomaly: false,
          frontIdPreview: null,
          backIdPreview: null,
          profilePicturePreview: null,
          selectedLocation: null,
          gender: "prefer-not-to-say",
          bio: "",
          frontIdAnomaly: false,
          backIdAnomaly: false,
        }

        setAccounts((prevAccounts) => [...prevAccounts, newAccount])
        setNewAccountData(newAccount)
      }

      setIsAddAccountModalOpen(false)
      setIsSuccessModalOpen(true)

      // Reset form
      setNewAccountEmail("")
      setNewAccountPassword("")
      setNewAccountType("")
      setNewAccountFirstName("")
      setNewAccountLastName("")
      setNewAccountGender("")
      setNewAccountBusinessName("")
      setNewAccountFoundedDate("")
      setNewAccountTeamSize("")
      setNewAccountTinNumber("")

      toast(
        <div>
          <div className="font-semibold">Account created successfully</div>
          <div className="text-sm text-gray-600">New {newAccountRole} account has been created.</div>
        </div>,
        { className: "bg-green-50 text-green-700 border-green-200", duration: 4000 },
      )
    } catch (error) {
      console.log("[v0] Error creating account:", error)
      if (error instanceof Error) {
        if (error.message.includes("Admin privileges required") || error.message.includes("Access denied")) {
          setError(
            `${error.message} Please contact your system administrator if you believe you should have admin access.`,
          )
        } else {
          setError(error.message)
        }
      } else {
        setError("An unexpected error occurred while creating the account.")
      }
    } finally {
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }

  // Function to handle opening the appropriate reviewer
  const handleViewFullDetails = (account: Account) => {
    if (account.role === "COO") {
      setAccountToReview(account)
      setShowAccountReviewer(true)
      setShowCustomerReviewer(false)
      setShowEmployeeReviewer(false)
      setShowAdminReviewer(false)
    } else if (account.role === "Customer") {
      setCustomerToReview(account)
      setShowCustomerReviewer(true)
      setShowAccountReviewer(false)
      setShowEmployeeReviewer(false)
      setShowAdminReviewer(false)
    } else if (account.role === "Provider") {
      setEmployeeToReview(account)
      setShowEmployeeReviewer(true)
      setShowAccountReviewer(false)
      setShowCustomerReviewer(false)
      setShowAdminReviewer(false)
    } else if (account.role === "Admin") {
      setAdminToReview(account)
      setShowAdminReviewer(true)
      setShowAccountReviewer(false)
      setShowCustomerReviewer(false)
      setShowEmployeeReviewer(false)
    } else {
      // For other roles, just close the details panel if open
      setSelectedAccount(null)
      toast(
        <div>
          <div className="font-semibold">Details not available</div>
          <div className="text-sm text-gray-600">
            Full details view is only available for COOs, Customers, Providers, and Admins.
          </div>
        </div>,
        { className: "bg-blue-50 text-blue-700 border-blue-200", duration: 3000 },
      )
    }
  }

  // Function to update account status from any reviewer
  const handleAccountAction = (
    accountId: number | string, // Updated to accept both number and string for MongoDB ObjectId compatibility
    newStatus: string,
    newVerificationStatus: string,
    updatedAnomalies: { [key: string]: boolean },
    declineReasons?: string[],
    declineMessage?: string,
  ) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) =>
        acc.id === accountId
          ? {
            ...acc,
            status: newStatus,
            verificationStatus: newVerificationStatus,
            ...updatedAnomalies, // Apply updated anomaly states
          }
          : acc,
      ),
    )
    setShowAccountReviewer(false) // Close all reviewers after action
    setShowCustomerReviewer(false)
    setShowEmployeeReviewer(false)
    setShowAdminReviewer(false) // Added close for AdminReviewer

    if (newStatus === "Declined") {
      toast(
        <div>
          <div className="font-semibold">Application Declined</div>
          <div className="text-sm text-gray-600">
            Account {accountId} has been declined. Reasons: {declineReasons?.join(", ")}. Message: "{declineMessage}"
          </div>
        </div>,
        { className: "bg-red-50 text-red-700 border-red-200", duration: 5000 },
      )
    } else {
      toast(
        <div>
          <div className="font-semibold">Account Updated</div>
          <div className="text-sm text-gray-600">
            Account {accountId} status changed to {newStatus}.
          </div>
        </div>,
        { className: "bg-green-50 text-green-700 border-green-200", duration: 3000 },
      )
    }
  }

  if (showAccountReviewer && accountToReview) {
    return (
      <AccountReviewer
        account={accountToReview}
        onClose={() => setShowAccountReviewer(false)}
        onAccountAction={handleAccountAction}
      />
    )
  }

  if (showCustomerReviewer && customerToReview) {
    return (
      <CustomerReviewer
        account={customerToReview}
        onClose={() => setShowCustomerReviewer(false)}
        onAccountAction={handleAccountAction}
      />
    )
  }

  if (showEmployeeReviewer && employeeToReview) {
    return (
      <EmployeeReviewer
        account={employeeToReview}
        onClose={() => setShowEmployeeReviewer(false)}
        onAccountAction={handleAccountAction}
      />
    )
  }

  if (showAdminReviewer && adminToReview) {
    return (
      <AdminReviewer
        account={adminToReview}
        onClose={() => setShowAdminReviewer(false)}
        onAccountAction={handleAccountAction}
      />
    )
  }

  return (
    <div className="space-y-6">
      <style>{keyframes}</style>
      {/* Header */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Access Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              {error.includes("Admin privileges required") && (
                <p className="text-red-500 text-xs mt-2">
                  💡 Tip: Make sure you're logged in with an admin account to manage user accounts.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="p-6 space-y-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      )}


      {isLoading && (
        <div className="space-y-4 p-6">
          {/* Simulate 7 skeleton cards (same count as visible accounts) */}
          {[...Array(7)].map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-[#F2F2F7]/50 p-4 rounded-xl animate-pulse"
            >
              {/* Avatar placeholder */}
              <Skeleton className="h-12 w-12 rounded-full" />

              {/* Info section */}
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
            {/* Header with Time and Date */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
              {/* Left Section - Title and Description */}
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Accounts Management
                </h1>
                <p className="text-gray-500 text-sm sm:text-base font-light">
                  View and manage all user accounts in your system
                </p>
              </div>

              {/* Right Section - Time and Date */}
              <div className="flex flex-col items-center sm:items-end">
                <div className="text-xl sm:text-2xl font-semibold text-[#0A84FF]">
                  {timeString}
                </div>
                <div className="text-sm sm:text-base text-gray-500 font-light">
                  {dateString}
                </div>
              </div>
            </div>


            {/* Account Overview */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-[#0A84FF] to-[#5AC8FA] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 text-white">
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="text-center md:text-left w-full md:w-auto">
                      <h2 className="text-lg sm:text-xl font-semibold">Account Overview</h2>
                      <p className="text-white/90 text-sm sm:text-base font-light">
                        Manage and monitor all registered accounts
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <Button
                        className="flex justify-center bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0 text-sm sm:text-base"
                        onClick={refreshAccounts}
                      >
                        <RefreshCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Refresh
                      </Button>
                      <Button
                        className="flex justify-center bg-white text-[#0A84FF] hover:bg-white/90 border-0 text-sm sm:text-base"
                        onClick={() => setIsAddAccountModalOpen(true)}
                      >
                        <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Add Account
                      </Button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Accounts */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 rounded-full p-2 sm:p-3">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <span className="text-sm sm:text-base font-medium">Total Accounts</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold">{accountStats.totalAccounts}</div>
                      <div className="text-white/90 text-xs sm:text-sm mt-1 flex items-center font-light">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        <span>+12% increase</span>
                      </div>
                    </div>

                    {/* Active Users */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 rounded-full p-2 sm:p-3">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <span className="text-sm sm:text-base font-medium">Active Users</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold">{accountStats.activeUsers}</div>
                      <div className="text-white/90 text-xs sm:text-sm mt-1 flex items-center font-light">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        <span>+8% increase</span>
                      </div>
                    </div>

                    {/* New This Month */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 rounded-full p-2 sm:p-3">
                          <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <span className="text-sm sm:text-base font-medium">New This Month</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold">{accountStats.newThisMonth}</div>
                      <div className="text-white/90 text-xs sm:text-sm mt-1 flex items-center font-light">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        <span>+24% increase</span>
                      </div>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 rounded-full p-2 sm:p-3">
                          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <span className="text-sm sm:text-base font-medium">Conversion Rate</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold">
                        {accountStats.conversionRate}%
                      </div>
                      <div className="text-white/90 text-xs sm:text-sm mt-1 flex items-center font-light">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        <span>+5% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Main Content - Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Accounts List - Left Side */}
              <div className="lg:col-span-2 overflow-auto max-h-[95rem]">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        Registered Accounts
                      </h2>

                      {/* Search, Filter & Role Select */}
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search accounts..."
                            className="pl-9 bg-[#F2F2F7] border-0 w-full"
                          />
                        </div>

                        {/* Select Dropdown */}
                        <Select defaultValue="all">
                          <SelectTrigger className="w-full sm:w-[180px] bg-[#F2F2F7] border-0 font-medium text-gray-700">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="customer">Customers</SelectItem>
                            <SelectItem value="provider">Service Providers</SelectItem>
                            <SelectItem value="admin">Administrators</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Filter Button */}
                        <Button
                          variant="outline"
                          className="bg-[#F2F2F7] border-0 text-gray-700 flex items-center justify-center"
                        >
                          <Filter className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="p-4 sm:p-6">
                    <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                      <TabsList className="bg-[#F2F2F7] mb-4 flex flex-wrap justify-start sm:justify-between overflow-auto rounded-lg">
                        <TabsTrigger value="all" className="text-xs sm:text-sm data-[state=active]:bg-white">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="coos" className="text-xs sm:text-sm data-[state=active]:bg-white">
                          COOs
                        </TabsTrigger>
                        <TabsTrigger value="customers" className="text-xs sm:text-sm data-[state=active]:bg-white">
                          Customers
                        </TabsTrigger>
                        <TabsTrigger value="providers" className="text-xs sm:text-sm data-[state=active]:bg-white">
                          Providers
                        </TabsTrigger>
                        <TabsTrigger value="admins" className="text-xs sm:text-sm data-[state=active]:bg-white">
                          Admins
                        </TabsTrigger>
                        <TabsTrigger value="inactive" className="text-xs sm:text-sm data-[state=active]:bg-white">
                          Inactive
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="text-xs sm:text-sm data-[state=active]:bg-white">
                          Pending
                        </TabsTrigger>
                      </TabsList>

                      {/* Accounts */}
                      <div className="space-y-3">
                        {filteredAccounts.slice(0, 7).map((account) => (
                          <div
                            key={account.id}
                            className={`bg-[#F2F2F7]/50 rounded-xl p-4 hover:bg-[#F2F2F7] transition-colors cursor-pointer ${selectedAccount?.id === account.id ? "ring-1 ring-[#0A84FF]" : ""
                              }`}
                            onClick={() => handleAccountSelect(account)}
                          >
                            {/* Account Card */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              {/* Avatar and Info */}
                              <div className="flex items-start gap-4 w-full">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                  <AvatarImage
                                    src={account.avatar || "/placeholder.svg"}
                                    alt={account.name}
                                  />
                                  <AvatarFallback className="bg-[#E9F6FF] text-[#0A84FF]">
                                    {account.name.charAt(0)}
                                    {account.name.split(" ")[1]?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h3 className="font-medium text-gray-800 truncate">
                                      {account.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {renderStatusBadge(account.status)}
                                      {renderRoleBadge(account.role)}
                                    </div>
                                  </div>

                                  <div className="text-sm text-gray-500 mt-1 font-light break-all">
                                    {account.email}
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-3 text-xs text-gray-600 font-light">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-gray-400" />
                                      <span>Joined: {account.joinDate}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-gray-400" />
                                      <span>Last login: {account.lastLogin}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Account Details */}
                            {selectedAccount?.id === account.id && (
                              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm text-gray-700">
                                    Contact Information
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-light">
                                      <Mail className="h-4 w-4 text-[#0A84FF]" />
                                      <span>{account.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-light">
                                      <Phone className="h-4 w-4 text-[#0A84FF]" />
                                      <span>{account.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-light">
                                      <MapPin className="h-4 w-4 text-[#0A84FF]" />
                                      <span>{account.location}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm text-gray-700">
                                    Account Details
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-[#0A84FF]" />
                                      <span className="font-light">Verification</span>
                                    </div>
                                    <span
                                      className={`font-medium ${account.verificationStatus === "Verified"
                                        ? "text-[#30D158]"
                                        : "text-[#FF9500]"
                                        }`}
                                    >
                                      {account.verificationStatus}
                                    </span>
                                  </div>
                                </div>

                                <div className="md:col-span-2 flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[#0A84FF] border-[#0A84FF]/20 hover:bg-[#E9F6FF] bg-transparent"
                                    onClick={() => handleViewFullDetails(account)}
                                  >
                                    View Full Details
                                    <ChevronRight className="ml-1 h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                    </Tabs>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-sm text-gray-500 font-light text-center sm:text-left">
                      Showing <span className="font-medium">{filteredAccounts.length}</span> of{" "}
                      <span className="font-medium">{accounts.length}</span> accounts
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={!pagination?.hasPrevPage}
                        className="px-4 py-2 bg-gray-200 rounded-full disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={!pagination?.hasNextPage}
                        className="px-4 py-2 bg-gray-200 disabled:opacity-50 rounded-full"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>


              {/* Account Analytics - Right Side */}
              <div>
                <div className="space-y-6">
                  {/* Account Distribution */}
                  <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-[#E9F6FF] to-[#F2EBFF] p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-700">Account Distribution</h3>
                        <PieChart className="h-4 w-4 text-[#0A84FF]" />
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-center mb-6">
                        <div className="relative w-36 h-36">
                          {/* Circular chart - simplified for display */}
                          <div className="absolute inset-0 rounded-full bg-[#F2F2F7]"></div>
                          {/* These clipPath styles are illustrative and would need dynamic calculation for accuracy */}
                          <div
                            className="absolute inset-0 rounded-full bg-[#0A84FF]"
                            style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)" }}
                          ></div>
                          <div
                            className="absolute inset-0 rounded-full bg-[#5E5CE6]"
                            style={{ clipPath: "polygon(50% 50%, 100% 0%, 100% 24%,  bg-[#5E5CE6]" }}
                          ></div>
                          <div
                            className="absolute inset-0 rounded-full bg-[#5AC8FA]"
                            style={{ clipPath: "polygon(50% 50%, 100% 24%, 100% 32%, 50% 32%)" }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                              <Users className="h-10 w-10 text-[#0A84FF]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {accountDistribution.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${index === 0
                                    ? "bg-[#0A84FF]"
                                    : index === 1
                                      ? "bg-[#5E5CE6]"
                                      : index === 2
                                        ? "bg-[#5AC8FA]"
                                        : "bg-[#007AFF]" // New color for Employees
                                    }`}
                                ></div>
                                <span className="text-sm font-medium">{item.role}</span>
                              </div>
                              <div className="text-sm font-medium">{item.count}</div>
                            </div>
                            <div className="h-1.5 bg-[#F2F2F7] rounded-full">
                              <div
                                className={`h-full rounded-full ${index === 0
                                  ? "bg-[#0A84FF]"
                                  : index === 1
                                    ? "bg-[#5E5CE6]"
                                    : index === 2
                                      ? "bg-[#5AC8FA]"
                                      : "bg-[#007AFF]" // New color for Employees
                                  }`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Status */}
                  <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-[#E8F8EF] to-[#E9F6FF] p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-700">Account Status</h3>
                        <BarChart3 className="h-4 w-4 text-[#30D158]" />
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {accountStatus.map((status, index) => (
                          <div key={index} className="bg-[#F2F2F7] rounded-xl p-3">
                            <div className="text-xs text-gray-500 font-light">{status.status}</div>
                            <div className="text-lg font-medium text-gray-800">{status.count}</div>
                            <div
                              className={`text-xs ${status.status === "Active"
                                ? "text-[#30D158]"
                                : status.status === "Inactive"
                                  ? "text-[#8E8E93]"
                                  : status.status === "Pending"
                                    ? "text-[#FF9500]"
                                    : "text-[#FF453A]"
                                }`}
                            >
                              {status.percentage}%
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {accountStatus.map((status, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${status.status === "Active"
                                    ? "bg-[#30D158]"
                                    : status.status === "Inactive"
                                      ? "bg-[#8E8E93]"
                                      : status.status === "Pending"
                                        ? "bg-[#FF9500]"
                                        : "bg-[#FF453A]"
                                    }`}
                                ></div>
                                <span className="text-sm font-medium">{status.status}</span>
                              </div>
                              <div className="text-sm font-medium">{status.percentage}%</div>
                            </div>
                            <div className="h-1.5 bg-[#F2F2F7] rounded-full">
                              <div
                                className={`h-full rounded-full ${status.status === "Active"
                                  ? "bg-[#30D158]"
                                  : status.status === "Inactive"
                                    ? "bg-[#8E8E93]"
                                    : status.status === "Pending"
                                      ? "bg-[#FF9500]"
                                      : "bg-[#FF453A]"
                                  }`}
                                style={{ width: `${status.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Add Account Modal */}
            <Dialog open={isAddAccountModalOpen} onOpenChange={setIsAddAccountModalOpen}>
              <DialogContent className="w-[95%] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-lg bg-white backdrop-blur-xl p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left side - Form */}
                  <div className="p-6">
                    <DialogTitle className="text-xl mb-1">Add New Account</DialogTitle>
                    <DialogDescription className="mb-6">
                      Create a new user account with the specified role.
                    </DialogDescription>

                    <div className="grid gap-4 animate-slideInUp overflow-y-auto max-h-[calc(90vh-200px)]">
                      {/* First Name */}
                      <div className="grid gap-2">
                        <Label htmlFor="firstName" className="text-gray-700">
                          First Name <span className="text-gray-400 text-sm">(Optional)</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={newAccountFirstName}
                          onChange={(e) => setNewAccountFirstName(e.target.value)}
                          className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200"
                          placeholder="Enter first name (optional)"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="grid gap-2">
                        <Label htmlFor="lastName" className="text-gray-700">
                          Last Name <span className="text-gray-400 text-sm">(Optional)</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={newAccountLastName}
                          onChange={(e) => setNewAccountLastName(e.target.value)}
                          className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200"
                          placeholder="Enter last name (optional)"
                        />
                      </div>

                      {/* Email */}
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          value={newAccountEmail}
                          onChange={(e) => setNewAccountEmail(e.target.value)}
                          className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200"
                          placeholder="Enter email address"
                        />
                      </div>

                      {/* Password */}
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-gray-700">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={newAccountPassword}
                          onChange={(e) => setNewAccountPassword(e.target.value)}
                          className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200"
                          placeholder="Enter password"
                        />
                      </div>

                      {/* Account Type & Gender */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type" className="text-gray-700">
                            Account Type <span className="text-red-500">*</span>
                          </Label>
                          <Select value={newAccountType} onValueChange={setNewAccountType}>
                            <SelectTrigger className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200">
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="coo">COO</SelectItem>
                              <SelectItem value="provider">Provider</SelectItem>
                              <SelectItem value="customer">Customer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="gender" className="text-gray-700">
                            Gender <span className="text-gray-400 text-sm">(Optional)</span>
                          </Label>
                          <Select value={newAccountGender} onValueChange={setNewAccountGender}>
                            <SelectTrigger className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {newAccountType === "coo" && (
                        <>
                          <div className="border-t border-gray-200 pt-4 mt-2">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Business Information</h3>
                          </div>

                          {/* Business Name */}
                          <div className="grid gap-2">
                            <Label htmlFor="businessName" className="text-gray-700">
                              Business Name <span className="text-gray-400 text-sm">(Optional)</span>
                            </Label>
                            <Input
                              id="businessName"
                              value={newAccountBusinessName}
                              onChange={(e) => setNewAccountBusinessName(e.target.value)}
                              className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200"
                              placeholder="Enter business name"
                            />
                          </div>

                          {/* Founded Date */}
                          <div className="grid gap-2">
                            <Label htmlFor="foundedDate" className="text-gray-700">
                              Founded Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="foundedDate"
                              type="date"
                              value={newAccountFoundedDate}
                              onChange={(e) => setNewAccountFoundedDate(e.target.value)}
                              className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200"
                            />
                          </div>

                          {/* Team Size */}
                          <div className="grid gap-2">
                            <Label htmlFor="teamSize" className="text-gray-700">
                              Team Size <span className="text-red-500">*</span>
                            </Label>
                            <Select value={newAccountTeamSize} onValueChange={setNewAccountTeamSize}>
                              <SelectTrigger className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200">
                                <SelectValue placeholder="Select team size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                <SelectItem value="51-100">51-100 employees</SelectItem>
                                <SelectItem value="101-500">101-500 employees</SelectItem>
                                <SelectItem value="500+">500+ employees</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* TIN Number */}
                          <div className="grid gap-2">
                            <Label htmlFor="tinNumber" className="text-gray-700">
                              TIN Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="tinNumber"
                              value={newAccountTinNumber}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, "")
                                if (value.length > 9) value = value.slice(0, 9)
                                if (value.length >= 6) {
                                  value = value.slice(0, 3) + "-" + value.slice(3, 6) + "-" + value.slice(6)
                                } else if (value.length >= 3) {
                                  value = value.slice(0, 3) + "-" + value.slice(3)
                                }
                                setNewAccountTinNumber(value)
                              }}
                              className="bg-gray-100 border-gray-200 focus:ring-2 focus:ring-[#0A84FF] transition-all duration-200"
                              placeholder="XXX-XXX-XXX"
                              maxLength={11}
                            />
                            <p className="text-xs text-gray-500">Format: XXX-XXX-XXX (e.g., 123-456-789)</p>
                          </div>
                        </>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddAccountModalOpen(false)}
                          className="w-full sm:w-auto rounded-full"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          onClick={handleAddAccount}
                          disabled={isSubmitting}
                          className="w-full sm:w-auto rounded-full"
                        >
                          {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Information and preview */}
                  <div className="bg-gradient-to-br from-[#0A84FF]/10 to-[#5AC8FA]/10 p-6 border-t md:border-t-0 md:border-l border-gray-100">
                    <div className="h-full flex flex-col">
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-2 text-center md:text-left">
                          Account Information
                        </h3>
                        <p className="text-sm text-gray-600 text-center md:text-left">
                          Create a new user account to provide access to the system. Different account types have
                          different permissions. <span className="text-red-500">*</span> indicates required fields.
                        </p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Account Types</h4>
                        <div className="space-y-3">
                          {[
                            {
                              icon: Shield,
                              color: "#0A84FF",
                              bg: "#E9F6FF",
                              title: "Admin",
                              desc: "Full system access and management capabilities",
                            },
                            {
                              icon: Users,
                              color: "#5E5CE6",
                              bg: "#F2EBFF",
                              title: "COO",
                              desc: "Can manage services and respond to customer requests",
                            },
                            {
                              icon: User,
                              color: "#007AFF",
                              bg: "#E6F7FF",
                              title: "Provider",
                              desc: "Internal staff with specific operational roles",
                            },
                            {
                              icon: User,
                              color: "#30D158",
                              bg: "#E8F8EF",
                              title: "Customer",
                              desc: "Can browse services and make requests",
                            },
                          ].map(({ icon: Icon, color, bg, title, desc }, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className={`mt-0.5 p-1.5 rounded-full`} style={{ backgroundColor: bg }}>
                                <Icon className="h-3.5 w-3.5" style={{ color }} />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700">{title}</div>
                                <div className="text-xs text-gray-500">{desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>


            {/* Success Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
              <DialogContent className="max-w-sm rounded-2xl border-none shadow-lg overflow-hidden p-0 bg-white/90 backdrop-blur-xl">
                <div className="p-6">
                  <DialogTitle className="text-xl mb-1">Account Created</DialogTitle>
                  <DialogDescription className="mb-6">The new account has been successfully created.</DialogDescription>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsSuccessModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </main>

          {/* Include animation keyframes */}
          <div className="sticky z-40 flex">
            <MyFloatingDock />
          </div>
        </>
      )}
    </div>
  )
}

export default AccountsTab