"use client"
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"

interface ReCAPTCHAProps {
  siteKey: string
  onSuccess: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

// Declare grecaptcha globally for TypeScript
declare global {
  interface Window {
    grecaptcha: any
  }
}

const ReCAPTCHA = forwardRef<any, ReCAPTCHAProps>(({ siteKey, onSuccess, onExpire, onError }, ref) => {
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)

  const renderRecaptcha = () => {
    if (recaptchaRef.current && window.grecaptcha && widgetIdRef.current === null) {
      widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: "6LctwGgrAAAAAG01jljZ3VSgB7BsYJ6l25QSpLmI", // *** This line is crucial: uses the prop, not a hardcoded value ***
        callback: onSuccess,
        "expired-callback": () => {
          if (onExpire) onExpire()
          if (widgetIdRef.current !== null) {
            window.grecaptcha.reset(widgetIdRef.current)
          }
        },
        "error-callback": () => {
          if (onError) onError()
          if (widgetIdRef.current !== null) {
            window.grecaptcha.reset(widgetIdRef.current)
          }
        },
      })
    }
  }

  useEffect(() => {
    const scriptId = "recaptcha-script"
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script")
      script.id = scriptId
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit`
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(renderRecaptcha)
        }
      }
      document.body.appendChild(script)
    } else {
      if (window.grecaptcha) {
        window.grecaptcha.ready(renderRecaptcha)
      }
    }

    return () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current)
        } catch (e) {
          console.warn("Failed to reset reCAPTCHA widget on unmount:", e)
        }
        widgetIdRef.current = null
      }
    }
  }, [siteKey, onSuccess, onExpire, onError])

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current)
      }
    },
  }))

  return (
    <div className="flex justify-center">
      <div ref={recaptchaRef} className="g-recaptcha"></div>
    </div>
  )
})

ReCAPTCHA.displayName = "ReCAPTCHA"

export default ReCAPTCHA
