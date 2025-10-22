import {
  useState,
  useEffect,
} from "react"
import {
  Activity,
  Search,
  Filter,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Download,
  PieChart,
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  MapPin,
  RefreshCw,
} from "lucide-react"
import MyFloatingDock from "../Styles/MyFloatingDock"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Footer from "../Styles/Footer"
import axios from "axios"


function UserActivities() {
  const [, setActiveTab] = useState("all")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUserActivities = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(
        "http://localhost:3000/api/allUserActivities",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.data.success) {
        setActivities(res.data.activities)
      }
    } catch (error) {
      console.error("Error fetching user activities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserActivities()
  }, [])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      fetchUserActivities()
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Format current time
  const timeString = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const dateString = currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })

  // Activity metrics
  const activityMetrics = {
    totalToday: 842,
    activeUsers: 186,
    successRate: 94,
    avgSessionTime: "18m",
  }

  // Activity by type data
  const activityByType = [
    { type: "Authentication", count: 245, percentage: 28 },
    { type: "Transaction", count: 312, percentage: 35 },
    { type: "Account", count: 198, percentage: 22 },
    { type: "Feedback", count: 134, percentage: 15 },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-sm">Loading user activities...</p>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Floating Dock */}
      <div className="sticky z-40 flex">
        <MyFloatingDock />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">

        {/* Header with Time and Date */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-700">User Activities</h1>
            <p className="text-gray-500 text-sm font-light">Real-time monitoring dashboard</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="text-2xl font-medium text-[#0A84FF]">{timeString}</div>
            <div className="text-sm text-gray-500 font-light">{dateString}</div>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="mb-8 w-full px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0A84FF] to-[#5AC8FA] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 text-white">

              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 text-center md:text-left">
                <div className="w-full md:w-auto">
                  <h2 className="text-xl sm:text-2xl font-semibold">Activity Overview</h2>
                  <p className="text-white/90 font-light text-sm sm:text-base">Real-time user activity monitoring</p>
                </div>

                <div className="mt-4 md:mt-0 flex justify-center md:justify-end w-full md:w-auto gap-2 flex-wrap">
                  <Button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0 text-sm sm:text-base px-4 py-2">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button className="bg-white text-[#0A84FF] hover:bg-white/90 border-0 text-sm sm:text-base px-4 py-2">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Today's Activities */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Today's Activities</span>
                  </div>
                  <div className="text-3xl font-medium">{activityMetrics.totalToday}</div>
                  <div className="text-white/90 text-sm mt-1 flex items-center justify-center sm:justify-start font-light">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>12% increase</span>
                  </div>
                </div>

                {/* Active Users */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Active Users</span>
                  </div>
                  <div className="text-3xl font-medium">{activityMetrics.activeUsers}</div>
                  <div className="text-white/90 text-sm mt-1 flex items-center justify-center sm:justify-start font-light">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>8% increase</span>
                  </div>
                </div>

                {/* Success Rate */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Success Rate</span>
                  </div>
                  <div className="text-3xl font-medium">{activityMetrics.successRate}%</div>
                  <div className="text-white/90 text-sm mt-1 flex items-center justify-center sm:justify-start font-light">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>2% increase</span>
                  </div>
                </div>

                {/* Avg. Session */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Avg. Session</span>
                  </div>
                  <div className="text-3xl font-medium">{activityMetrics.avgSessionTime}</div>
                  <div className="text-white/90 text-sm mt-1 flex items-center justify-center sm:justify-start font-light">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span>5% increase</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>


        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Timeline - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex gap-5">
                    <h2 className="text-lg font-medium text-gray-800">Live Feed Activities</h2>
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-auto">
                      <TabsList className="bg-[#F2F2F7]">
                        <TabsTrigger value="all" className="text-xs data-[state=active]:bg-white">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="auth" className="text-xs data-[state=active]:bg-white">
                          Auth
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="text-xs data-[state=active]:bg-white">
                          Trans
                        </TabsTrigger>
                        <TabsTrigger value="warnings" className="text-xs data-[state=active]:bg-white">
                          Alerts
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>

                  <div className="space-y-8">
                    {activities.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm">No user activities found.</div>
                    ) : (
                      activities.map((activity: any) => (
                        <div key={activity._id} className="relative pl-12">
                          {/* Timeline dot */}
                          <div className="absolute left-0 top-0 w-8 h-8 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-[#0A84FF]" />
                          </div>

                          <div className="bg-[#F2F2F7]/50 rounded-xl p-4 hover:bg-[#F2F2F7] transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{activity.action}</span>
                                <Badge
                                  className={`${activity.status === "success"
                                    ? "bg-[#E8F8EF] text-[#30D158]"
                                    : activity.status === "failed"
                                      ? "bg-[#FFE5E7] text-[#FF453A]"
                                      : "bg-[#FFF8E6] text-[#FF9500]"
                                    }`}
                                >
                                  {activity.status}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500 font-light">
                                {new Date(activity.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 mb-2">{activity.description}</div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600 font-light">
                              <div>Category: <span className="capitalize">{activity.category}</span></div>
                              {activity.relatedEntityType && (
                                <div>Entity: {activity.relatedEntityType}</div>
                              )}
                            </div>

                            {activity.link && (
                              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                                <a
                                  href={activity.link}
                                  className="text-[#0A84FF] text-xs hover:underline"
                                >
                                  View Related
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Analytics - Right Side */}
          <div>
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search activities..." className="pl-9 bg-[#F2F2F7] border-0" />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="today">
                    <SelectTrigger className="w-full bg-[#F2F2F7] border-0">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-[#F2F2F7] border-0">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Activity by Type */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#E9F6FF] to-[#F2EBFF] p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Activity by Type</h3>
                    <PieChart className="h-4 w-4 text-[#0A84FF]" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {activityByType.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${index === 0
                                ? "bg-[#0A84FF]"
                                : index === 1
                                  ? "bg-[#30D158]"
                                  : index === 2
                                    ? "bg-[#5E5CE6]"
                                    : "bg-[#FF9500]"
                                }`}
                            ></div>
                            <span className="text-sm text-gray-700 font-light">{item.type}</span>
                          </div>
                          <div className="text-sm font-medium">{item.count}</div>
                        </div>
                        <div className="h-1.5 bg-[#F2F2F7] rounded-full">
                          <div
                            className={`h-full rounded-full ${index === 0
                              ? "bg-[#0A84FF]"
                              : index === 1
                                ? "bg-[#30D158]"
                                : index === 2
                                  ? "bg-[#5E5CE6]"
                                  : "bg-[#FF9500]"
                              }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Insights */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#FFE5E7] to-[#FFF8E6] p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Security Insights</h3>
                    <Shield className="h-5 w-5 text-[#FF453A]" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[#FFE5E7]/50 rounded-lg">
                      <div className="rounded-full bg-[#FFE5E7] p-2">
                        <AlertTriangle className="h-4 w-4 text-[#FF453A]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Failed Login Attempts</div>
                        <div className="text-xs text-gray-500 font-light">12 attempts in the last 24 hours</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[#FFF8E6]/50 rounded-lg">
                      <div className="rounded-full bg-[#FFF8E6] p-2">
                        <MapPin className="h-4 w-4 text-[#FF9500]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Unusual Locations</div>
                        <div className="text-xs text-gray-500 font-light">3 logins from new locations</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[#E8F8EF]/50 rounded-lg">
                      <div className="rounded-full bg-[#E8F8EF] p-2">
                        <CheckCircle className="h-4 w-4 text-[#30D158]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Security Status</div>
                        <div className="text-xs text-gray-500 font-light">All systems operating normally</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button variant="ghost" className="text-[#FF453A] text-xs w-full font-medium">
                      View Security Report
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="border-none rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#E9F6FF] to-[#F2EBFF] p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Performance Metrics</h3>
                    <Zap className="h-5 w-5 text-[#0A84FF]" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 font-light">Response Time</span>
                        <span className="text-sm font-medium">245ms</span>
                      </div>
                      <div className="h-2 bg-[#F2F2F7] rounded-full">
                        <div className="h-full bg-[#0A84FF] rounded-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 font-light">Server Load</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <div className="h-2 bg-[#F2F2F7] rounded-full">
                        <div className="h-full bg-[#0A84FF] rounded-full" style={{ width: "42%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 font-light">Memory Usage</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <div className="h-2 bg-[#F2F2F7] rounded-full">
                        <div className="h-full bg-[#0A84FF] rounded-full" style={{ width: "68%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 font-light">API Requests</span>
                        <span className="text-sm font-medium">1,245/hr</span>
                      </div>
                      <div className="h-2 bg-[#F2F2F7] rounded-full">
                        <div className="h-full bg-[#0A84FF] rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button variant="ghost" className="text-[#0A84FF] text-xs w-full font-medium">
                      View Performance Dashboard
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default UserActivities