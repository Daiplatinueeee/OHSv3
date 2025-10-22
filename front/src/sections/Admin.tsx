import { useState, useEffect } from "react"
import { Home, Users, DollarSign, Clock, Droplet, Wrench, Zap, Brush, Star, AlignLeft, BadgeAlert } from "lucide-react"
import type { ApexOptions } from "apexcharts"
import ReactApexChart from "react-apexcharts"
import MyFloatingDock from "./Styles/MyFloatingDock"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Footer from "./Styles/Footer"

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

  // Metrics data with improved formatting
  const metrics = [
    {
      icon: <Home className="h-4 w-4 text-[#0A84FF]" />,
      label: "Services",
      value: "421",
      trend: "+8%",
      trendUp: true,
    },
    {
      icon: <DollarSign className="h-4 w-4 text-[#30D158]" />,
      label: "Revenue",
      value: "$8.2k",
      trend: "+12%",
      trendUp: true,
    },
    {
      icon: <Users className="h-4 w-4 text-[#5E5CE6]" />,
      label: "Customers",
      value: "325",
      trend: "+5%",
      trendUp: true,
    },
    {
      icon: <Clock className="h-4 w-4 text-[#FF9F0A]" />,
      label: "Pending",
      value: "18",
      trend: "-2%",
      trendUp: false,
    },
  ]

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

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
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
                  <p className="text-white/80 font-light mt-1 text-sm sm:text-base tracking-wide">
                    Your service business at a glance
                  </p>
                </div>

                {/* Metrics cards */}
                <div className="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
                  {metrics.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:bg-white/15 cursor-default transition-all duration-200 w-full sm:w-auto sm:min-w-[160px] md:min-w-[180px]"
                    >
                      <div className="flex items-center p-3 sm:p-4 w-full">
                        {/* Icon */}
                        <div className="rounded-full bg-white/90 p-2 mr-3 shadow-sm flex-shrink-0">
                          {metric.icon}
                        </div>

                        {/* Metric content */}
                        <div className="flex flex-col w-full">
                          <div className="flex items-baseline justify-center sm:justify-start">
                            <span className="text-white font-medium text-lg sm:text-xl tracking-tight">{metric.value}</span>
                            <span
                              className={`ml-1.5 text-xs font-medium ${metric.trendUp ? "text-[#30D158]" : "text-[#FF453A]"
                                }`}
                            >
                              {metric.trend}
                            </span>
                          </div>
                          <span className="text-white/70 text-xs sm:text-sm font-light tracking-wide text-center sm:text-left">
                            {metric.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
              <CardContent className="p-5">
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

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xl font-medium text-gray-800">$8.2k</div>
                    <div className="text-xs text-gray-500 flex items-center font-light">
                      Revenue
                      <span className="text-[#30D158] ml-1">↑</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-gray-800">128</div>
                    <div className="text-xs text-gray-500 flex items-center font-light">
                      New Bookings
                      <span className="text-[#30D158] ml-1">↑</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-gray-800">96%</div>
                    <div className="text-xs text-gray-500 flex items-center font-light">
                      Satisfaction
                      <span className="text-[#30D158] ml-1">↑</span>
                    </div>
                  </div>
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
                  <ReactApexChart options={serviceChartOptions} series={serviceChartSeries} type="bar" height="100%" />
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
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Admin