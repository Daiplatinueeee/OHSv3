import { ChevronRight, Briefcase, BarChart2, Activity, Calendar } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import MyFloatingDockCeo from "./Styles/MyFloatingDock-COO"
import Footer from "./Styles/Footer"

interface Booking {
  _id: string
  status: "pending" | "active" | "completed" | "cancelled"
  pricing?: {
    totalRate: number
  }
  completedDate?: string
}

interface Service {
  _id: string
  name: string
  price: number
  chargePerKm: number
  mainCategory: string
}

interface UserProfile {
  averageRating: number
}

interface ServiceDistributionItem {
  name: string
  percentage: number
}

interface DashboardData {
  totalRevenue: number
  activeProviders: number
  totalServices: number
  averageRating: number
  serviceDistribution: ServiceDistributionItem[]
  createdCoupons: number
  monthlyRevenue: number[]
  newServices: Service[]
  serviceRequests: {
    pending: number
    active: number
    completed: number
    cancelled: number
  }
  pendingBookings: number
  ongoingBookings: number
  activeBookings: number
  completedBookings: number
}


export default function Ceo() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState<
    { _id: string; code: string; discountType: string; description: string }[]
  >([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: 0,
    activeProviders: 0,
    totalServices: 0,
    averageRating: 0,
    serviceDistribution: [],
    createdCoupons: 0,
    monthlyRevenue: Array(12).fill(0),
    newServices: [],
    serviceRequests: {
      pending: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    },
    pendingBookings: 0,
    ongoingBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
  })

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api"

  useEffect(() => {
    const token = localStorage.getItem("token") as string | null
    if (!token) {
      navigate("/proposition")
      return
    }

    fetchDashboardData(token)
  }, [navigate])

  const fetchDashboardData = async (token: string) => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id && !user?.companyId) {
        console.error("No valid user or companyId found.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const companyId = user.companyId || user._id;
      const providerId = user._id;

      const [servicesRes, bookingsRes, couponsRes, userRes, revenueRes, monthlyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/services/company/${companyId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/bookings/company/${companyId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/coupons/company/${companyId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/user/profile`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/bookings/revenue/${companyId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/bookings/monthly-revenue/${companyId}`, { headers }).catch(() => null),
      ]);

      const [pendingRes, ongoingRes, activeRes, completedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/bookings/pending/${providerId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/bookings/ongoing/${providerId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/bookings/active/${providerId}`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/bookings/completed/${providerId}`, { headers }).catch(() => null),
      ]);

      // 🟩 Booking counts
      let pendingCount = 0,
        ongoingCount = 0,
        activeCount = 0,
        completedCount = 0;

      if (pendingRes?.ok) {
        const data = await pendingRes.json();
        pendingCount = data.bookings?.length || 0;
      }
      if (ongoingRes?.ok) {
        const data = await ongoingRes.json();
        ongoingCount = data.bookings?.length || 0;
      }
      if (activeRes?.ok) {
        const data = await activeRes.json();
        activeCount = data.bookings?.length || 0;
      }
      if (completedRes?.ok) {
        const data = await completedRes.json();
        completedCount = data.bookings?.length || 0;
      }

      // 🟩 Declare data holders
      let services: Service[] = [];
      let bookings: Booking[] = [];
      let coupons: unknown[] = [];
      let userProfile: UserProfile | null = null;
      let totalRevenue = 0;
      let monthlyData = Array(12).fill(0);

      // 🟩 Parse once per response
      if (servicesRes?.ok) {
        const data = await servicesRes.json();
        services = data.services || [];
      }

      if (bookingsRes?.ok) {
        const data = await bookingsRes.json();
        bookings = data.bookings || [];
      }

      if (couponsRes?.ok) {
        const data = await couponsRes.json();
        coupons = data.coupons || [];
        setCoupons(data.coupons || []); // ✅ store for display
      }

      if (userRes?.ok) {
        const data = await userRes.json();
        userProfile = data.user;
      }

      // 🟩 Use backend-calculated revenue
      if (revenueRes?.ok) {
        const data = await revenueRes.json();
        totalRevenue = data.totalRevenue || 0;
        monthlyData = data.monthlyRevenue || Array(12).fill(0);
      }

      // 🟩 Monthly revenue (if separate)
      if (monthlyRes?.ok) {
        const data = await monthlyRes.json();
        console.log("[📊 Frontend] Raw Monthly Revenue Data from API:", data);

        const monthlyList = (data.monthlyRevenue || []) as { name: string; total: number }[];
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
        ];

        const monthlyTotals = monthNames.map((month) => {
          const match = monthlyList.find((m) => m.name === month);
          return match ? match.total : 0;
        });

        monthlyData = monthlyTotals;
      }

      // 🟩 Service Distribution
      const serviceDistribution: Record<string, number> = {};
      services.forEach((service: Service) => {
        const category = service.mainCategory || "Other";
        serviceDistribution[category] = (serviceDistribution[category] || 0) + 1;
      });

      const distributionArray: ServiceDistributionItem[] = Object.entries(serviceDistribution)
        .map(([name, count]) => ({
          name,
          percentage: Math.round((count / Math.max(services.length, 1)) * 100),
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // 🟩 Booking stats
      const bookingStats = {
        pending: bookings.filter((b: Booking) => b.status === "pending").length,
        active: bookings.filter((b: Booking) => b.status === "active").length,
        completed: bookings.filter((b: Booking) => b.status === "completed").length,
        cancelled: bookings.filter((b: Booking) => b.status === "cancelled").length,
      };

      // 🟩 Update dashboard state
      setDashboardData({
        totalRevenue: Math.round(totalRevenue),
        activeProviders: 0,
        totalServices: services.length,
        averageRating: userProfile?.averageRating || 0,
        serviceDistribution: distributionArray,
        createdCoupons: coupons.length,
        monthlyRevenue: monthlyData,
        newServices: services.slice(0, 4),
        serviceRequests: bookingStats,
        pendingBookings: pendingCount,
        ongoingBookings: ongoingCount,
        activeBookings: activeCount,
        completedBookings: completedCount,
      });

      // 🟩 Provider count
      const providersRes = await fetch(`${API_BASE_URL}/bookings/providers/${providerId}`, { headers });

      if (providersRes?.ok) {
        const providersData = await providersRes.json();
        const count = (providersData.count as number) || 0;
        setDashboardData((prev) => ({
          ...prev,
          activeProviders: count,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A84FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Floating Dock */}
      <div className="sticky top-0 z-40 flex">
        <MyFloatingDockCeo />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="bg-gradient-to-r from-[#0A84FF] to-[#5AC8FA] rounded-2xl p-6 text-white mb-8 ">
          <h2 className="text-2xl font-medium mb-2">Dashboard Overview</h2>
          <p className="text-white/90 mb-4 font-light">
            Here's what's happening with your home services business today.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/90 text-sm font-light">Total Revenue</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-medium">₱{dashboardData.totalRevenue.toLocaleString()}</h3>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">+12.5%</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/90 text-sm font-light">Active Providers</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-medium">{dashboardData.activeProviders}</h3>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">+5.3%</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/90 text-sm font-light">Total Services</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-medium">{dashboardData.totalServices}</h3>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">+8.2%</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/90 text-sm font-light">Customer Satisfaction</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-medium">{dashboardData.averageRating.toFixed(1)}/5.0</h3>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">+0.2</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/90 text-sm font-light">Pending Bookings</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-medium">{dashboardData.pendingBookings}</h3>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">+0.2</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/90 text-sm font-light">Active Bookings</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-medium">{dashboardData.activeBookings}</h3>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">+0.2</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/90 text-sm font-light">Completed Bookings</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-medium">{dashboardData.completedBookings}</h3>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">+0.2</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/90 text-sm font-light">Ongoing Bookings</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-medium">{dashboardData.ongoingBookings}</h3>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-light">+0.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Service distribution */}
          <div className="bg-white rounded-2xl p-6 h-full">
            <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-[#0A84FF]" />
              Service Distribution
            </h3>
            <div className="space-y-3">
              {dashboardData.serviceDistribution.length > 0 ? (
                dashboardData.serviceDistribution.map((service, idx) => (
                  <ServiceDistributionBar
                    key={idx}
                    name={service.name}
                    percentage={service.percentage}
                    color={
                      ["bg-[#0A84FF]", "bg-[#5AC8FA]", "bg-[#30B0C7]", "bg-[#64D2FF]", "bg-[#0071E3]", "bg-[#8E8E93]"][
                      idx % 6
                      ]
                    }
                  />
                ))
              ) : (
                <p className="text-gray-500 text-sm">No services yet</p>
              )}
            </div>
          </div>

          {/* Created Coupons */}
          <div className="bg-white rounded-2xl p-6 h-full">
            <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-[#0A84FF]" />
              Created Coupons
            </h3>

            {coupons && coupons.length > 0 ? (
              <div className="space-y-4">
                {coupons.slice(0, 5).map((coupon, index) => (
                  <div
                    key={coupon._id || index}
                    className="p-3 border border-gray-100 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-[#0A84FF]">{coupon.code}</span>
                      <span className="text-xs text-gray-500 uppercase bg-[#E8F8EF] px-2 py-0.5 rounded-full">
                        {coupon.discountType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{coupon.description || "No description provided."}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">No coupons created yet.</p>
            )}

            <button
              onClick={() => navigate("/coo/bookings")}
              className="mt-4 text-[#0A84FF] text-sm font-medium flex items-center group w-full justify-center hover:text-[#0071E3]"
            >
              View all coupons
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Business stats */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-8">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-[#0A84FF]" />
                Monthly Revenue
              </h3>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={dashboardData.monthlyRevenue.map((value, i) => ({
                    name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
                    revenue: value,
                  }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `₱${v.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`₱${v.toLocaleString()}`, "Revenue"]}
                    cursor={{ fill: "rgba(90, 200, 250, 0.1)" }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#0A84FF"
                    radius={[8, 8, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Upcoming services */}
        <div className="bg-white rounded-2xl p-6 mb-8  flex justify-between">
          <div className="flex justify-between items-start mb-4 flex-col w-full">
            <h3 className="text-xl font-medium text-gray-800 flex items-start mb-4">
              <Calendar className="h-5 w-5 mr-2 text-[#0A84FF]" />
              New Services
            </h3>

            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-white rounded-xl overflow-hidden">
                <thead className="bg-[#F2F2F7]">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Service Name</th>
                    <th className="px-4 py-3">Starting Rate</th>
                    <th className="px-4 py-3">Per KM</th>
                    <th className="px-4 py-3">Main Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.newServices.length > 0 ? (
                    dashboardData.newServices.map((service) => <ServiceRow key={service._id} service={service} />)
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No services created yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

interface ServiceDistributionBarProps {
  name: string
  percentage: number
  color: string
}

function ServiceDistributionBar({ name, percentage, color }: ServiceDistributionBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-700 font-light">{name}</span>
        <span className="text-sm font-medium text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-[#F2F2F7] rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )
}

interface ServiceRowProps {
  service: Service
}

function ServiceRow({ service }: ServiceRowProps) {
  return (
    <tr className="hover:bg-[#F2F2F7]/50">
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{service.name}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-light">₱{service.price}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-light">₱{service.chargePerKm}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-light">{service.mainCategory}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="px-2 py-0.5 text-xs font-light rounded-full bg-[#E8F8EF] text-[#30D158]">Active</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button className="text-[#0A84FF] hover:text-[#0071E3] flex items-center gap-1 group text-sm">
          Details
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </td>
    </tr>
  )
}