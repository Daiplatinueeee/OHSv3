interface RecaptchaVerificationResult {
  success: boolean
  message?: string
}

export async function verifyRecaptchaClient(token: string): Promise<RecaptchaVerificationResult> {
  try {
    const response = await fetch("http://localhost:3000/api/verify-recaptcha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recaptchaToken: token }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Client-side API error:", errorData)
      return { success: false, message: errorData.message || "Backend verification failed." }
    }

    const data: RecaptchaVerificationResult = await response.json()
    return data
  } catch (error: any) {
    console.error("Client-side fetch error for reCAPTCHA verification:", error)
    return { success: false, message: `Network error: ${error.message}` }
  }
}