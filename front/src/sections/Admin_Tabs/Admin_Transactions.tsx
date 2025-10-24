import { useEffect, useState, useRef } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import MyFloatingDock from "../Styles/MyFloatingDock"
import {
  Check,
  ChevronDown,
  CreditCard,
  Info,
  Loader2,
  Clock,
  ArrowRight,
  RefreshCw,
  Filter,
  Search,
  PieChart,
  CheckCircle,
  DollarSign,
  Activity,
  TrendingUp,
  CircleDollarSign,
  Printer,
  Mail,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { JSX } from "react/jsx-runtime"
import Footer from "../Styles/Footer"

type ConfirmationStatus = "waiting" | "confirmed"

type ActiveBooking = {
  id: string
  amount: number
  paymentMethod: string
  paymentIcon: JSX.Element
  paymentIconBg: string
  accountNumber: string
  serviceProvider: {
    id: string
    name: string
    avatar: string
    initials: string
    status: ConfirmationStatus
    email?: string
    phone?: string
  }
  customer: {
    id: string
    name: string
    avatar: string
    initials: string
    status: ConfirmationStatus
    email?: string
    phone?: string
  }
  confirmation: boolean
  totalBalance: number
  isReleased: boolean
}

type Transaction = {
  id: string
  account: string
  accountNumber: string
  paymentMethod: string
  icon: JSX.Element
  iconBg: string
  date: string
  status: "pending" | "success" | "canceled"
  amount: number
  provider: {
    name: string
    avatar: string
    initials: string
  }
  recipient: {
    name: string
    avatar: string
    initials: string
  }
}

const generateTransactionPDF = (transactions: any[]) => {
  console.log("[v0] Generating PDF for transactions:", transactions.length)

  const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.text("Transaction History Report", 20, 20)

  // Add date
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)

  const tableData = transactions.map((transaction) => [
    transaction.id,
    transaction.date,
    transaction.type,
    `PHP ${transaction.amount.toFixed(2)}`,
    transaction.status,
    transaction.paymentMethod || "N/A",
    transaction.recipient?.name || transaction.recipient || "N/A",
    transaction.provider?.name || transaction.account || "N/A",
  ])

  console.log("[v0] Table data prepared:", tableData.length, "rows")

  autoTable(doc, {
    head: [["ID", "Date", "Type", "Amount", "Status", "Payment Method", "Recipient", "Provider"]],
    body: tableData,
    startY: 50,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 25 },
    },
  })

  doc.save("transaction-history.pdf")
  console.log("[v0] PDF generated and download initiated")
}

const generateSingleTransactionPDF = (transaction: Transaction) => {
  console.log("[v0] Generating single transaction PDF for:", transaction.id)

  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text("Transaction Receipt", 20, 20)

  doc.setFontSize(12)
  let yPosition = 40

  doc.text(`Transaction ID: ${transaction.id}`, 20, yPosition)
  yPosition += 10
  doc.text(`Provider: ${transaction.provider.name}`, 20, yPosition)
  yPosition += 10
  doc.text(`Payment Method: ${transaction.paymentMethod}`, 20, yPosition)
  yPosition += 10
  doc.text(`Date: ${transaction.date}`, 20, yPosition)
  yPosition += 10
  doc.text(`Status: ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}`, 20, yPosition)
  yPosition += 10
  doc.text(`Recipient: ${transaction.recipient.name}`, 20, yPosition)
  yPosition += 10
  doc.setFontSize(14)
  doc.text(`Amount: PHP ${transaction.amount.toLocaleString()}`, 20, yPosition)

  doc.setFontSize(10)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280)

  doc.save(`transaction-${transaction.id}-${new Date().toISOString().split("T")[0]}.pdf`)
}

function AdminTransactions() {
  const [displayBalance, setDisplayBalance] = useState(0)
  const [actualBalance, setActualBalance] = useState(0)
  const [isBalanceAnimating, setIsBalanceAnimating] = useState(false)
  const [autoReleaseEnabled] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const [currentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("all")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pageVisibilityRef = useRef(true)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [transactionMetrics, setTransactionMetrics] = useState({
    totalBookingsValue: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
  })

  const [activeBookingsPage, setActiveBookingsPage] = useState(1)
  const [transactionHistoryPage, setTransactionHistoryPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [completedTransactions] = useState<Transaction[]>([])

  const ACTIVE_BOOKINGS_PER_PAGE = 2
  const TRANSACTION_HISTORY_PER_PAGE = 6

  const calculatePaymentMethodPercentages = () => {
    if (completedTransactions.length === 0) {
      return {
        "Credit Card": 0,
        "Digital Wallets": 0,
        "Bank Transfer": 0,
        Crypto: 0,
      }
    }

    const methodCounts = {
      "Credit Card": 0,
      "Digital Wallets": 0,
      "Bank Transfer": 0,
      Crypto: 0,
    }

    completedTransactions.forEach((transaction) => {
      const method = transaction.paymentMethod?.toLowerCase() || ""
      if (method.includes("credit") || method.includes("visa") || method.includes("mastercard")) {
        methodCounts["Credit Card"]++
      } else if (method.includes("wallet") || method.includes("gcash") || method.includes("maya")) {
        methodCounts["Digital Wallets"]++
      } else if (method.includes("bank") || method.includes("transfer")) {
        methodCounts["Bank Transfer"]++
      } else if (method.includes("crypto") || method.includes("coins")) {
        methodCounts.Crypto++
      }
    })

    const total = Object.values(methodCounts).reduce((a, b) => a + b, 0)
    const percentages: Record<string, number> = {}

    Object.entries(methodCounts).forEach(([key, count]) => {
      percentages[key] = total > 0 ? Math.round((count / total) * 100) : 0
    })

    return percentages
  }

  const paymentMethodPercentages = calculatePaymentMethodPercentages()

  useEffect(() => {
    const fetchActiveBookings = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:3000/api/bookings/active-with-provider-accepted", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch active bookings")
        }

        const bookingsData = await response.json()

        // Transform API data to match component structure
        const transformedBookings: ActiveBooking[] = bookingsData.map((booking: any) => ({
          id: booking._id,
          amount: booking.total || booking.pricing?.totalRate || 0,
          paymentMethod: booking.paymentMethod || "Unknown",
          paymentIcon: getPaymentIcon(booking.paymentMethod),
          paymentIconBg: "bg-[#0A84FF]",
          accountNumber: "•••• •••• ••••",
          serviceProvider: {
            id: booking.serviceProvider.id,
            name: booking.serviceProvider.name,
            avatar: booking.serviceProvider.avatar,
            initials: booking.serviceProvider.initials,
            status: booking.serviceProvider.status as ConfirmationStatus,
            email: booking.serviceProvider.email,
            phone: booking.serviceProvider.phone,
          },
          customer: {
            id: booking.customer.id,
            name: booking.customer.name,
            avatar: booking.customer.avatar,
            initials: booking.customer.initials,
            status: booking.customer.status as ConfirmationStatus,
            email: booking.customer.email,
            phone: booking.customer.phone,
          },
          confirmation: booking.confirmation,
          totalBalance: booking.totalBalance || booking.total || 0,
          isReleased: booking.serviceComplete || false,
        }))

        setActiveBookings(transformedBookings)

        const totalValue = transformedBookings.reduce((sum, b) => sum + b.amount, 0)
        const totalTrans = transformedBookings.length
        const pendingTrans = transformedBookings.filter((b) => !b.confirmation).length

        setTransactionMetrics((prev) => ({
          ...prev,
          totalBookingsValue: totalValue,
          totalTransactions: totalTrans,
          pendingTransactions: pendingTrans,
        }))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching active bookings:", err)
      } finally {
        setLoading(false)
      }
    }

    const fetchCompletedBookings = async () => {
      console.log("[FRONTEND] Fetching completed bookings...");

      try {
        const response = await fetch("http://localhost:3000/api/bookings/status/completed", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        console.log("[FRONTEND] API Response Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[FRONTEND] Failed response text:", errorText);
          throw new Error("Failed to fetch completed bookings");
        }

        const completedBookingsData = await response.json();
        console.log("[FRONTEND] Raw completed bookings data:", completedBookingsData);

        const transformedTransactions: Transaction[] = completedBookingsData.map((booking: any, index: number) => {
          console.log(`[FRONTEND] Transforming booking #${index + 1}:`, booking._id);

          const formattedDate = new Date(booking.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          // ✅ Get provider and customer names from backend-transformed data
          const providerName = booking.providerName || "Unknown Provider";
          const customerName = booking.customerName || "Unknown Customer";

          // ✅ Provider and customer avatars from populated data
          const providerAvatar = booking.providerDetails?.profilePicture || "/placeholder.svg";
          const customerAvatar = booking.userDetails?.profilePicture || "/placeholder.svg";

          // ✅ Build the transaction object
          return {
            id: booking._id,
            account: providerName,
            accountNumber: "•••• •••• ••••",
            paymentMethod: booking.paymentMethod || "Unknown",
            icon: getPaymentIcon(booking.paymentMethod),
            iconBg: "bg-[#0A84FF]",
            date: formattedDate,
            status: "success" as const,
            amount: booking.pricing?.totalRate || booking.total || 0,
            provider: {
              name: providerName,
              avatar: providerAvatar,
              initials: providerName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase(),
            },
            recipient: {
              name: customerName,
              avatar: customerAvatar,
              initials: customerName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase(),
            },
          };
        });

        console.log("[FRONTEND] Transformed transactions:", transformedTransactions.length);
        console.table(
          transformedTransactions.map((t) => ({
            id: t.id,
            provider: t.provider.name,
            recipient: t.recipient.name,
            payment: t.paymentMethod,
            amount: t.amount,
          }))
        );

        // ✅ Update state
        setTransactions(transformedTransactions);
        setTransactionMetrics((prev) => ({
          ...prev,
          completedTransactions: transformedTransactions.length,
        }));
      } catch (err) {
        console.error("[FRONTEND] Error fetching completed bookings:", err);
      }
    }


    fetchActiveBookings()
    fetchCompletedBookings()
  }, [])

  useEffect(() => {
    setTransactionMetrics((prev) => ({
      ...prev,
      completedTransactions: completedTransactions.length,
    }))
  }, [completedTransactions])

  const getPaymentIcon = (paymentMethod: string) => {
    switch (paymentMethod?.toLowerCase()) {
      case "credit":
      case "visa":
      case "mastercard":
        return <CreditCard className="h-4 w-4 text-white" />
      case "wallet":
      case "gcash":
        return <Wallet className="h-4 w-4 text-white" />
      case "paymongo":
      case "coins.ph":
        return <CircleDollarSign className="h-4 w-4 text-white" />
      default:
        return <CreditCard className="h-4 w-4 text-white" />
    }
  }

  const timeString = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const dateString = currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })

  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (actualBalance !== displayBalance) {
      const difference = actualBalance - displayBalance
      const increment = Math.max(1, Math.floor(difference / 20))

      const timer = setTimeout(() => {
        if (displayBalance + increment >= actualBalance) {
          setDisplayBalance(actualBalance)
        } else {
          setDisplayBalance((prev) => prev + increment)
        }
      }, 30)

      return () => clearTimeout(timer)
    }
  }, [actualBalance, displayBalance])

  useEffect(() => {
    const handleVisibilityChange = () => {
      pageVisibilityRef.current = document.visibilityState === "visible"

      if (pageVisibilityRef.current && !timerActive) {
        const hasUnreleasedBooking = activeBookings.some(
          (booking) =>
            booking.serviceProvider.status === "confirmed" &&
            booking.customer.status === "confirmed" &&
            !booking.isReleased,
        )

        if (hasUnreleasedBooking) {
          setTimerActive(true)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [activeBookings, timerActive])

  useEffect(() => {
    if (timerActive && timeRemaining > 0 && pageVisibilityRef.current) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    } else if (timerActive && timeRemaining === 0) {
      const bookingToRelease = activeBookings.find(
        (booking) =>
          booking.serviceProvider.status === "confirmed" &&
          booking.customer.status === "confirmed" &&
          !booking.isReleased,
      )

      if (bookingToRelease) {
        setActiveBookings((prev) => prev.map((b) => (b.id === bookingToRelease.id ? { ...b, isReleased: true } : b)))

        const today = new Date()
        const formattedDate = `${today.toLocaleString("default", { month: "short" })} ${today.getDate()}, ${today.getFullYear()}`

        const newTransaction: Transaction = {
          id: String(transactions.length + 1),
          account: bookingToRelease.serviceProvider.name,
          accountNumber: bookingToRelease.accountNumber,
          paymentMethod: bookingToRelease.paymentMethod,
          icon: bookingToRelease.paymentIcon,
          iconBg: bookingToRelease.paymentIconBg,
          date: formattedDate,
          status: "success",
          amount: bookingToRelease.amount,
          provider: {
            name: bookingToRelease.serviceProvider.name,
            avatar: bookingToRelease.serviceProvider.avatar,
            initials: bookingToRelease.serviceProvider.initials,
          },
          recipient: {
            name: bookingToRelease.customer.name,
            avatar: bookingToRelease.customer.avatar,
            initials: bookingToRelease.customer.initials,
          },
        }

        setTransactions((prev) => [newTransaction, ...prev])
      }

      setTimerActive(false)
      setTimeRemaining(30)
    }
  }, [timerActive, timeRemaining, activeBookings, transactions])

  useEffect(() => {
    const hasNewlyConfirmedBooking = activeBookings.some(
      (booking) =>
        booking.serviceProvider.status === "confirmed" &&
        booking.customer.status === "confirmed" &&
        !booking.isReleased &&
        !timerActive &&
        pageVisibilityRef.current,
    )

    if (hasNewlyConfirmedBooking && autoReleaseEnabled) {
      setTimerActive(true)
      setTimeRemaining(30)
    }
  }, [activeBookings, timerActive, autoReleaseEnabled])

  const isReleaseEnabled = (booking: ActiveBooking) => {
    return booking.confirmation === true && !booking.isReleased
  }

  const handleReleasePayment = async (bookingId: string) => {
    const booking = activeBookings.find((b) => b.id === bookingId)
    if (!booking || !isReleaseEnabled(booking)) return

    try {
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/release-payment`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          serviceComplete: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to release payment")
      }

      setTimerActive(false)
      setTimeRemaining(30)
      setIsBalanceAnimating(true)

      setActiveBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, isReleased: true } : b)))
      setActualBalance((prev) => prev + booking.amount)

      setTimeout(() => {
        setIsBalanceAnimating(false)
      }, 2000)

      const today = new Date()
      const formattedDate = `${today.toLocaleString("default", { month: "short" })} ${today.getDate()}, ${today.getFullYear()}`

      const newTransaction: Transaction = {
        id: String(transactions.length + 1),
        account: booking.serviceProvider.name,
        accountNumber: booking.accountNumber,
        paymentMethod: booking.paymentMethod,
        icon: booking.paymentIcon,
        iconBg: booking.paymentIconBg,
        date: formattedDate,
        status: "success",
        amount: booking.amount,
        provider: {
          name: booking.serviceProvider.name,
          avatar: booking.serviceProvider.avatar,
          initials: booking.serviceProvider.initials,
        },
        recipient: {
          name: booking.customer.name,
          avatar: booking.customer.avatar,
          initials: booking.customer.initials,
        },
      }

      setTransactions((prev) => [newTransaction, ...prev])
    } catch (error) {
      console.error("Error releasing payment:", error)
      alert("Failed to release payment. Please try again.")
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTab = activeTab === "all" || transaction.status === activeTab
    const matchesSearch =
      searchQuery === "" ||
      transaction.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.accountNumber.includes(searchQuery)
    const matchesPaymentMethod = selectedPaymentMethod === "all" || transaction.paymentMethod === selectedPaymentMethod

    return matchesTab && matchesSearch && matchesPaymentMethod
  })

  const paginatedActiveBookings = activeBookings.slice(
    (activeBookingsPage - 1) * ACTIVE_BOOKINGS_PER_PAGE,
    activeBookingsPage * ACTIVE_BOOKINGS_PER_PAGE,
  )
  const totalActiveBookingsPages = Math.ceil(activeBookings.length / ACTIVE_BOOKINGS_PER_PAGE)

  const paginatedTransactionHistory = filteredTransactions.slice(
    (transactionHistoryPage - 1) * TRANSACTION_HISTORY_PER_PAGE,
    transactionHistoryPage * TRANSACTION_HISTORY_PER_PAGE,
  )
  const totalTransactionHistoryPages = Math.ceil(filteredTransactions.length / TRANSACTION_HISTORY_PER_PAGE)

  return (
    <div className="min-h-screen bg-white font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="sticky top-0 z-40 flex">
        <MyFloatingDock />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-700">Transaction Management</h1>
            <p className="text-gray-500 text-sm font-light">Monitor and manage all payment transactions</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="text-2xl font-medium text-[#0A84FF]">{timeString}</div>
            <div className="text-sm text-gray-500 font-light">{dateString}</div>
          </div>
        </div>

        {/* Transaction Overview */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#0A84FF] to-[#5AC8FA] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 text-white">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                <div className="text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-medium">Transaction Overview</h2>
                  <p className="text-white/90 font-light text-sm sm:text-base">
                    Manage platform payments and financial insights
                  </p>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-end gap-2">
                  <Button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0 text-sm sm:text-base">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 - Total Bookings Value */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">Total Bookings Value</span>
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-medium transition-all duration-1000 ${isBalanceAnimating ? "text-[#30D158] scale-110" : ""
                      }`}
                  >
                    ₱{transactionMetrics.totalBookingsValue.toLocaleString()}
                  </div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 flex items-center font-light">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>+15% this month</span>
                  </div>
                </div>

                {/* Card 2 - Total Transactions */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">Transactions</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-medium">{transactionMetrics.totalTransactions}</div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 flex items-center font-light">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>+12% this month</span>
                  </div>
                </div>

                {/* Card 3 - Pending Transactions */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">Pending Transactions</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-medium">{transactionMetrics.pendingTransactions}</div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 flex items-center font-light">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>+2% this month</span>
                  </div>
                </div>

                {/* Card 4 - Completed Transactions */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">Completed Transactions</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-medium">{transactionMetrics.completedTransactions}</div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 flex items-center font-light">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>+18% this month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-3 gap-8 bg-white">
          {/* Active Bookings - Left Side */}
          <div className="lg:col-span-2 bg-white">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-1">Active Bookings</h2>
                    <p className="text-sm text-gray-600">Bookings awaiting confirmation and payment release</p>
                  </div>
                  <Badge className="bg-[#E8F8EF] text-[#30D158] hover:bg-[#E8F8EF] px-3 py-1">
                    {loading ? "Loading..." : `${activeBookings.length} Active`}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading active bookings...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-red-600 mb-2">Error loading bookings</p>
                      <p className="text-sm text-gray-500">{error}</p>
                    </div>
                  </div>
                ) : activeBookings.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-gray-600 mb-2">No active bookings found</p>
                      <p className="text-sm text-gray-500">Active bookings will appear here when available</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {paginatedActiveBookings.map((booking) => (
                      <div key={booking.id} className="bg-[#F2F2F7]/50 rounded-xl p-5 mb-4 last:mb-0">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-200">
                          <div>
                            <div className="text-sm text-gray-500 font-light">Total Payment</div>
                            <div className="text-2xl font-medium text-gray-800">₱{booking.amount.toLocaleString()}</div>
                          </div>

                          <div className="flex items-center mt-3 md:mt-0 gap-3">
                            <div
                              className={`h-10 w-10 ${booking.paymentIconBg} rounded-full flex items-center justify-center`}
                            >
                              {booking.paymentIcon}
                            </div>
                            <div>
                              <div className="font-medium">{booking.paymentMethod}</div>
                              <div className="text-xs text-gray-500 font-light">{booking.accountNumber}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-white rounded-lg border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Overall Confirmation Status</span>
                            {booking.confirmation ? (
                              <Badge className="bg-[#E8F8EF] text-[#30D158] hover:bg-[#E8F8EF]">
                                <Check className="h-3 w-3 mr-1" />
                                Confirmed
                              </Badge>
                            ) : (
                              <Badge className="bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#F2F2F7]">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          {/* Service Provider */}
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-sm font-medium text-gray-500">Service Provider</div>
                              {booking.serviceProvider.status === "waiting" ? (
                                <Badge className="bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#F2F2F7]">Waiting</Badge>
                              ) : (
                                <Badge className="bg-[#E8F8EF] text-[#30D158] hover:bg-[#E8F8EF]">Confirmed</Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={booking.serviceProvider.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-[#E8F8EF] text-[#30D158]">
                                  {booking.serviceProvider.initials}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="font-medium">{booking.serviceProvider.name}</div>
                                <div className="text-sm text-gray-500 font-light">
                                  {booking.serviceProvider.status === "waiting" ? (
                                    <div className="flex items-center text-gray-500">
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Waiting for confirmation
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-[#30D158]">
                                      <Check className="h-3 w-3 mr-1" />
                                      Confirmed service
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1 text-xs text-gray-500">
                              {booking.serviceProvider.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {booking.serviceProvider.email}
                                </div>
                              )}
                              {booking.serviceProvider.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {booking.serviceProvider.phone}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Customer */}
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-sm font-medium text-gray-500">Customer</div>
                              {booking.customer.status === "waiting" ? (
                                <Badge className="bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#F2F2F7]">Waiting</Badge>
                              ) : (
                                <Badge className="bg-[#E8F8EF] text-[#30D158] hover:bg-[#E8F8EF]">Confirmed</Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={booking.customer.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-[#E9F6FF] text-[#0A84FF]">
                                  {booking.customer.initials}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="font-medium">{booking.customer.name}</div>
                                <div className="text-sm text-gray-500 font-light">
                                  {booking.customer.status === "waiting" ? (
                                    <div className="flex items-center text-gray-500">
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Waiting for confirmation
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-[#30D158]">
                                      <Check className="h-3 w-3 mr-1" />
                                      Confirmed service
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1 text-xs text-gray-500">
                              {booking.customer.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {booking.customer.email}
                                </div>
                              )}
                              {booking.customer.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {booking.customer.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600 mb-4 md:mb-0 text-center md:text-left font-light">
                            {booking.isReleased ? (
                              <div className="flex items-center text-[#30D158]">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Payment has been released successfully.
                              </div>
                            ) : booking.confirmation ? (
                              <div className="flex items-center text-[#0A84FF]">
                                <Info className="h-4 w-4 mr-1" />
                                Both parties have confirmed. You can release the payment now.
                              </div>
                            ) : (
                              <div className="flex items-center text-[#FF453A]">
                                <Clock className="h-4 w-4 mr-1" />
                                Waiting for both parties to confirm before releasing payment.
                              </div>
                            )}
                          </div>

                          <Button
                            className={`${booking.isReleased ? "bg-[#30D158] hover:bg-[#30D158]/90" : "bg-[#0A84FF] hover:bg-[#0A84FF]/90"} text-white px-6`}
                            disabled={!booking.confirmation || booking.isReleased}
                            onClick={() => handleReleasePayment(booking.id)}
                          >
                            {booking.isReleased ? (
                              <div className="flex items-center">Payment Released</div>
                            ) : (
                              <div className="flex items-center">Release Payment</div>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}

                    {totalActiveBookingsPages > 1 && (
                      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                        <div className="text-sm text-gray-500 font-light">
                          Page <span className="font-medium">{activeBookingsPage}</span> of{" "}
                          <span className="font-medium">{totalActiveBookingsPages}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-gray-200 text-gray-700"
                            disabled={activeBookingsPage === 1}
                            onClick={() => setActiveBookingsPage((prev) => Math.max(1, prev - 1))}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-gray-200 text-gray-700"
                            disabled={activeBookingsPage === totalActiveBookingsPages}
                            onClick={() =>
                              setActiveBookingsPage((prev) => Math.min(totalActiveBookingsPages, prev + 1))
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Analytics - Right Side */}
          <div>
            <div className="space-y-6">
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#F2F2F7] to-[#F2F2F7] p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Transaction Search</h3>
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-9 bg-[#F2F2F7] border-0"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setTransactionHistoryPage(1)
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full bg-[#F2F2F7] border-0">
                        <SelectValue placeholder="Time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="bg-[#F2F2F7] border-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#E9F6FF] to-[#F2EBFF] p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Payment Methods</h3>
                    <PieChart className="h-4 w-4 text-[#0A84FF]" />
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-36 h-36">
                      <div className="absolute inset-0 rounded-full bg-[#F2F2F7]"></div>
                      <div
                        className="absolute inset-0 rounded-full bg-[#0A84FF]"
                        style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)" }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full bg-[#5E5CE6]"
                        style={{ clipPath: "polygon(50% 50%, 100% 0%, 100% 24%, 50% 24%)" }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full bg-[#30D158]"
                        style={{ clipPath: "polygon(50% 50%, 100% 24%, 100% 32%, 50% 32%)" }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full bg-[#FF9500]"
                        style={{ clipPath: "polygon(50% 50%, 100% 32%, 100% 36%, 50% 36%)" }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                          <CreditCard className="h-10 w-10 text-[#0A84FF]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { color: "bg-[#0A84FF]", label: "Credit Card", value: "credit" },
                      { color: "bg-[#5E5CE6]", label: "Digital Wallets", value: "wallet" },
                      { color: "bg-[#30D158]", label: "Bank Transfer", value: "bank" },
                      { color: "bg-[#FF9500]", label: "Crypto", value: "crypto" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => {
                          setSelectedPaymentMethod(selectedPaymentMethod === method.value ? "all" : method.value)
                          setTransactionHistoryPage(1)
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${selectedPaymentMethod === method.value ? "bg-[#F2F2F7]" : "hover:bg-[#F2F2F7]/50"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${method.color}`}></div>
                          <span className="text-sm text-gray-700 font-light">{method.label}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {paymentMethodPercentages[method.label] || 0}%
                          {selectedPaymentMethod === method.value ? " ✓" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">Transaction History</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("[v0] Print All clicked, filtered transactions:", filteredTransactions.length)
                    generateTransactionPDF(filteredTransactions)
                  }}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print All
                </Button>
                <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-[#F2F2F7]">
                    <TabsTrigger value="all" className="text-xs data-[state=active]:bg-white">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-white">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="success" className="text-xs data-[state=active]:bg-white">
                      Success
                    </TabsTrigger>
                    <TabsTrigger value="canceled" className="text-xs data-[state=active]:bg-white">
                      Canceled
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs data-[state=active]:bg-white">
                      Completed
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F2F2F7] border-b text-xs text-gray-500">
                  <th className="text-left py-3 px-4 font-medium">PROVIDER</th>
                  <th className="text-left py-3 px-4 font-medium">PAYMENT METHOD</th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center">
                      DATE <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center">
                      STATUS <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">RECIPIENT</th>
                  <th className="text-right py-3 px-4 font-medium">AMOUNT</th>
                  <th className="text-center py-3 px-4 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactionHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No completed transactions found
                    </td>
                  </tr>
                ) : (
                  paginatedTransactionHistory.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-[#F2F2F7]/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={transaction.provider.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-[#E8F8EF] text-[#30D158]">
                              {transaction.provider.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-light">{transaction.provider.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-light">{transaction.paymentMethod}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 font-light">{transaction.date}</td>
                      <td className="py-3 px-4">
                        {transaction.status === "pending" && (
                          <Badge className="bg-[#FFF8E6] text-[#FF9500] hover:bg-[#FFF8E6]">Pending</Badge>
                        )}
                        {transaction.status === "success" && (
                          <Badge className="bg-[#E8F8EF] text-[#30D158] hover:bg-[#E8F8EF]">Success</Badge>
                        )}
                        {transaction.status === "canceled" && (
                          <Badge className="bg-[#FFE5E7] text-[#FF453A] hover:bg-[#FFE5E7]">Canceled</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={transaction.recipient.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-[#E9F6FF] text-[#0A84FF]">
                              {transaction.recipient.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-light">{transaction.recipient.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium">₱{transaction.amount.toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            console.log("[v0] Print single transaction clicked:", transaction.id)
                            generateSingleTransactionPDF(transaction)
                          }}
                        >
                          <Printer className="h-4 w-4 text-gray-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500 font-light">
              Showing <span className="font-medium">{paginatedTransactionHistory.length}</span> of{" "}
              <span className="font-medium">{transactions.length}</span> completed transactions
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-gray-200 text-gray-700"
                disabled={transactionHistoryPage === 1}
                onClick={() => setTransactionHistoryPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-gray-200 text-gray-700"
                disabled={transactionHistoryPage === totalTransactionHistoryPages}
                onClick={() => setTransactionHistoryPage((prev) => Math.min(totalTransactionHistoryPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AdminTransactions