import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { Droplet, Wrench, Zap, Brush, Star, AlignLeft, BadgeAlert } from "lucide-react"
import type { ApexOptions } from "apexcharts"
import ReactApexChart from "react-apexcharts"
import MyFloatingDock from "./Styles/MyFloatingDock"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Footer from "./Styles/Footer"
import { Button } from "@headlessui/react"
interface AnalyticsData {
  totalBookings: number
  completedBookings: number
  activeBookings: number
  pendingBookings: number
  totalRevenue: number
  averageTransactionValue: number
  newTransactionsThisMonth: number
  completionRate: number
  positiveFeedbackPercentage: number
  averageRating: number
  totalUsers: number
  totalServices: number
  monthlyBookings: number[]
  servicePerformance: Array<{ _id: string; count: number; totalRevenue: number }>
  serviceCategories: Record<string, number>
  customerFeedback: Array<{ type: string; customer: string; time: string; rating: number; icon?: ReactNode }>
  allServices: Array<{ name: string; category: string; createdBy: string }>
}

function Admin() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const FEEDBACKS_PER_PAGE = 4
  const [feedbackPage, setFeedbackPage] = useState(1)

  // Get current time for greeting and user data
  const currentHour = new Date().getHours()
  let greeting = "Good Morning"
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good Afternoon"
  } else if (currentHour >= 18) {
    greeting = "Good Evening"
  }

  // State for user data
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    middleName: "",
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        console.log(`[FRONTEND] Starting analytics fetch...`)
        console.log(`[FRONTEND] Token available:`, !!token)

        const response = await fetch("http://localhost:3000/api/admin/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log(`[FRONTEND] Response status:`, response.status)
        console.log(`[FRONTEND] Response ok:`, response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.log(`[FRONTEND] Error response body:`, errorText)
          throw new Error(`Failed to fetch analytics - Status: ${response.status}`)
        }

        const data = await response.json()
        console.log(`[FRONTEND] Analytics data received:`, data)
        console.log(`[FRONTEND] Analytics object:`, data.analytics)

        setAnalyticsData(data.analytics)
        setError(null)
      } catch (err) {
        console.error(`[FRONTEND] Error fetching analytics:`, err)
        console.error(`[FRONTEND] Error message:`, err instanceof Error ? err.message : String(err))
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Fetch user data on component mount
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      setUserData(parsedUser)
    }
  }, [])

  // Format user's full name
  const fullName =
    userData.lastname && userData.firstname
      ? `${userData.lastname}, ${userData.firstname}${userData.middleName ? ` ${userData.middleName}.` : ""}`
      : "Admin"

  // State for tab management
  const [activeTab, setActiveTab] = useState(0)

  // Service categories
  const serviceCategories = [
    { icon: <AlignLeft className="h-5 w-5" />, label: "Overview", active: true },
    { icon: <BadgeAlert className="h-5 w-5" />, label: "TBA", active: false },
    { icon: <BadgeAlert className="h-5 w-5" />, label: "TBA", active: false },
    { icon: <BadgeAlert className="h-5 w-5" />, label: "TBA", active: false },
  ]

  const salesChartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 200,
      toolbar: {
        show: false,
      },
      fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#0A84FF",
            opacity: 0.8,
          },
          {
            offset: 100,
            color: "#0A84FF",
            opacity: 0.2,
          },
        ],
      },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "10px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "10px",
        },
      },
    },
    grid: {
      borderColor: "rgba(203, 213, 225, 0.5)",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    colors: ["#0A84FF"],
    tooltip: {
      theme: "light",
    },
  }

  const salesChartSeries = [
    {
      name: "Bookings",
      data: analyticsData?.monthlyBookings || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ]

  const serviceChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 200,
      toolbar: {
        show: false,
      },
      fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: analyticsData?.servicePerformance?.slice(0, 5).map((s) => s._id) || [
        "Plumbing",
        "Repair",
        "Electrical",
        "Cleaning",
        "Painting",
      ],
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "10px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "10px",
        },
      },
    },
    grid: {
      borderColor: "rgba(203, 213, 225, 0.5)",
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    colors: ["#0A84FF"],
    tooltip: {
      theme: "light",
    },
  }

  const serviceChartSeries = [
    {
      name: "Services Completed",
      data: analyticsData?.servicePerformance?.slice(0, 5).map((s) => s.count) || [89, 65, 72, 53, 42],
    },
  ]

  const customerFeedback = analyticsData?.customerFeedback || [
    {
      type: "Plumbing Service",
      customer: "John Smith",
      time: "2 hours ago",
      rating: 5,
      icon: <Droplet className="h-5 w-5 text-white" />,
    },
    {
      type: "Electrical Repair",
      customer: "Sarah Johnson",
      time: "5 hours ago",
      rating: 4,
      icon: <Zap className="h-5 w-5 text-white" />,
    },
    {
      type: "House Cleaning",
      customer: "Michael Brown",
      time: "1 day ago",
      rating: 5,
      icon: <Brush className="h-5 w-5 text-white" />,
    },
    {
      type: "Appliance Repair",
      customer: "Emily Davis",
      time: "2 days ago",
      rating: 4,
      icon: <Wrench className="h-5 w-5 text-white" />,
    },
  ]

  const allServices = analyticsData?.allServices || [
    {
      name: "Plumbing Installation",
      category: "Plumbing",
      createdBy: "John Doe",
    },
    {
      name: "Electrical Wiring",
      category: "Electrical",
      createdBy: "Jane Smith",
    },
    {
      name: "Aircon Cleaning",
      category: "Cleaning",
      createdBy: "Mark Johnson",
    },
    {
      name: "Roof Repair",
      category: "Repair",
      createdBy: "Sarah Lee",
    },
  ]

  const totalFeedbackPages = Math.ceil(customerFeedback.length / FEEDBACKS_PER_PAGE)
  const paginatedFeedback = customerFeedback.slice(
    (feedbackPage - 1) * FEEDBACKS_PER_PAGE,
    feedbackPage * FEEDBACKS_PER_PAGE
  )

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A84FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-white font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0A84FF] text-white rounded-lg hover:bg-[#0A6FCC]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Floating Dock */}
      <div className="sticky z-40 flex">
        <MyFloatingDock />
      </div>

      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Dashboard */}
        <div className="overflow-hidden max-w-7xl mx-auto">
          {/* Header - Animation removed */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A84FF]/90 to-[#3dbbec] shadow-lg mb-7">
            {/* Background blur patterns */}
            <div className="absolute top-[-50%] left-[-20%] w-[70%] h-[200%] bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-50%] right-[-20%] w-[70%] h-[200%] bg-white/20 rounded-full blur-3xl"></div>

            {/* Content container with backdrop filter */}
            <div className="relative backdrop-blur-[2px] p-8">
              {/* Header top section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 w-full">
                {/* Greeting and subtitle */}
                <div className="text-center md:text-left w-full md:w-auto">
                  <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
                    {greeting} {fullName}
                  </h1>
                  <p className="text-white/80 font-light mt-1 mb-[-5px] text-sm sm:text-base tracking-wide">
                    Good to see you again! Here's what's happening across your platform today.
                  </p>
                </div>
              </div>

              {/* Service Categories Navigation */}
              <div className="mt-8">
                <div className="flex overflow-x-auto pb-2 gap-2 md:gap-3 scrollbar-hide">
                  {serviceCategories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`group flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 ${activeTab === index ? "bg-white shadow-md" : "bg-white/10 hover:bg-white/20"
                        }`}
                    >
                      <div
                        className={`${activeTab === index ? "text-[#0A84FF]" : "text-white group-hover:scale-110"
                          } transition-all duration-300`}
                      >
                        {category.icon}
                      </div>
                      <span
                        className={`ml-2 font-medium text-sm ${activeTab === index ? "text-[#0A84FF]" : "text-white"}`}
                      >
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Booking Trends */}
            <Card className="border-none rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Booking Trends</h3>
                <div className="h-[200px]">
                  <ReactApexChart options={salesChartOptions} series={salesChartSeries} type="area" height="100%" />
                </div>
              </CardContent>
            </Card>

            {/* Transactions Between Provider and Customer */}
            <Card className="border-none rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Transactions Between Provider and Customer</h3>

                {/* Transaction Summary */}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 text-sm font-light">
                    Completed: {analyticsData?.completionRate || 0}%
                  </span>
                  <span className="text-gray-700 text-sm font-light">
                    Pending: {100 - (analyticsData?.completionRate || 0)}%
                  </span>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-1.5 bg-[#F2F2F7] rounded-full flex-grow">
                    <div
                      className="h-full bg-[#0A84FF] rounded-full"
                      style={{ width: `${analyticsData?.completionRate || 0}%` }}
                    ></div>
                  </div>
                  <div className="h-1.5 bg-[#F2F2F7] rounded-full w-1/3"></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mb-4 font-light">
                  <span>{analyticsData?.completedBookings || 0} completed</span>
                  <span>{analyticsData?.totalBookings || 0} total</span>
                </div>
                <div className="text-xs text-gray-500 mb-4 font-light">This Month</div>

                {/* Transaction Stats */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xl font-medium text-gray-800">
                      ₱{(analyticsData?.totalRevenue || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center font-light">
                      Total Payments
                      <span className="text-[#30D158] ml-1">↑</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-gray-800">
                      {analyticsData?.newTransactionsThisMonth || 0}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center font-light">
                      New Transactions
                      <span className="text-[#30D158] ml-1">↑</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-gray-800">
                      {analyticsData?.positiveFeedbackPercentage || 0}%
                    </div>
                    <div className="text-xs text-gray-500 flex items-center font-light">
                      Positive Feedback
                      <span className="text-[#30D158] ml-1">↑</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Performance */}
            <Card className="border-none rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-800">Service Performance</h3>
                  <Tabs defaultValue="week" className="w-auto">
                    <TabsList className="bg-[#F2F2F7]">
                      <TabsTrigger value="week" className="text-xs data-[state=active]:bg-white">
                        Week
                      </TabsTrigger>
                      <TabsTrigger value="month" className="text-xs data-[state=active]:bg-white">
                        Month
                      </TabsTrigger>
                      <TabsTrigger value="year" className="text-xs data-[state=active]:bg-white">
                        Year
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="h-[200px]">
                  <ReactApexChart options={serviceChartOptions} series={serviceChartSeries} type="bar" height="100%" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* All Services Created */}
            <Card className="border-none rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <h3 className="text-lg font-medium mb-4 text-gray-800">All Services Created</h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-500 text-xs font-light">
                      <th className="text-left pb-2">Service Name</th>
                      <th className="text-left pb-2">Category</th>
                      <th className="text-left pb-2">Created By</th>
                      <th className="text-left pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allServices.map((service, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="py-3 text-sm font-light">{service.name}</td>
                        <td className="py-3 text-sm font-light">{service.category}</td>
                        <td className="py-3 text-sm font-light">{service.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Customer Feedback */}
            <Card className="border-none rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Customer Feedback</h3>
                </div>
                <div className="space-y-4">
                  {paginatedFeedback.map((feedback, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="rounded-full bg-[#0A84FF] p-2 mt-1">
                        {feedback.icon || <Droplet className="h-5 w-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-800">{feedback.type}</h4>
                        <p className="text-xs text-gray-500 font-light">Customer: {feedback.customer}</p>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < feedback.rating ? "text-[#FF9500] fill-[#FF9500]" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 font-light">{feedback.time}</div>
                    </div>
                  ))}
                  {totalFeedbackPages > 1 && (
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-xs text-gray-500 font-light">
                        Showing{" "}
                        <span className="font-medium">{paginatedFeedback.length}</span>{" "}
                        of{" "}
                        <span className="font-medium">{customerFeedback.length}</span>{" "}
                        feedbacks
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          className="bg-white border-gray-200 text-gray-700 text-[13px]"
                          disabled={feedbackPage === 1}
                          onClick={() => setFeedbackPage((prev) => Math.max(1, prev - 1))}
                        >
                          Previous
                        </Button>

                        <div className="text-gray-400">
                          |
                        </div>

                        <span className="text-xs text-gray-600 font-light">
                          Page {feedbackPage} of {totalFeedbackPages}
                        </span>

                        <div className="text-gray-400">
                          |
                        </div>

                        <Button
                          className="bg-white border-gray-200 text-gray-700 text-[13px]"
                          disabled={feedbackPage === totalFeedbackPages}
                          onClick={() => setFeedbackPage((prev) => Math.min(totalFeedbackPages, prev + 1))}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Analytics */}
            <Card className="border-none rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Service Analytics</h3>
                  <span className="text-xs text-gray-500 font-light">This Month</span>
                </div>
                <div className="flex justify-center">
                  <div className="relative w-40 h-40">
                    {/* Circular progress chart */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-[#F2F2F7] flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center">
                          <span className="text-2xl font-medium text-gray-800">
                            {analyticsData?.totalServices || 0}
                          </span>
                          <span className="text-xs text-gray-500 font-light">Services</span>
                        </div>
                      </div>
                      {/* Overlay colored segments */}
                      <div className="absolute top-0 right-0 w-16 h-16 rounded-tr-full bg-[#0A84FF]"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 rounded-br-full bg-[#5AC8FA]"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {Object.entries(analyticsData?.serviceCategories || {})
                    .slice(0, 4)
                    .map(([category, count], index) => {
                      const colors = ["#0A84FF", "#5AC8FA", "#64D2FF", "#8E8E93"]
                      const total = Object.values(analyticsData?.serviceCategories || {}).reduce(
                        (a, b) => (a as number) + (b as number),
                        0,
                      )
                      const percentage = total > 0 ? Math.round(((count as number) / (total as number)) * 100) : 0

                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index] }}></div>
                            <span className="text-sm text-gray-700 font-light">{category}</span>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Admin