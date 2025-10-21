import { Crown, CheckCircle2 } from "lucide-react"
import type { SubscriptionInfo } from "./bookings-data"

interface SubscriptionInfoCardProps {
  subscription: SubscriptionInfo
  currentServicesCount: number
  onOpenPlansModal: () => void
}

export default function SubscriptionInfoCard({
  subscription,
  currentServicesCount,
  onOpenPlansModal,
}: SubscriptionInfoCardProps) {
  const usagePercentage =
    subscription.maxServices === Number.POSITIVE_INFINITY
      ? 100
      : Math.min(100, (currentServicesCount / subscription.maxServices) * 100)

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-medium text-gray-700 mb-2">Subscription</h3>
        <button
          onClick={onOpenPlansModal}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          Change Plan
        </button>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`${`w-10 h-10 rounded-full flex items-center justify-center mr-3
                ${
                  subscription.tier === "free"
                    ? "bg-gray-200"
                    : subscription.tier === "mid"
                      ? "bg-blue-100"
                      : subscription.tier === "premium"
                        ? "bg-purple-100"
                        : "bg-amber-100"
                }
              `}`}
            >
              <Crown className={`${`h-5 w-5 ${subscription.color}`}`} />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">{subscription.name} Plan</h4>
              <p className="text-gray-600 text-sm">
                {subscription.maxServices === Number.POSITIVE_INFINITY
                  ? "Unlimited services"
                  : `Up to ${subscription.maxServices} services`}
              </p>
            </div>
          </div>
          {/* Current Plan Badge */}
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Current Plan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Usage Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h5 className="text-sm font-medium text-gray-500 mb-2">Service Usage</h5>
            <div className="flex items-baseline mb-2">
              <span className="text-3xl font-bold text-gray-900">{currentServicesCount}</span>
              <span className="text-lg text-gray-500 mx-1">/</span>
              <span className="text-lg text-gray-500">
                {subscription.maxServices === Number.POSITIVE_INFINITY ? "∞" : subscription.maxServices}
              </span>
              <span className="text-gray-500 ml-1 text-sm">services</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`${`h-2.5 rounded-full ${
                  usagePercentage >= 90
                    ? "bg-red-500"
                    : subscription.tier === "free"
                      ? "bg-gray-500"
                      : subscription.tier === "mid"
                        ? "bg-blue-500"
                        : subscription.tier === "premium"
                          ? "bg-purple-500"
                          : "bg-amber-500"
                }`}`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            {usagePercentage >= 90 && subscription.maxServices !== Number.POSITIVE_INFINITY && (
              <p className="text-xs text-red-500 mt-2">You're almost at your service limit!</p>
            )}
          </div>

          {/* Billing Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h5 className="text-sm font-medium text-gray-500 mb-2">Billing</h5>
            {subscription.price > 0 ? (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  ${subscription.price}
                  <span className="text-lg text-gray-500">
                    /{subscription.billingCycle === "Monthly" ? "mo" : "yr"}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">Next billing: {subscription.nextBillingDate}</p>
              </>
            ) : (
              <p className="text-3xl font-bold text-gray-900">Free</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Your plan renews {subscription.billingCycle.toLowerCase()}.</p>
          </div>
        </div>
      </div>
    </div>
  )
}