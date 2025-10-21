"use client"

import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import MyFloatingDockCeo from "../Styles/MyFloatingDock"
import ImagePopup from "../Styles/ImagePopup"
import { Check, AlertCircle, Loader2, Search, Printer, Eye, Flag, MoreHorizontal, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Footer from "../Styles/Footer"

type Report = {
  _id: string
  reporterId: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
    email: string
  }
  reporterEmail: string
  reporterName: string
  reporterProfilePicture?: string
  sellerId: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
    email: string
    businessName?: string
  }
  sellerName: string
  sellerEmail?: string
  sellerProfilePicture?: string
  reportReason: string
  reportDetails: string
  proofImages: string[]
  status: "pending" | "under_review" | "resolved" | "dismissed"
  createdAt: string
  updatedAt: string
}

const generateReportPDF = (reports: Report[]) => {
  console.log("[v0] Generating PDF for reports:", reports.length)

  const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.text("Reports History", 20, 20)

  // Add date
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)

  const tableData = reports.map((report) => [
    report._id.substring(0, 8),
    report.sellerName,
    report.reportReason,
    report.status,
    new Date(report.createdAt).toLocaleDateString(),
    report.reporterEmail,
  ])

  console.log("[v0] Table data prepared:", tableData.length, "rows")

  autoTable(doc, {
    head: [["ID", "Seller", "Reason", "Status", "Date", "Reporter Email"]],
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
  })

  doc.save("reports-history.pdf")
  console.log("[v0] PDF generated and download initiated")
}

const generateSingleReportPDF = (report: Report) => {
  console.log("[v0] Generating single report PDF for:", report._id)

  const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.text("Report Details", 20, 20)

  // Add report details
  doc.setFontSize(12)
  let yPosition = 40

  doc.text(`Report ID: ${report._id}`, 20, yPosition)
  yPosition += 10
  doc.text(`Seller: ${report.sellerName}`, 20, yPosition)
  yPosition += 10
  doc.text(`Reason: ${report.reportReason}`, 20, yPosition)
  yPosition += 10
  doc.text(`Status: ${report.status}`, 20, yPosition)
  yPosition += 10
  doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, 20, yPosition)
  yPosition += 10
  doc.text(`Reporter: ${report.reporterEmail}`, 20, yPosition)
  yPosition += 15

  doc.setFontSize(10)
  doc.text("Details:", 20, yPosition)
  yPosition += 5
  const splitDetails = doc.splitTextToSize(report.reportDetails, 170)
  doc.text(splitDetails, 20, yPosition)

  // Add footer
  doc.setFontSize(10)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280)

  doc.save(`report-${report._id}-${new Date().toISOString().split("T")[0]}.pdf`)
}

function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [currentTime] = useState(new Date())
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [popupImage, setPopupImage] = useState<string | null>(null)
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:3000/api/reports/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch reports")
        }

        const data = await response.json()
        console.log("[v0] Reports fetched:", data)
        setReports(data.reports || data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching reports:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    try {
      setUpdatingStatus(reportId)
      const response = await fetch(`http://localhost:3000/api/reports/${reportId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update report status")
      }

      const updatedData = await response.json()
      console.log("[v0] Report status updated:", updatedData)

      // Update local state
      setReports((prevReports) =>
        prevReports.map((report) => (report._id === reportId ? { ...report, status: newStatus as any } : report)),
      )

      toast.success(`Report status updated to ${newStatus}`)
    } catch (err) {
      console.error("Error updating report status:", err)
      toast.error("Failed to update report status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Calculate metrics
  const reportMetrics = {
    totalReports: reports.length,
    pendingReports: reports.filter((r) => r.status === "pending").length,
    underReviewReports: reports.filter((r) => r.status === "under_review").length,
    resolvedReports: reports.filter((r) => r.status === "resolved").length,
  }

  // Format current time
  const timeString = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const dateString = currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })

  // Filter reports based on active tab
  const filteredReports = reports.filter((report) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return report.status === "pending"
    if (activeTab === "under_review") return report.status === "under_review"
    if (activeTab === "resolved") return report.status === "resolved"
    if (activeTab === "dismissed") return report.status === "dismissed"
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#FFF8E6] text-[#FF9500]"
      case "under_review":
        return "bg-[#E9F6FF] text-[#0A84FF]"
      case "resolved":
        return "bg-[#E8F8EF] text-[#30D158]"
      case "dismissed":
        return "bg-[#FFE5E7] text-[#FF453A]"
      default:
        return "bg-[#F2F2F7] text-[#8E8E93]"
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "spam":
        return "bg-[#F2F2F7] text-[#8E8E93]"
      case "inappropriate":
        return "bg-[#FFE5E7] text-[#FF453A]"
      case "scam":
        return "bg-[#FFE5E7] text-[#FF453A]"
      case "harassment":
        return "bg-[#FFE5E7] text-[#FF453A]"
      case "fake":
        return "bg-[#FFF8E6] text-[#FF9500]"
      case "quality":
        return "bg-[#E9F6FF] text-[#0A84FF]"
      case "pricing":
        return "bg-[#E9F6FF] text-[#0A84FF]"
      case "payment_not_received":
        return "bg-[#FFE5E7] text-[#FF453A]"
      default:
        return "bg-[#F2F2F7] text-[#8E8E93]"
    }
  }

  const getReporterName = (report: Report) => {
    if (typeof report.reporterId === "object") {
      return `${report.reporterId.firstName || ""} ${report.reporterId.lastName || ""}`.trim()
    }
    return report.reporterName
  }

  const getReporterAvatar = (report: Report) => {
    if (typeof report.reporterId === "object") {
      return report.reporterId.profilePicture || report.reporterProfilePicture
    }
    return report.reporterProfilePicture
  }

  const getSellerAvatar = (report: Report) => {
    if (typeof report.sellerId === "object") {
      return report.sellerId.profilePicture || report.sellerProfilePicture
    }
    return report.sellerProfilePicture
  }

  const handleImageClick = (imageUrl: string | null) => {
    if (imageUrl) {
      setPopupImage(imageUrl)
      setIsImagePopupOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Floating Dock */}
      <div className="sticky top-0 z-40 flex">
        <MyFloatingDockCeo />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        {/* Header with Time and Date */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-700">Reports Management</h1>
            <p className="text-gray-500 text-sm font-light">Monitor and manage all user reports</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="text-2xl font-medium text-[#FF453A]">{timeString}</div>
            <div className="text-sm text-gray-500 font-light">{dateString}</div>
          </div>
        </div>

        {/* Reports Overview */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#FF453A] to-[#FF9500] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-medium">Reports Overview</h2>
                  <p className="text-white/90 font-light">Track and manage all submitted reports</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
                    onClick={() => generateReportPDF(filteredReports)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Flag className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Total Reports</span>
                  </div>
                  <div className="text-3xl font-medium">{reportMetrics.totalReports}</div>
                  <div className="text-white/90 text-sm mt-1 font-light">All submitted reports</div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="text-3xl font-medium">{reportMetrics.pendingReports}</div>
                  <div className="text-white/90 text-sm mt-1 font-light">Awaiting review</div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Under Review</span>
                  </div>
                  <div className="text-3xl font-medium">{reportMetrics.underReviewReports}</div>
                  <div className="text-white/90 text-sm mt-1 font-light">Being investigated</div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Resolved</span>
                  </div>
                  <div className="text-3xl font-medium">{reportMetrics.resolvedReports}</div>
                  <div className="text-white/90 text-sm mt-1 font-light">Completed actions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-lg font-medium text-gray-800">Reports List</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search reports..." className="pl-9 bg-[#F2F2F7] border-0" />
                </div>
              </div>
            </div>

            <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-[#F2F2F7]">
                <TabsTrigger value="all" className="text-xs data-[state=active]:bg-white">
                  All
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-white">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="under_review" className="text-xs data-[state=active]:bg-white">
                  Under Review
                </TabsTrigger>
                <TabsTrigger value="resolved" className="text-xs data-[state=active]:bg-white">
                  Resolved
                </TabsTrigger>
                <TabsTrigger value="dismissed" className="text-xs data-[state=active]:bg-white">
                  Dismissed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading reports...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-600 mb-2">Error loading reports</p>
                  <p className="text-sm text-gray-500">{error}</p>
                </div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">No reports found</p>
                  <p className="text-sm text-gray-500">Reports will appear here when submitted</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report._id}
                    className={`bg-[#F2F2F7]/50 rounded-xl p-4 hover:bg-[#F2F2F7] transition-colors cursor-pointer ${
                      selectedReport === report._id ? "ring-1 ring-[#FF453A]" : ""
                    }`}
                    onClick={() => setSelectedReport(selectedReport === report._id ? null : report._id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Seller Avatar */}
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={getSellerAvatar(report) || "/placeholder.svg"} alt={report.sellerName} />
                        <AvatarFallback className="bg-[#FFE5E7] text-[#FF453A]">
                          {report.sellerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="font-medium text-gray-800">Report: {report.sellerName}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={`${getStatusColor(report.status)} hover:opacity-80`}>
                              {report.status.replace(/_/g, " ")}
                            </Badge>
                            <Badge className={`${getReasonColor(report.reportReason)} hover:opacity-80`}>
                              {report.reportReason.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500 mt-1 font-light">
                          Reported by: {getReporterName(report)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-3 text-xs text-gray-600 font-light">
                          <div>
                            <span className="font-medium">Date:</span> {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Images:</span> {report.proofImages.length}
                          </div>
                          <div>
                            <span className="font-medium">ID:</span> {report._id.substring(0, 8)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => generateSingleReportPDF(report)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Export PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {selectedReport === report._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        {/* Proof Images */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Proof Images ({report.proofImages.length})
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {report.proofImages.map((image, idx) => (
                              <div
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleImageClick(image)
                                }}
                                className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square cursor-pointer"
                              >
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Proof ${idx + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">
                                    Click to view
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Report Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-gray-700">Reporter Information</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={getReporterAvatar(report) || "/placeholder.svg"} />
                                  <AvatarFallback className="bg-[#E9F6FF] text-[#0A84FF]">
                                    {getReporterName(report).charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <div className="font-medium">{getReporterName(report)}</div>
                                  <div className="text-xs text-gray-500">{report.reporterEmail}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-gray-700">Report Details</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Reason:</span>
                                <p className="text-gray-700">{report.reportReason.replace(/_/g, " ")}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Status:</span>
                                <p className="text-gray-700">{report.status.replace(/_/g, " ")}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700">Additional Details</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{report.reportDetails}</p>
                        </div>

                        {/* Status Update */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-700">Update Status:</span>
                          <Select
                            value={report.status}
                            onValueChange={(newStatus) => handleUpdateStatus(report._id, newStatus)}
                            disabled={updatingStatus === report._id}
                          >
                            <SelectTrigger className="w-40 bg-white border-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500 font-light">
              Showing <span className="font-medium">{filteredReports.length}</span> of{" "}
              <span className="font-medium">{reports.length}</span> reports
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-700">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-700">
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Image Popup */}
      <ImagePopup imageUrl={popupImage} isOpen={isImagePopupOpen} onClose={() => setIsImagePopupOpen(false)} />

      <Footer />
    </div>
  )
}

export default Reports
