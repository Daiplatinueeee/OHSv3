require("dotenv").config()

const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const fetch = require("node-fetch")

const app = express()
const PORT = process.env.RECAPTCHA_SERVER_PORT || 3000 

app.use(cors())
app.use(bodyParser.json())

app.post(
  "/api/verify-recaptcha", 
  async (req, res) => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    const recaptchaToken = req.body.recaptchaToken

    if (!secretKey) {
      console.error("Backend: RECAPTCHA_SECRET_KEY is NOT set.")
      res.status(500).json({ success: false, message: "Server configuration error: reCAPTCHA secret key missing." })
      return
    }

    if (!recaptchaToken) {
      res.status(400).json({ success: false, message: "reCAPTCHA token missing." })
      return
    }

    try {
      const params = new URLSearchParams()
      params.append("secret", secretKey)
      params.append("response", recaptchaToken)

      const googleResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      })

      const data = await googleResponse.json()

      if (data.success) {
        res.json({ success: true, message: "reCAPTCHA verified successfully!" })
      } else {
        console.error("Backend: reCAPTCHA verification failed with error codes:", data["error-codes"])
        res.status(400).json({ success: false, message: "reCAPTCHA verification failed.", errors: data["error-codes"] })
      }
    } catch (error) {
      console.error("Backend: Error during reCAPTCHA verification:", error)
      res.status(500).json({ success: false, message: "Internal server error during reCAPTCHA verification." })
    }
  },
)

app.listen(PORT, () => {
  console.log(`reCAPTCHA verification server running on port ${PORT}`)
})