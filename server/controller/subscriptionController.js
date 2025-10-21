import { Subscription } from "../models/subscription.js"

export const saveSubscription = async (req, res, io) => {
  try {
    const { userId } = req.params
    const { tier, maxServices, name, color, price, billingCycle, nextBillingDate } = req.body

    if (!userId || !tier) {
      return res.status(400).json({ message: "userId and tier are required" })
    }

    let subscription = await Subscription.findOne({ userId })

    if (subscription) {
      // Update existing subscription
      subscription.tier = tier
      subscription.maxServices = maxServices
      subscription.name = name
      subscription.color = color
      subscription.price = price
      subscription.billingCycle = billingCycle
      subscription.nextBillingDate = nextBillingDate
      await subscription.save()
    } else {
      // Create new subscription
      subscription = new Subscription({
        userId,
        tier,
        maxServices,
        name,
        color,
        price,
        billingCycle,
        nextBillingDate,
      })
      await subscription.save()
    }

    res.status(200).json({
      message: "Subscription saved successfully",
      subscription,
    })
  } catch (error) {
    console.error("Error saving subscription:", error)
    res.status(500).json({ message: "Failed to save subscription", error: error.message })
  }
}

export const getSubscription = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ message: "userId is required" })
    }

    const subscription = await Subscription.findOne({ userId })

    if (!subscription) {
      // Return default free plan if no subscription exists
      return res.status(200).json({
        subscription: {
          tier: "free",
          maxServices: 3,
          name: "Free Plan",
          color: "text-gray-600",
          price: 0,
          billingCycle: "Monthly",
          nextBillingDate: "Free Plan",
        },
      })
    }

    res.status(200).json({ subscription })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    res.status(500).json({ message: "Failed to fetch subscription", error: error.message })
  }
}