import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, DollarSign, CheckCircle2, MapPin, Users, Tag } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface SellerInfo {
  id: number
  name: string
  rating: number
  reviews: number
  location: string
  price?: number
  startingRate?: number
  ratePerKm?: number
  description?: string
  workerCount?: number
  _id?: string // Added to accommodate potential MongoDB ObjectId
}

interface BookingDetails {
  id?: string
  service?: string
  serviceType?: string
  date?: string
  location?: string
  distance?: number
  price?: number
  baseRate?: number
  distanceCharge?: number
  additionalFees?: number
  total?: number
  workerCount?: number
  estimatedTime?: string
  status?: string
  pricing?: {
    totalRate: number
  }
}

interface Coupon {
  _id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  maxDiscount: number | null
  minPurchase: number
  description: string
  companyId: string | { _id: string; businessName?: string; firstName?: string; lastName?: string }
  companyName: string
  expiresAt: string
  isUsed: boolean
  isExpired?: boolean
  isValid?: boolean
  couponType: string
}

function Transaction() {
  const navigate = useNavigate()
  const location = useLocation()
  const [couponCode, setCouponCode] = useState<string>("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState<string>("")
  const [originalAmount, setOriginalAmount] = useState<number>(0)
  const [userCoupons, setUserCoupons] = useState<Coupon[]>([])
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false)
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [seller, setSeller] = useState<SellerInfo | null>(null)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [, setIsComplete] = useState<boolean>(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [transactionType, setTransactionType] = useState<"subscription" | "booking" | "advertisement">("subscription")
  const [planName, setPlanName] = useState<string>("")
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [, setBookingStatus] = useState<string>("")
  const [redirectUrl, setRedirectUrl] = useState<string>("/")
  const [previousPage, setPreviousPage] = useState<string>("")
  const [paymongoWindow, setPaymongoWindow] = useState<Window | null>(null)
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)
  const [amount, setAmount] = useState<string>("")
  const [selectedWallet, setSelectedWallet] = useState<string>("")
  const [isSliding, setIsSliding] = useState(false)

  // Animation keyframes
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(-100%); }
    }
    @keyframes slideInFromLeft {
      from { opacity: 0; transform: translateX(-100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    .fade-in { animation: fadeIn 0.5s ease-out; }
    .slide-in { animation: slideIn 0.3s ease-out; }
    .slide-out { animation: slideOut 0.3s ease-out; }
    .slide-in-left { animation: slideInFromLeft 0.3s ease-out; }
  `

  useEffect(() => {
    const fetchUserCoupons = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.log("No auth token found, skipping coupon fetch")
          return
        }

        setIsLoadingCoupons(true)
        const response = await fetch("http://localhost:3000/api/coupons/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch coupons")
        }

        const data = await response.json()
        console.log("Fetched user coupons:", data)
        setUserCoupons(data.coupons || [])
      } catch (error) {
        console.error("Error fetching user coupons:", error)
      } finally {
        setIsLoadingCoupons(false)
      }
    }

    fetchUserCoupons()
  }, [])

  useEffect(() => {
    if (seller && seller.id) {
      console.log("[v0] Full seller object:", seller)
      console.log("[v0] Seller properties:", Object.keys(seller))

      const companyId = (seller as any)._id ? String((seller as any)._id) : String(seller.id)

      console.log("[v0] Setting currentCompanyId from seller:", {
        sellerId: seller.id,
        sellerIdType: typeof seller.id,
        seller_id: (seller as any)._id,
        seller_idType: typeof (seller as any)._id,
        convertedCompanyId: companyId,
        convertedType: typeof companyId,
        sellerName: seller.name,
        allSellerKeys: Object.keys(seller),
      })
      setCurrentCompanyId(companyId)
    } else if (bookingDetails && bookingDetails.id) {
      const storedBookingData = localStorage.getItem("currentBookingDetails")
      if (storedBookingData) {
        try {
          const parsedData = JSON.parse(storedBookingData)
          console.log("[v0] Parsed booking data:", parsedData)
          console.log("[v0] Booking data keys:", Object.keys(parsedData))

          if (parsedData.providerId) {
            console.log("[v0] Setting currentCompanyId from booking data:", {
              providerId: parsedData.providerId,
              providerIdType: typeof parsedData.providerId,
            })
            setCurrentCompanyId(parsedData.providerId)
          }
        } catch (e) {
          console.error("Error parsing booking data for company ID", e)
        }
      }
    }
  }, [seller, bookingDetails])

  const monitorPayMongoUrl = async () => {
    const currentUrl = window.location.href
    const referrerUrl = document.referrer

    console.log("=== Frontend PayMongo URL Monitor ===")
    console.log("[v0] Monitoring URLs for PayMongo success...")
    console.log("[v0] Current URL:", currentUrl)
    console.log("[v0] Referrer URL:", referrerUrl)
    console.log("[v0] Window location:", window.location)

    const paymongoPattern = /pm\.link\/([^/]+)\/success/

    if (paymongoPattern.test(currentUrl)) {
      console.log("[v0] Currently on PayMongo success page!")
      await handlePayMongoSuccess(currentUrl)
      return true
    }

    if (paymongoPattern.test(referrerUrl)) {
      console.log("[v0] Referrer is PayMongo success page!")
      await handlePayMongoSuccess(referrerUrl)
      return true
    }

    try {
      console.log("[v0] Calling backend API to validate URLs...")

      const apiUrl = `http://localhost:3000/api/check-paymongo-url?url=${encodeURIComponent(currentUrl)}`
      console.log("[v0] API call URL:", apiUrl)

      const currentUrlResponse = await fetch(apiUrl, {
        headers: {
          Referer: referrerUrl || currentUrl,
        },
      })
      const currentUrlData = await currentUrlResponse.json()

      console.log("[v0] Backend API response for current URL:", currentUrlData)

      if (currentUrlData.isPayMongoSuccess) {
        console.log("[v0] Backend confirmed PayMongo success for current URL!")
        await handlePayMongoSuccess(currentUrl, currentUrlData.paymentMethod)
        return true
      }

      if (referrerUrl && referrerUrl !== currentUrl && paymongoPattern.test(referrerUrl)) {
        console.log("[v0] Detected redirect from PayMongo success page!")
        await handlePayMongoSuccess(referrerUrl)
        return true
      }
    } catch (error) {
      console.error("[v0] Error calling backend API:", error)
    }

    console.log("[v0] No PayMongo success URLs detected")
    return false
  }

  const handlePayMongoSuccess = async (successUrl: string, detectedPaymentMethod?: string) => {
    console.log("[v0] Handling PayMongo success for URL:", successUrl)

    let paymentMethod = detectedPaymentMethod

    if (!paymentMethod) {
      const paymongoPattern = /pm\.link\/([^/]+)\/success/
      const match = successUrl.match(paymongoPattern)

      if (match) {
        paymentMethod = match[1]
        console.log("[v0] Extracted payment method from URL:", paymentMethod)
      } else {
        paymentMethod = "paymongo"
        console.log("[v0] Could not extract payment method, using fallback:", paymentMethod)
      }
    }

    const storedData = localStorage.getItem("paymongoTransactionData")
    let transactionData = null

    if (storedData) {
      try {
        transactionData = JSON.parse(storedData)
        console.log("[v0] Retrieved stored transaction data:", transactionData)
      } catch (e) {
        console.error("[v0] Error parsing stored transaction data:", e)
      }
    }

    const redirectUrl = `http://localhost:5173/transaction?status=success&bookingId=${transactionData?.bookingId || "unknown"}&transactionType=${transactionData?.transactionType || "booking"}&paymentMethod=${paymentMethod}`

    console.log("[v0] Constructed redirect URL:", redirectUrl)
    console.log("[v0] Redirecting now...")

    window.location.href = redirectUrl
  }

  useEffect(() => {
    const checkAndRedirect = async () => {
      console.log("[v0] Page loaded, checking for PayMongo success...")
      console.log("[v0] Current location:", window.location.href)
      console.log("[v0] Document referrer:", document.referrer)

      const redirected = await monitorPayMongoUrl()
      if (redirected) {
        return
      }

      setPreviousPage(document.referrer || location.state?.from || "")

      const urlParams = new URLSearchParams(window.location.search)
      const planParam = urlParams.get("plan")
      const priceParam = urlParams.get("price")
      const redirectParam = urlParams.get("redirect")
      const userTypeParam = urlParams.get("userType")
      const statusParam = urlParams.get("status")
      const bookingIdParam = urlParams.get("bookingId")
      const transactionTypeParam = urlParams.get("transactionType")
      const paymentMethodParam = urlParams.get("paymentMethod")

      console.log("URL Parameters:", {
        status: statusParam,
        bookingId: bookingIdParam,
        transactionType: transactionTypeParam,
        paymentMethod: paymentMethodParam,
      })

      const storedBookingData = localStorage.getItem("currentBookingDetails")
      let parsedBookingData = null

      if (storedBookingData) {
        try {
          parsedBookingData = JSON.parse(storedBookingData)
        } catch (e) {
          console.error("Error parsing stored booking data", e)
        }
      }

      const bookingData = location.state?.booking || parsedBookingData
      const sellerData = location.state?.seller

      if (transactionTypeParam) {
        setTransactionType(transactionTypeParam as "subscription" | "booking" | "advertisement")
      }

      if (bookingData && bookingData.id) {
        setBookingId(bookingData.id)
      } else if (bookingIdParam) {
        setBookingId(bookingIdParam)
      } else if (sellerData && sellerData.id) {
        setBookingId(String(sellerData.id))
      }

      if (statusParam === "success") {
        console.log("PayMongo success detected!")

        if (paymentMethodParam) {
          console.log("Setting payment method to:", paymentMethodParam)
          setPaymentMethod(paymentMethodParam)
        }

        if (bookingIdParam) {
          setBookingId(bookingIdParam)
        }

        if (transactionTypeParam === "booking" && bookingIdParam) {
          console.log("Updating booking after PayMongo success...")
          updateBookingAfterPayMongoSuccess(bookingIdParam, paymentMethodParam || "paymongo")
          setSuccessMessage(
            `Payment completed successfully via ${paymentMethodParam || "PayMongo"}! You can now track your provider.`,
          )
        } else if (transactionTypeParam === "subscription") {
          setSuccessMessage(`You've successfully subscribed to your plan via ${paymentMethodParam || "PayMongo"}!`)
        } else if (transactionTypeParam === "advertisement") {
          setSuccessMessage(`Your service is now being advertised via ${paymentMethodParam || "PayMongo"}!`)
        } else {
          setSuccessMessage(`Payment completed successfully via ${paymentMethodParam || "PayMongo"}!`)
        }
        setIsSuccessModalOpen(true)
      } else if (statusParam === "failed") {
        setSuccessMessage("Payment failed or was cancelled. Please try again.")
        setIsSuccessModalOpen(true)
      }

      if (statusParam) {
        setBookingStatus(statusParam)
      } else if (bookingData && bookingData.status) {
        setBookingStatus(bookingData.status)
      } else {
        setBookingStatus("pending")
      }

      if (redirectParam) {
        setRedirectUrl(redirectParam)
      } else if (previousPage) {
        setRedirectUrl(previousPage)
      } else {
        if (userTypeParam === "ceo" || planParam) {
          setRedirectUrl("/ceo/bookings")
        } else {
          setRedirectUrl("/")
        }
      }

      if (planParam) {
        setTransactionType("subscription")

        switch (planParam) {
          case "free":
            setPlanName("Free")
            break
          case "mid":
            setPlanName("Professional")
            break
          case "premium":
            setPlanName("Business")
            break
          case "unlimited":
            setPlanName("Enterprise")
            break
          case "advertisement":
            setTransactionType("advertisement")
            setPlanName("Service Advertisement")
            setSeller({
              id: 1,
              name: "Online Home Services",
              rating: 5,
              reviews: 823.2,
              location: "Cebu City Branches",
              price: priceParam ? Number.parseFloat(priceParam) : 0,
            })
            if (priceParam) {
              setTotalAmount(Number.parseFloat(priceParam))
            }
            break
          default:
            setPlanName("")
        }

        if (planParam !== "advertisement") {
          setSeller({
            id: 1,
            name: "Online Home Services",
            rating: 5,
            reviews: 823.2,
            location: "Cebu City Branches",
            price: priceParam ? Number.parseFloat(priceParam) : 0,
          })
        }

        if (priceParam) {
          setTotalAmount(Number.parseFloat(priceParam))
        }
      } else if (bookingData || sellerData) {
        setTransactionType("booking")

        if (bookingData) {
          setBookingDetails({
            id: bookingData.id,
            service: bookingData.service,
            serviceType: bookingData.serviceType,
            date: bookingData.date,
            location: bookingData.location,
            distance: bookingData.distance,
            baseRate: bookingData.baseRate,
            distanceCharge:
              bookingData.distance && bookingData.ratePerKm
                ? bookingData.distance * bookingData.ratePerKm
                : bookingData.distanceCharge || 0,
            additionalFees: bookingData.additionalFees || 0,
            price: bookingData.price,
            total: bookingData.price,
            workerCount: bookingData.workerCount,
            estimatedTime: bookingData.estimatedTime,
            status: bookingData.status,
          })

          setPlanName(bookingData.serviceType || bookingData.service || "Service Booking")

          const calculatedTotal =
            (bookingData.baseRate || 0) +
            (bookingData.distance && bookingData.ratePerKm
              ? bookingData.distance * bookingData.ratePerKm
              : bookingData.distanceCharge || 0) +
            (bookingData.additionalFees || 0)

          setTotalAmount(bookingData.price || calculatedTotal)
        }

        if (sellerData) {
          setSeller(sellerData)

          if (sellerData.price && !totalAmount) {
            setTotalAmount(sellerData.price)
          }

          if (!bookingData && sellerData) {
            const distanceCharge =
              sellerData.ratePerKm && location.state?.distance ? sellerData.ratePerKm * location.state.distance : 0

            const newBookingDetails: BookingDetails = {
              id: String(sellerData.id),
              service: location.state?.service || "Service",
              serviceType: location.state?.serviceType || planName,
              date: location.state?.date || new Date().toISOString().split("T")[0],
              location: location.state?.location || sellerData.location,
              distance: location.state?.distance || 0,
              baseRate: sellerData.startingRate || sellerData.price,
              distanceCharge: distanceCharge,
              additionalFees: 0,
              price: sellerData.price || (sellerData.startingRate ? sellerData.startingRate + distanceCharge : 0),
              total: sellerData.price || (sellerData.startingRate ? sellerData.startingRate + distanceCharge : 0),
              workerCount: sellerData.workerCount || 1,
              estimatedTime: location.state?.estimatedTime || "1-2 hours",
            }

            setBookingDetails(newBookingDetails)

            if (newBookingDetails.price) {
              setTotalAmount(newBookingDetails.price)
            }
          }
        }
      }
    }

    checkAndRedirect()
  }, [location, totalAmount, previousPage, bookingId, planName])

  useEffect(() => {
    if (totalAmount > 0) {
      setAmount(totalAmount.toString())
      console.log("[v0] Amount initialized from totalAmount:", totalAmount)
    }
  }, [totalAmount])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin.includes("paymongo.com") || event.origin.includes("pm.link")) {
        console.log("[v0] Received message from PayMongo tab:", event.data)

        if (event.data.type === "PAYMONGO_SUCCESS") {
          console.log("[v0] PayMongo success detected via tab communication!")
          handlePayMongoTabSuccess(event.data.paymentMethod || "paymongo")
        } else if (event.data.type === "PAYMONGO_FAILED") {
          console.log("[v0] PayMongo failure detected via tab communication!")
          setIsWaitingForPayment(false)
          setSuccessMessage("Payment failed or was cancelled. Please try again.")
          setIsSuccessModalOpen(true)
        }
      }
    }

    let pollInterval: NodeJS.Timeout | null = null
    let paymentStartTime: number | null = null

    if (paymongoWindow && isWaitingForPayment) {
      paymentStartTime = Date.now()
      console.log("[v0] Starting PayMongo payment monitoring at:", new Date(paymentStartTime).toISOString())

      pollInterval = setInterval(async () => {
        if (paymongoWindow.closed) {
          const timeSpent = Date.now() - (paymentStartTime || 0)
          console.log("[v0] PayMongo tab closed after", timeSpent, "ms")
          clearInterval(pollInterval!)

          if (timeSpent < 30000) {
            console.log("[v0] Tab closed too quickly (", timeSpent, "ms) - likely cancelled payment")
            setIsWaitingForPayment(false)
            setSuccessMessage("Payment was cancelled. Please try again if you want to complete the payment.")
            setIsSuccessModalOpen(true)
            return
          }

          try {
            console.log("[v0] Checking for PayMongo success after tab closure...")
            const lastUrl = paymongoWindow.location?.href || ""
            console.log("[v0] Last known PayMongo URL:", lastUrl)

            const successPattern = /pm\.link\/([^/]+)\/success/
            const match = lastUrl.match(successPattern)

            if (match) {
              const detectedMethod = match[1]
              console.log("[v0] Detected payment method from URL:", detectedMethod)
              handlePayMongoTabSuccess(detectedMethod)
            } else {
              console.log("[v0] Could not detect specific payment method, using generic 'online_payment'")
              setTimeout(() => {
                handlePayMongoTabSuccess("online_payment")
              }, 1000)
            }
          } catch (error) {
            console.log("[v0] Could not access tab URL (cross-origin), assuming payment completed")
            setTimeout(() => {
              handlePayMongoTabSuccess("online_payment")
            }, 1000)
          }
        }
      }, 1000)
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [paymongoWindow, isWaitingForPayment])

  const handlePayMongoTabSuccess = (paymentMethod: string) => {
    console.log("[v0] Processing PayMongo tab success with method:", paymentMethod)

    setIsWaitingForPayment(false)

    const formatPaymentMethod = (method: string) => {
      const methodMap: { [key: string]: string } = {
        gcash: "GCash",
        grabpay: "GrabPay",
        paymaya: "PayMaya",
        dob_bpi: "BPI Online Banking",
        dob_ubp: "UnionBank Online Banking",
        dob_rcbc: "RCBC Online Banking",
        online_payment: "Online Payment",
        paymongo: "PayMongo",
      }
      return methodMap[method.toLowerCase()] || method.toUpperCase()
    }

    const formattedMethod = formatPaymentMethod(paymentMethod)
    setPaymentMethod(formattedMethod)

    if (transactionType === "booking" && bookingId) {
      console.log("[v0] Updating booking after PayMongo tab success...")
      updateBookingAfterPayMongoSuccess(bookingId, formattedMethod)
      setSuccessMessage(`Payment completed successfully via ${formattedMethod}! You can now track your provider.`)
    } else if (transactionType === "subscription") {
      setSuccessMessage(`You've successfully subscribed to your plan via ${formattedMethod}!`)
    } else if (transactionType === "advertisement") {
      setSuccessMessage(`Your service is now being advertised via ${formattedMethod}!`)
    } else {
      setSuccessMessage(`Payment completed successfully via ${formattedMethod}!`)
    }

    setIsSuccessModalOpen(true)

    if (paymongoWindow && !paymongoWindow.closed) {
      paymongoWindow.close()
    }
    setPaymongoWindow(null)
  }

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method)
    setSelectedWallet("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    if (paymentMethod === "paymongo" || paymentMethod === "onhand") {
      await handlePayMongoPayment()
    } else {
      setTimeout(async () => {
        setIsProcessing(false)
        setIsComplete(true)

        if (transactionType === "booking" && bookingId) {
          try {
            const token = localStorage.getItem("token")
            if (!token) {
              console.error("Authentication token not found.")
              setSuccessMessage("Payment successful, but failed to update booking status (auth error).")
              setIsSuccessModalOpen(true)
              return
            }

            if (appliedCoupon) {
              try {
                const couponResponse = await fetch("http://localhost:3000/api/coupons/apply", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    code: appliedCoupon.code,
                    bookingId: bookingId,
                  }),
                })

                if (couponResponse.ok) {
                  console.log("Coupon applied to booking successfully")
                } else {
                  console.error("Failed to apply coupon to booking")
                }
              } catch (couponError) {
                console.error("Error applying coupon to booking:", couponError)
              }
            }

            const finalAmount = calculateFinalTotalWithTax()
            console.log("[v0] Updating booking with final amount:", finalAmount)

            const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/payment-status`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                status: "active",
                paymentComplete: true,
                paymentMethod: paymentMethod,
                totalRate: finalAmount, // Send the final discounted amount
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.message || "Failed to update booking payment status on backend.")
            }

            const updatedBooking = await response.json()
            console.log("Booking payment status updated successfully:", updatedBooking)
            setBookingStatus("active")
            setSuccessMessage("Payment completed successfully! You can now track your provider.")
          } catch (error) {
            console.error("Error updating booking payment status via API:", error)
            setSuccessMessage(
              `Payment successful, but failed to update booking status: ${error instanceof Error ? error.message : String(error)}`,
            )
          }
        } else if (transactionType === "subscription") {
          setSuccessMessage(`You've successfully subscribed to the ${planName} plan!`)
        } else if (transactionType === "advertisement") {
          setSuccessMessage(`Your service "${planName}" is now being advertised!`)
        } else {
          setSuccessMessage("Payment completed successfully! You can now track your provider.")
        }

        setIsSuccessModalOpen(true)
      }, 2000)
    }
  }

  const handlePayMongoPayment = async () => {
    let paymentAmount: number

    if (paymentMethod === "onhand") {
      paymentAmount = calculateDownpayment()
    } else {
      paymentAmount = calculateFinalTotalWithTax()
    }

    console.log("[v0] PayMongo payment calculation:", {
      paymentMethod,
      amount,
      totalAmount,
      appliedCoupon: appliedCoupon?.code,
      calculatedAmount: calculateFinalTotalWithTax(),
      finalPaymentAmount: paymentAmount,
    })

    if (!paymentAmount || paymentAmount <= 0 || isNaN(paymentAmount)) {
      console.log("[v0] Invalid amount detected:", { amount, totalAmount, paymentAmount, paymentMethod })
      setSuccessMessage("Please enter a valid amount. Amount must be a positive number.")
      setIsSuccessModalOpen(true)
      setIsProcessing(false)
      return
    }

    setIsProcessing(true)

    try {
      console.log("[v0] Initiating PayMongo payment for amount:", paymentAmount, "Payment method:", paymentMethod)

      const paymentDescription =
        paymentMethod === "onhand"
          ? `${transactionType === "booking" ? "Event Planning" : "Service Payment"} - Down Payment (50%)`
          : transactionType === "booking"
            ? "Event Planning"
            : "Service Payment"

      const response = await fetch("http://localhost:3000/api/paymongo-create-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentAmount,
          description: paymentDescription,
          success_url: `http://localhost:3000/api/payment-redirect?bookingId=${bookingId}&transactionType=${transactionType}&paymentMethod=${paymentMethod}`,
          failure_url: `http://localhost:5173/transaction?status=failed&bookingId=${bookingId}&transactionType=${transactionType}&paymentMethod=${paymentMethod}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("PayMongo response:", data)

      if (!data.checkoutUrl) {
        throw new Error("No checkout URL received from PayMongo")
      }

      console.log("[v0] Opening PayMongo in new tab:", data.checkoutUrl)
      const newWindow = window.open(
        data.checkoutUrl,
        "_blank",
        "width=900,height=700,scrollbars=yes,resizable=yes,location=yes,status=yes",
      )

      if (newWindow) {
        setPaymongoWindow(newWindow)
        setIsWaitingForPayment(true)
        setIsProcessing(false)

        newWindow.focus()

        console.log("[v0] PayMongo tab opened, waiting for payment completion...")
        console.log("[v0] Note: Payment will only be considered successful if tab is open for at least 30 seconds")
      } else {
        throw new Error("Failed to open PayMongo payment window. Please allow popups and try again.")
      }
    } catch (error) {
      console.error("Error initiating PayMongo payment:", error)
      setSuccessMessage(
        `Failed to initiate PayMongo payment: ${error instanceof Error ? error.message : String(error)}`,
      )
      setIsSuccessModalOpen(true)
      setIsProcessing(false)
    }
  }

  const updateBookingAfterPayMongoSuccess = async (bookingId: string, paymentMethod: string) => {
    try {
      console.log("Updating booking payment status:", { bookingId, paymentMethod })

      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Authentication token not found.")
        return
      }

      if (appliedCoupon) {
        try {
          const couponResponse = await fetch("http://localhost:3000/api/coupons/apply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              code: appliedCoupon.code,
              bookingId: bookingId,
            }),
          })

          if (couponResponse.ok) {
            console.log("Coupon applied to booking successfully after PayMongo payment")
          } else {
            console.error("Failed to apply coupon to booking after PayMongo payment")
          }
        } catch (couponError) {
          console.error("Error applying coupon to booking:", couponError)
        }
      }

      const finalAmount = calculateFinalTotalWithTax()
      console.log("[v0] Updating booking with final amount:", finalAmount)

      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/payment-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "active",
          paymentComplete: true,
          paymentMethod: paymentMethod,
          totalRate: finalAmount, // Send the final discounted amount
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update booking payment status on backend.")
      }

      const updatedBooking = await response.json()
      console.log("Booking payment status updated successfully after PayMongo:", updatedBooking)
      setBookingStatus("active")
    } catch (error) {
      console.error("Error updating booking payment status after PayMongo success:", error)
    }
  }

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)

    if (transactionType === "subscription" || transactionType === "advertisement") {
      const urlParams = new URLSearchParams(window.location.search)
      const planParam = urlParams.get("plan")

      if (planParam) {
        window.location.href = `${redirectUrl}?upgradedTier=${planParam}`
      } else {
        window.location.href = redirectUrl
      }
    } else {
      const bookingInfo = {
        id: bookingId,
        status: "active",
        paymentComplete: true,
        paymentMethod: paymentMethod,
        timestamp: new Date().getTime(),
      }

      localStorage.setItem("recentBookingPayment", JSON.stringify(bookingInfo))
      localStorage.setItem("openBookingsDrawer", "true")
      window.location.href = "/"
    }
  }

  const handleTrackProvider = () => {
    setIsSuccessModalOpen(false)

    const trackingInfo = {
      id: bookingId,
      status: "active",
      paymentComplete: true,
      paymentMethod: paymentMethod,
      trackProvider: true,
      finalAmount: calculateTotalAmount(),
      originalAmount: originalAmount,
      appliedCoupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            discount: appliedCoupon.discountValue,
            discountAmount: getDiscountAmount(),
          }
        : null,
      timestamp: new Date().getTime(),
    }

    localStorage.setItem("recentBookingPayment", JSON.stringify(trackingInfo))
    localStorage.setItem("openBookingsDrawer", "true")
    window.location.href = "/"
  }

  const goBack = () => {
    navigate(-1)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const getCouponCompanyId = (coupon: Coupon): string => {
    if (typeof coupon.companyId === "object" && coupon.companyId !== null) {
      const extractedId = coupon.companyId._id
      console.log("[v0] Extracted company ID from object:", {
        couponCode: coupon.code,
        rawCompanyId: coupon.companyId,
        extractedId: extractedId,
        extractedType: typeof extractedId,
      })
      return extractedId
    }
    console.log("[v0] Company ID is already a string:", {
      couponCode: coupon.code,
      companyId: coupon.companyId,
      companyIdType: typeof coupon.companyId,
    })
    return coupon.companyId as string
  }

  const handleApplyCoupon = async () => {
    setCouponError("")

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    if (!currentCompanyId) {
      setCouponError("Unable to determine service provider. Please try again.")
      return
    }

    const bookingAmount = originalAmount || totalAmount

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setCouponError("Authentication required. Please log in.")
        return
      }

      const response = await fetch("http://localhost:3000/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          companyId: currentCompanyId,
          bookingAmount: bookingAmount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setCouponError(data.message || "Invalid coupon code")
        return
      }

      if (appliedCoupon?.code === data.coupon.code) {
        setCouponError("This coupon is already applied")
        return
      }

      if (!originalAmount && !appliedCoupon) {
        setOriginalAmount(totalAmount)
      }

      setAppliedCoupon(data.coupon)
      setCouponCode("")

      const newTotal = calculateTotalAmountWithCoupon(data.coupon)
      setTotalAmount(newTotal)
      setAmount(newTotal.toString())
      console.log("[v0] Coupon applied, updated totalAmount to:", newTotal)

      if (bookingId) {
        try {
          const updateResponse = await fetch(`http://localhost:3000/api/bookings/${bookingId}/update-amount`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              totalRate: newTotal,
            }),
          })

          if (updateResponse.ok) {
            console.log("[v0] Backend booking amount updated successfully to:", newTotal)
          } else {
            console.error("[v0] Failed to update backend booking amount")
          }
        } catch (updateError) {
          console.error("[v0] Error updating backend booking amount:", updateError)
        }
      }

      console.log("Coupon applied successfully:", data)
    } catch (error) {
      console.error("Error validating coupon:", error)
      setCouponError("Failed to validate coupon. Please try again.")
    }
  }

  const calculateTotalAmountWithCoupon = (coupon: Coupon | null) => {
    const baseAmount = originalAmount || totalAmount
    if (coupon) {
      let discountAmount = 0
      if (coupon.discountType === "percentage") {
        discountAmount = (baseAmount * coupon.discountValue) / 100
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount
        }
      } else {
        discountAmount = coupon.discountValue
      }
      // Ensure the discount doesn't make the amount negative
      const calculatedDiscount = Math.max(0, discountAmount)
      return Math.max(0, baseAmount - calculatedDiscount)
    }
    return baseAmount
  }

  const handleSelectCoupon = async (coupon: Coupon) => {
    if (getCouponCompanyId(coupon) !== currentCompanyId) {
      return
    }

    setCouponCode(coupon.code)
    setCouponError("")
  }

  const handleRemoveCoupon = async () => {
    if (appliedCoupon) {
      setAppliedCoupon(null)
      if (originalAmount) {
        setTotalAmount(originalAmount)
        setAmount(originalAmount.toString())
        console.log("[v0] Coupon removed, reset totalAmount to:", originalAmount)

        if (bookingId) {
          try {
            const token = localStorage.getItem("token")
            if (!token) {
              console.error("[v0] No auth token found")
              return
            }

            const updateResponse = await fetch(`http://localhost:3000/api/bookings/${bookingId}/update-amount`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                totalRate: originalAmount,
              }),
            })

            if (updateResponse.ok) {
              console.log("[v0] Backend booking amount restored to original:", originalAmount)
            } else {
              console.error("[v0] Failed to restore backend booking amount")
            }
          } catch (updateError) {
            console.error("[v0] Error restoring backend booking amount:", updateError)
          }
        }
      }
    }
  }

  const calculateTotalAmount = () => {
    const baseAmount = originalAmount || totalAmount
    if (appliedCoupon) {
      let discountAmount = 0
      if (appliedCoupon.discountType === "percentage") {
        discountAmount = (baseAmount * appliedCoupon.discountValue) / 100
        if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
          discountAmount = appliedCoupon.maxDiscount
        }
      } else {
        discountAmount = appliedCoupon.discountValue
      }
      // Ensure the discount doesn't make the amount negative
      const calculatedDiscount = Math.max(0, discountAmount)
      return Math.max(0, baseAmount - calculatedDiscount)
    }
    return baseAmount
  }

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0
    const baseAmount = originalAmount || totalAmount
    let discountAmount = 0
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (baseAmount * appliedCoupon.discountValue) / 100
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount
      }
    } else {
      discountAmount = appliedCoupon.discountValue
    }
    // Ensure the discount amount is not negative
    return Math.max(0, discountAmount)
  }

  const TAX_RATE = 0.12
  const calculateTaxAmount = () => {
    const subtotal = calculateTotalAmount()
    return subtotal * TAX_RATE
  }

  const calculateFinalTotalWithTax = () => {
    const subtotal = calculateTotalAmount()
    const tax = calculateTaxAmount()
    return subtotal + tax
  }

  const calculateDownpayment = () => {
    const totalWithTax = calculateFinalTotalWithTax()
    return totalWithTax * 0.5
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setIsSliding(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsSliding(false)
      }, 300)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setIsSliding(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsSliding(false)
      }, 300)
    }
  }

  const getStepConfig = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Review your booking",
          description:
            "Kindly double-check your booking details and service provider information before continuing. The downpayment record will be sent to company owners to build mutual trust and help prevent any issues, while the remaining balance will only be released once the service has been completed.",
        }
      case 2:
        return {
          title: "Payment Breakdown",
          description:
            "Review your payment summary and apply any available coupons or vouchers. Please note that the total amount shown is not final, as additional charges may apply on the day of service depending on the specific requirements or adjustments made.",
        }
      case 3:
        return {
          title: "Complete your payment",
          description:
            "Choose your preferred payment method to complete the transaction. You may cancel at any time, or it will automatically cancelled if no payment is processed within the first 12 hours of booking after acceptance.",
        }
      default:
        return {
          title: "Review your booking",
          description: "Please review your booking details and service provider information before proceeding.",
        }
    }
  }

  return (
    <div className="min-h-screen bg-white/90 text-black">
      <style>{keyframes}</style>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <button
          onClick={goBack}
          className="flex items-center text-gray-700 hover:text-gray-400 cursor-pointer mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === currentStep
                      ? "bg-sky-500 text-white"
                      : step < currentStep
                        ? "bg-sky-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < currentStep ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-colors ${step < currentStep ? "bg-sky-500" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <div className="flex flex-col justify-center items-center text-center mb-6">
            <h1 className="text-2xl font-medium mb-2 text-gray-700">{getStepConfig().title}</h1>
            <p className="text-[14.5px] mb-8 text-gray-500/80 font-normal">{getStepConfig().description}</p>
          </div>

          <div className={`transition-all duration-300 ${isSliding ? "slide-out" : "slide-in"}`}>
            {/* Step 1: Review your booking */}
            {currentStep === 1 && (
              <div>
                {seller ? (
                  <div className="mb-8 p-6 bg-transparent border border-blue-200/90 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Company Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-700">Name</p>
                        <p className="text-gray-800 font-medium">{seller.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-700">Location</p>
                        <p className="text-gray-800 font-medium">{seller.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-700">Rating</p>
                        <p className="text-yellow-500">{"★".repeat(seller.rating)}</p>
                      </div>
                      <div>
                        <p className="text-gray-700">Reviews</p>
                        <p className="text-gray-800 font-medium">{seller.reviews}M reviews</p>
                      </div>
                      {seller.description && (
                        <div className="col-span-2">
                          <p className="text-gray-700">Description</p>
                          <p className="text-gray-800">{seller.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-6 bg-gray-300/70 rounded-lg text-center">
                    <p className="text-gray-700">No service provider information available</p>
                  </div>
                )}

                {transactionType === "booking" && bookingDetails && (
                  <div className="mb-13 p-6 bg-transparent border border-blue-200/90 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Booking Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-gray-700">Service</p>
                        <p className="text-gray-800 font-medium">{bookingDetails.service}</p>
                      </div>
                      {bookingDetails.serviceType && (
                        <div>
                          <p className="text-gray-700">Service Type</p>
                          <p className="text-gray-800 font-medium">{bookingDetails.serviceType}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-700">Date</p>
                        <p className="text-gray-800 font-medium">{formatDate(bookingDetails.date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-700">Location</p>
                        <p className="text-gray-800 font-medium">{bookingDetails.location}</p>
                      </div>
                      {bookingDetails.workerCount && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-sky-500" />
                          <div>
                            <p className="text-gray-700">Workers</p>
                            <p className="text-gray-800 font-medium">
                              {bookingDetails.workerCount} worker{bookingDetails.workerCount > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      )}
                      {bookingDetails.estimatedTime && (
                        <div>
                          <p className="text-gray-700">Estimated Time</p>
                          <p className="text-gray-800 font-medium">{bookingDetails.estimatedTime}</p>
                        </div>
                      )}
                    </div>

                    {bookingDetails.distance && (
                      <div className="flex items-center mb-4">
                        <MapPin className="h-4 w-4 mr-2 text-sky-500" />
                        <span className="text-gray-700">Distance: {bookingDetails.distance} km</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment Breakdown */}
            {currentStep === 2 && (
              <div>
                <div className="mb-8 p-6  rounded-lg bg-transparent border border-blue-200/90">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Payment Summary</h2>

                  {transactionType === "subscription" ? (
                    <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
                      <p className="text-gray-700">{planName} Subscription (Monthly)</p>
                      <p className="text-gray-800 font-medium">₱{(originalAmount || totalAmount).toFixed(2)}</p>
                    </div>
                  ) : bookingDetails ? (
                    <>
                      <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
                        <p className="text-gray-700">Base Service Rate</p>
                        <p className="text-gray-800 font-medium">
                          ₱{(bookingDetails.baseRate || seller?.startingRate || 0).toLocaleString()}
                        </p>
                      </div>

                      {(bookingDetails.distanceCharge ||
                        (bookingDetails.distance && (seller?.ratePerKm || bookingDetails.distance > 0))) && (
                        <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
                          <p className="text-gray-700">
                            Distance Charge ({bookingDetails.distance?.toFixed(1) || "0"} km × ₱
                            {seller?.ratePerKm || "20"})
                          </p>
                          <p className="text-gray-800 font-medium">
                            ₱
                            {(
                              bookingDetails.distanceCharge ||
                              (bookingDetails.distance && seller?.ratePerKm
                                ? bookingDetails.distance * seller.ratePerKm
                                : 0)
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
                      <p className="text-gray-700">Service Fee</p>
                      <p className="text-xl text-gray-800 font-bold">
                        ₱{(originalAmount || totalAmount).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4 text-green-600">
                      <p className="font-medium">
                        Coupon Discount ({appliedCoupon.code} -{" "}
                        {appliedCoupon.discountType === "percentage"
                          ? `${appliedCoupon.discountValue}% off`
                          : `₱${appliedCoupon.discountValue} off`}
                        )
                      </p>
                      <p className="font-medium">-₱{getDiscountAmount().toFixed(2)}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
                    <p className="text-gray-700">Subtotal</p>
                    <p className="text-gray-800 font-medium">₱{calculateTotalAmount().toFixed(2)}</p>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
                    <p className="text-gray-700">VAT (12%)</p>
                    <p className="text-gray-800 font-medium">₱{calculateTaxAmount().toFixed(2)}</p>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
                    <p className="text-gray-700 font-bold">Total Amount</p>
                    <div className="text-right">
                      {appliedCoupon && (originalAmount || totalAmount) && (
                        <p className="text-sm text-gray-500 line-through">
                          ₱{(originalAmount || totalAmount).toLocaleString()}
                        </p>
                      )}
                      <p className="text-xl text-gray-800 font-bold">₱{calculateFinalTotalWithTax().toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <p className="text-gray-700 font-medium">Downpayment (50%)</p>
                    <p className="text-lg text-sky-500 font-semibold">₱{calculateDownpayment().toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-13 p-6 bg-transparent rounded-lg border border-blue-200/90">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Coupon / Voucher</h2>

                  {!appliedCoupon ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                        >
                          Apply
                        </button>
                      </div>

                      {couponError && <p className="text-red-500 text-sm">{couponError}</p>}

                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Available Coupons:
                        </p>

                        {isLoadingCoupons ? (
                          <div className="text-center py-4 text-gray-500">Loading coupons...</div>
                        ) : userCoupons.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">No coupons available</div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                            {userCoupons.map((coupon) => {
                              const couponCompanyId = getCouponCompanyId(coupon)
                              const isApplicable = couponCompanyId === currentCompanyId

                              console.log("[v0] Coupon comparison debug:", {
                                couponCode: coupon.code,
                                couponCompanyId: couponCompanyId,
                                couponCompanyIdType: typeof couponCompanyId,
                                currentCompanyId: currentCompanyId,
                                currentCompanyIdType: typeof currentCompanyId,
                                isApplicable: isApplicable,
                                strictEquality: couponCompanyId === currentCompanyId,
                                looseEquality: couponCompanyId == currentCompanyId,
                                companyName: coupon.companyName,
                              })

                              const isExpired = new Date(coupon.expiresAt) < new Date()
                              const isUsed = coupon.isUsed
                              const isDisabled = !isApplicable || isExpired || isUsed

                              return (
                                <div
                                  key={coupon._id}
                                  onClick={() => !isDisabled && handleSelectCoupon(coupon)}
                                  className={`p-3 rounded-lg border transition-all ${
                                    isDisabled
                                      ? "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed"
                                      : "bg-white border-green-300 hover:border-green-500 hover:shadow-md cursor-pointer"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span
                                          className={`font-mono text-sm font-bold ${
                                            isDisabled ? "text-gray-500" : "text-green-700"
                                          }`}
                                        >
                                          {coupon.code}
                                        </span>
                                        {!isApplicable && (
                                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                            Different Company
                                          </span>
                                        )}
                                        {isExpired && (
                                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                            Expired
                                          </span>
                                        )}
                                        {isUsed && (
                                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                            Used
                                          </span>
                                        )}
                                      </div>
                                      <p className={`text-xs ${isDisabled ? "text-gray-500" : "text-gray-600"}`}>
                                        {coupon.description}
                                      </p>
                                      <p className={`text-xs mt-1 ${isDisabled ? "text-gray-400" : "text-gray-500"}`}>
                                        Company: {coupon.companyName}
                                      </p>
                                      {coupon.minPurchase > 0 && (
                                        <p className={`text-xs ${isDisabled ? "text-gray-400" : "text-gray-500"}`}>
                                          Min. purchase: ₱{coupon.minPurchase}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <span className={`font-bold ${isDisabled ? "text-gray-500" : "text-green-600"}`}>
                                        {coupon.discountType === "percentage"
                                          ? `${coupon.discountValue}% OFF`
                                          : `₱${coupon.discountValue} OFF`}
                                      </span>
                                      {coupon.discountType === "percentage" && coupon.maxDiscount && (
                                        <p className={`text-xs ${isDisabled ? "text-gray-400" : "text-gray-500"}`}>
                                          Max: ₱{coupon.maxDiscount}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className={isDisabled ? "text-gray-400" : "text-gray-500"}>
                                      Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                                    </span>
                                    {isApplicable && !isExpired && !isUsed && (
                                      <span className="text-green-600 font-medium">Click to apply</span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <div>
                          <p className="font-medium text-green-800">Coupon Applied!</p>
                          <p className="text-sm text-green-600">
                            {appliedCoupon.code} -{" "}
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discountValue}% off`
                              : `₱${appliedCoupon.discountValue} off`}
                          </p>
                          <p className="text-xs text-green-600 mt-1">You saved ₱{getDiscountAmount().toFixed(2)}!</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Complete your payment */}
            {currentStep === 3 && (
              <div>
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Payment Method</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "onhand" ? "border-sky-300 bg-sky-500/10" : "border-gray-400 hover:border-gray-500"}`}
                      onClick={() => handlePaymentMethodChange("onhand")}
                    >
                      <div className="flex items-center">
                        <DollarSign className="h-6 w-6 mr-3 text-gray-400" />
                        <span className="text-gray-700">Cash on Hand</span>
                      </div>
                    </div>
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "paymongo" ? "border-sky-300 bg-sky-500/10" : "border-gray-400 hover:border-gray-500"}`}
                      onClick={() => handlePaymentMethodChange("paymongo")}
                    >
                      <div className="flex items-center">
                        <DollarSign className="h-6 w-6 mr-3 text-gray-400" />
                        <span className="text-gray-700">PayMongo (Online Payment)</span>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === "onhand" && (
                    <div className="bg-blue-50 p-6 rounded-lg mb-8 animate-fadeIn">
                      <h3 className="text-[17.4px] font-medium mb-4 text-gray-700">
                        Hybrid Payment - Down Payment Required
                      </h3>
                      <p className="text-gray-600 text-[14.9px] mb-3">
                        You will need to make a down payment of{" "}
                        <strong>₱{calculateDownpayment().toLocaleString()}</strong> (50% of total amount) through our
                        PayMongo online payment system to proceed.
                      </p>
                      <p className="text-gray-600 text-[14.9px]">
                        The remaining balance can be paid directly to the service provider. For a more convenient and
                        hassle-free process, consider using the full PayMongo payment option.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!paymentMethod || (paymentMethod === "wallet" && !selectedWallet) || isProcessing}
                      className={`mt-5 mb-[-70px] px-8 py-3 rounded-full font-medium transition-all ${
                        !paymentMethod || (paymentMethod === "wallet" && !selectedWallet) || isProcessing
                          ? "bg-sky-200 text-gray-100 cursor-not-allowed"
                          : "bg-sky-500 text-white hover:bg-sky-600"
                      }`}
                    >
                      {isProcessing ? "Processing..." : "Complete Payment"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`mt-[-11px] px-6 py-3 rounded-full w-45 font-medium transition-colors ${
                currentStep === 1
                  ? "bg-sky-200 text-gray-100 cursor-not-allowed"
                  : "bg-sky-500 text-white hover:bg-sky-600 cursor-pointer"
              }`}
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="mt-[-11px] px-8 py-3 w-45 rounded-full font-medium bg-sky-500 text-white hover:bg-sky-600 cursor-pointer transition-colors"
              >
                Next
              </button>
            ) : (
              <button></button>
            )}
          </div>
        </div>
      </div>

      {isWaitingForPayment && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 animate-pulse">
                <DollarSign className="h-10 w-10 text-blue-500" />
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Complete Payment in New Tab</h3>

              <p className="text-gray-600 mb-6">
                Please complete your payment in the PayMongo tab that just opened. This page will automatically update
                when payment is successful.
              </p>

              <button
                onClick={() => {
                  setIsWaitingForPayment(false)
                  if (paymongoWindow && !paymongoWindow.closed) {
                    paymongoWindow.close()
                  }
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div
            className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
            style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-pulse"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
                Payment Successful!
              </h3>

              <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}>
                {successMessage}
              </p>

              {transactionType === "booking" ? (
                <button
                  onClick={handleTrackProvider}
                  className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium shadow-sm hover:bg-blue-600 active:scale-95 transition-all duration-200 flex items-center gap-2"
                  style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
                >
                  <MapPin className="h-5 w-5" />
                  Track Service
                </button>
              ) : (
                <button
                  onClick={handleSuccessModalClose}
                  className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium shadow-sm hover:bg-blue-600 active:scale-95 transition-all duration-200"
                  style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transaction