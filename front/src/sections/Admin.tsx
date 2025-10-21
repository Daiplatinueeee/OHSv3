import { useState, useEffect } from "react"
import {
  Users,
  Droplet,
  Wrench,
  Zap,
  Brush,
  Star,
  AlignLeft,
  BadgeAlert,
  Plus,
  Check,
  X,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  UserPlus,
  CheckCircle,
  Clock3,
  Repeat,
  UserRound,
  Mail,
  UserCog,
  LogIn,
} from "lucide-react"
import type { ApexOptions } from "apexcharts"
import ReactApexChart from "react-apexcharts"
import MyFloatingDock from "./Styles/MyFloatingDock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Footer from "./Styles/Footer"

interface TodoItem {
  id: number
  text: string
  completed: boolean
  priority: "low" | "medium" | "high"
}

interface Account {
  id: string
  name: string
  email: string
  status: "Active" | "Inactive" | "Pending"
  role: "Admin" | "User" | "Editor"
  lastLogin: string
}

function Admin() {
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

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Todo state
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: 1, text: "Review pending service requests", completed: false, priority: "high" },
    { id: 2, text: "Update customer feedback responses", completed: true, priority: "medium" },
    { id: 3, text: "Schedule team meeting", completed: false, priority: "medium" },
    { id: 4, text: "Analyze monthly performance", completed: false, priority: "low" },
  ])
  const [newTodo, setNewTodo] = useState("")

  // Sample Accounts Data
  const accounts: Account[] = [
    {
      id: "ACC001",
      name: "Alice Johnson",
      email: "alice@example.com",
      status: "Active",
      role: "Admin",
      lastLogin: "2024-07-20",
    },
    {
      id: "ACC002",
      name: "Bob Williams",
      email: "bob@example.com",
      status: "Active",
      role: "User",
      lastLogin: "2024-07-19",
    },
    {
      id: "ACC003",
      name: "Charlie Brown",
      email: "charlie@example.com",
      status: "Inactive",
      role: "User",
      lastLogin: "2024-07-10",
    },
    {
      id: "ACC004",
      name: "Diana Prince",
      email: "diana@example.com",
      status: "Pending",
      role: "Editor",
      lastLogin: "N/A",
    },
    {
      id: "ACC005",
      name: "Eve Adams",
      email: "eve@example.com",
      status: "Active",
      role: "Admin",
      lastLogin: "2024-07-21",
    },
  ]

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

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    )
  }

  // Todo functions
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: newTodo.trim(),
          completed: false,
          priority: "medium",
        },
      ])
      setNewTodo("")
    }
  }

  const toggleTodo = (id: number) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Service categories
  const serviceCategories = [
    { icon: <AlignLeft className="h-5 w-5" />, label: "Overview", active: true },
    { icon: <BadgeAlert className="h-5 w-5" />, label: "TBA", active: false },
    { icon: <BadgeAlert className="h-5 w-5" />, label: "TBA", active: false },
    { icon: <BadgeAlert className="h-5 w-5" />, label: "TBA", active: false },
  ]

  // Sales chart options
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
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
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
      data: [45, 52, 38, 65, 73, 80],
    },
  ]

  // Service performance chart options
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
      categories: ["Plumbing", "Repair", "Electrical", "Cleaning", "Painting"],
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
      data: [89, 65, 72, 53, 42],
    },
  ]

  // Recent service requests data
  const recentRequests = [
    { id: "SR-6514", service: "Plumbing", location: "Downtown", status: "Pending" },
    { id: "SR-5248", service: "Electrical", location: "Westside", status: "Completed" },
    { id: "SR-6548", service: "Cleaning", location: "Northside", status: "In Progress" },
    { id: "SR-7591", service: "Repair", location: "Eastside", status: "Completed" },
  ]

  // Customer feedback data
  const customerFeedback = [
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

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Floating Dock */}
      <div className="sticky z-40 flex">
        <MyFloatingDock />
      </div>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Dashboard */}
          <div className="overflow-hidden max-w-6xl mx-auto">
            {/* Header - Animation removed */}
            <div className="relative overflow-hidden rounded-2xl border boder-1 border-gray-300/90 bg-transparnt mb-7">
              {/* Background blur patterns */}
              <div className="absolute top-[-50%] left-[-20%] w-[70%] h-[200%] bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-50%] right-[-20%] w-[70%] h-[200%] bg-white/20 rounded-full blur-3xl"></div>

              {/* Content container with backdrop filter */}
              <div className="relative backdrop-blur-[2px] p-8">
                {/* Header top section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
                  <div>
                    <h1 className="text-3xl font-medium text-gray-700 tracking-tight">
                      {greeting} {fullName}
                    </h1>
                    <p className="text-gray-600 font-light mt-1 text-sm tracking-wide">
                      Your service business at a glance
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
                        className={`group flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 ${activeTab === index ? "bg-white border-1 border-[#0A84FF]" : "bg-white/10 hover:bg-white/20"
                          }`}
                      >
                        <div
                          className={`${activeTab === index ? "text-[#0A84FF]" : "text-white group-hover:scale-110"} transition-all duration-300`}
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

            {/* New Analytics Containers Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* New Customers */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[18px] font-extralight text-gray-700">New Customers</h3>
                    <UserPlus className="h-5 w-5 text-[#5E5CE6]" />
                  </div>
                  <div className="text-[30px] font-extralight text-gray-700 mb-2">325,972</div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-[#30D158] mr-1" />
                    <span className="text-[#30D158] font-medium">15%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Service Completion Rate */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[18px] font-extralight text-gray-700">Revenue</h3>
                    <CheckCircle className="h-5 w-5 text-[#30D158]" />
                  </div>
                  <div className="text-[30px] font-extralight text-gray-700 mb-2">₱ 92.7M</div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-[#30D158] mr-1" />
                    <span className="text-[#30D158] font-medium">3%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Average Service Time */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[18px] font-extralight text-gray-700">Services</h3>
                    <Clock3 className="h-5 w-5 text-[#FF9F0A]" />
                  </div>
                  <div className="text-[30px] font-extralight text-gray-700 mb-2">421</div>
                  <div className="flex items-center text-sm">
                    <TrendingDown className="h-4 w-4 text-[#FF453A] mr-1" />
                    <span className="text-[#FF453A] font-medium">5%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Retention */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[18px] font-extralight text-gray-700">Pending</h3>
                    <Repeat className="h-5 w-5 text-[#0A84FF]" />
                  </div>
                  <div className="text-[30px] font-extralight text-gray-700 mb-2">121</div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-[#30D158] mr-1" />
                    <span className="text-[#30D158] font-medium">2%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Booking Trends */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-5">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">Booking Trends</h3>
                  <div className="h-[200px]">
                    <ReactApexChart options={salesChartOptions} series={salesChartSeries} type="area" height="100%" />
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Target */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-5 text-center">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">Monthly Target</h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 text-sm font-light">75.5%</span>
                    <span className="text-gray-700 text-sm font-light">24.5%</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-1.5 bg-[#F2F2F7] rounded-full flex-grow">
                      <div className="h-full bg-[#0A84FF] rounded-full" style={{ width: "75.5%" }}></div>
                    </div>
                    <div className="h-1.5 bg-[#F2F2F7] rounded-full w-1/4"></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mb-4 font-light">
                    <span>320 services</span>
                    <span>425 target</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-4 font-light">This Month</div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-xl font-medium text-gray-800">$8.2k</div>
                      <div className="text-xs text-gray-500 flex items-center font-light justify-center">
                        Revenue
                        <span className="text-[#30D158] ml-1">↑</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-medium text-gray-800">128</div>
                      <div className="text-xs text-gray-500 flex items-center font-light justify-center">
                        New Bookings
                        <span className="text-[#30D158] ml-1">↑</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-medium text-gray-800">96%</div>
                      <div className="text-xs text-gray-500 flex items-center font-light justify-center">
                        Satisfaction
                        <span className="text-[#30D158] ml-1">↑</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 mt-10 mb-[-1rem]">
                    <Button variant="outline" className="text-sm w-full sm:w-auto">
                      Reset
                    </Button>
                    <Button className="bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-sm w-full sm:w-auto">Update</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Service Performance */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
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
                    <ReactApexChart
                      options={serviceChartOptions}
                      series={serviceChartSeries}
                      type="bar"
                      height="100%"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recent Service Requests */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-5">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Recent Service Requests</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-500 text-xs font-light">
                        <th className="text-left pb-2">Request ID</th>
                        <th className="text-left pb-2">Service</th>
                        <th className="text-left pb-2">Location</th>
                        <th className="text-left pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((request, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="py-3 text-sm font-medium">{request.id}</td>
                          <td className="py-3 text-sm font-light">{request.service}</td>
                          <td className="py-3 text-sm font-light">{request.location}</td>
                          <td className="py-3 text-sm">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-light ${request.status === "Pending"
                                  ? "bg-[#FFF8E6] text-[#FF9500]"
                                  : request.status === "In Progress"
                                    ? "bg-[#E9F6FF] text-[#0A84FF]"
                                    : "bg-[#E8F8EF] text-[#30D158]"
                                }`}
                            >
                              {request.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Customer Feedback */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Customer Feedback</h3>
                    <span className="text-xs text-[#0A84FF] font-medium">View all</span>
                  </div>
                  <div className="space-y-4">
                    {customerFeedback.map((feedback, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="rounded-full bg-[#0A84FF] p-2 mt-1">{feedback.icon}</div>
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
                  </div>
                </CardContent>
              </Card>

              {/* Service Analytics */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
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
                            <span className="text-2xl font-medium text-gray-800">320</span>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#0A84FF] mr-2"></div>
                        <span className="text-sm text-gray-700 font-light">Plumbing</span>
                      </div>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#5AC8FA] mr-2"></div>
                        <span className="text-sm text-gray-700 font-light">Electrical</span>
                      </div>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#64D2FF] mr-2"></div>
                        <span className="text-sm text-gray-700 font-light">Cleaning</span>
                      </div>
                      <span className="text-sm font-medium">24%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#8E8E93] mr-2"></div>
                        <span className="text-sm text-gray-700 font-light">Others</span>
                      </div>
                      <span className="text-sm font-medium">16%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* All Accounts Table */}
            <Card className="border-none rounded-2xl shadow-sm overflow-hidden mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0A84FF]" />
                  All Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="text-gray-500 text-xs font-light border-b border-gray-100">
                        <th className="text-left py-2 px-4">Account Name</th>
                        <th className="text-left py-2 px-4">Email</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Role</th>
                        <th className="text-left py-2 px-4">Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => (
                        <tr key={account.id} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-gray-500" />
                              {account.name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {account.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-light ${account.status === "Active"
                                  ? "bg-[#E8F8EF] text-[#30D158]"
                                  : account.status === "Inactive"
                                    ? "bg-[#F2F2F7] text-gray-500"
                                    : "bg-[#FFF8E6] text-[#FF9500]"
                                }`}
                            >
                              {account.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <UserCog className="h-4 w-4 text-gray-400" />
                              {account.role}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <LogIn className="h-4 w-4 text-gray-400" />
                              {account.lastLogin}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Right Sidebar with Calendar and Todo */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6 space-y-6 overflow-y-auto h-screen sticky top-0">
          {/* Calendar */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#0A84FF]" />
                  Calendar
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-800">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-8"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`h-8 w-8 text-sm rounded-md transition-colors ${isToday(day)
                          ? "bg-[#0A84FF] text-white font-medium"
                          : isSelected(day)
                            ? "bg-[#0A84FF]/10 text-[#0A84FF] font-medium"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Todo List */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0A84FF]" />
                To-Do List
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Add new todo */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  className="flex-1 text-sm h-9"
                />
                <Button onClick={addTodo} size="icon" className="bg-[#0A84FF] hover:bg-[#0A84FF]/90 h-9 w-9">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Todo items */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 -mr-1">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${todo.completed
                        ? "bg-gray-50 border-gray-200 opacity-70"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}
                      >
                        {todo.text}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}
                      >
                        {todo.priority}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Todo stats */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{todos.filter((t) => !t.completed).length} pending</span>
                  <span>{todos.filter((t) => t.completed).length} completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Footer />
    </div>
  )
}

export default Admin