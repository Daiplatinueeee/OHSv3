import { Advertise } from "../models/advertise.js"

export const saveAdvertisement = async (req, res) => {
    try {
        const { userId } = req.params
        const { plan, description, bannerImage, userName, expiration, price } = req.body

        if (!plan || !description || !bannerImage || !userName || !expiration || !price) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: plan, description, bannerImage, userName, expiration, price",
            })
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            })
        }

        const newAdvertisement = new Advertise({
            userId,
            userName,
            plan,
            description,
            bannerImage,
            price,
            expiration: new Date(expiration),
            status: "active",
        })

        await newAdvertisement.save()

        return res.status(201).json({
            success: true,
            message: "Advertisement saved successfully",
            advertisement: newAdvertisement,
        })
    } catch (error) {
        console.error("Error saving advertisement:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

export const showAdvertisement = async (req, res) => {
    try {
        const currentDate = new Date()

        const advertisements = await Advertise.find({
            status: "active",
            expiration: { $gte: currentDate }
        }).sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            advertisements: advertisements
        })
    } catch (error) {
        console.error("Error fetching advertisements:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}