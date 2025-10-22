export interface Service {
  id: number
  name: string
  price: number
  description: string
  hasNotification: boolean
  notificationCount?: number
  image: string
  chargePerKm: number
}

export interface Booking {
  userId(arg0: string, userId: any): unknown
  paymentMethod: boolean
  _id: number
  serviceId: number
  serviceName: string
  customerName: string
  date: string
  time: string
  location: string
  distanceCharge: number
  total: number
  modeOfPayment: string
  status: "active" | "pending" | "completed"
  price: number
  image: string
}

export type SubscriptionTier = "free" | "mid" | "premium" | "unlimited"

export interface SubscriptionInfo {
  tier: SubscriptionTier
  maxServices: number
  name: string
  color: string
  price: number
  billingCycle: string
  nextBillingDate: string
}

export const subscriptionPlans = [
  {
    tier: "free",
    name: "Freebie",
    description: "Ideal for individuals who need quick access to basic features.",
    maxServices: 3,
    price: 0,
    yearlyPrice: 0,
    color: "bg-white",
    textColor: "text-gray-900",
    features: [
      { text: "Create up to a maximum of 5 services", included: true },
      { text: "Effortless booking and service tracking", included: true },
      { text: "Integrated DeepSeek R1 support", included: true },
      { text: "Enhanced OHS Chat Premium experience", included: true },
      { text: "Exclusive preview of advertised services", included: true },
      { text: "Exclusive preview of advertised services", included: true },
      { text: "Exclusive preview of advertised services", included: true },
    ],
  },
  {
    tier: "mid",
    name: "Professional",
    description: "Ideal for individuals who need advanced features and tools for client work.",
    maxServices: 15,
    price: 499,
    yearlyPrice: 5999,
    color: "bg-sky-500",
    textColor: "text-white",
    features: [
      { text: "Create up to a maximum of 15 services", included: true },
      { text: "Effortless booking and service tracking", included: true },
      { text: "Integrated DeepSeek R1 support", included: true },
      { text: "Enhanced OHS Chat Premium experience", included: true },
      { text: "Exclusive preview of advertised services", included: true },
      { text: "Exclusive preview of advertised services", included: true },
      { text: "Exclusive preview of advertised services", included: true },
    ],
  },
  {
    tier: "premium",
    name: "Enterprise",
    description: "Ideal for businesses who need personalized services and security for large teams.",
    maxServices: 99,
    price: 999,
    yearlyPrice: 9999,
    color: "bg-white",
    textColor: "text-gray-900",
    features: [
      { text: "Create up to a maximum of 99 services", included: true },
      { text: "Effortless booking and service tracking", included: true },
      { text: "Integrated DeepSeek R1 support", included: true },
      { text: "Enhanced OHS Chat Premium experience", included: true },
      { text: "Exclusive preview of advertised services", included: true },
      { text: "Exclusive preview of advertised services", included: true },
      { text: "Exclusive preview of advertised services", included: true },
    ],
  },
  {
    tier: "unlimited",
    name: "Ultimate",
    description: "For large organizations requiring comprehensive features and dedicated support.",
    maxServices: 999,
    price: 9999,
    yearlyPrice: Math.round(200 * 12 * 0.75),
    color: "bg-amber-100",
    textColor: "text-amber-600",
    features: [
      { text: "Unlimited services", included: true },
      { text: "Enterprise analytics", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom branding", included: true },
      { text: "Team accounts", included: true },
      { text: "API access", included: true },
    ],
  },
]