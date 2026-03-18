import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import vid from "@/assets/Home/FREE STOCK FOOTAGE- Traffic on the streets.mp4"

gsap.registerPlugin(ScrollTrigger)

const TITLE = "Welcome to HandyGo"

const Welcome = () => {
  const sectionRef   = useRef<HTMLDivElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)
  const lettersRef   = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const section   = sectionRef.current
    const videoWrap = videoWrapRef.current
    const overlay   = overlayRef.current
    if (!section || !videoWrap || !overlay) return

    // Attach to the GSAP locomotive scroller from Proposition.tsx
    const scroller =
      (document.querySelector(".overflow-y-scroll") as HTMLElement) || window

    const letters = lettersRef.current.filter(Boolean) as HTMLSpanElement[]

    // ── Master timeline — scrubbed to scroll, section pinned ──
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        scroller,
        start: "top top",
        end: "+=200%",     // 2 extra viewport heights of scroll budget
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
      },
    })

    // Phase 1 (0 → 0.55): video zooms out — scale 1 → 0.52, corners round up
    tl.fromTo(
      videoWrap,
      { scale: 1, borderRadius: "0px" },
      { scale: 0.52, borderRadius: "28px", ease: "none", duration: 0.55 },
      0
    )

    // Background overlay fades in as the video shrinks away from edges
    tl.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, ease: "none", duration: 0.5 },
      0
    )

    // Phase 2 (0.08 → 0.78): each letter fades + slides up, staggered across scroll
    letters.forEach((letter, i) => {
      const start = 0.08 + (i / letters.length) * 0.6
      tl.fromTo(
        letter,
        { opacity: 0, y: 30, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", ease: "power2.out", duration: 0.2 },
        start
      )
    })

    // Phase 3 (0.82 → 1): video subtly fades as text completes — draws eye to title
    tl.to(
      videoWrap,
      { opacity: 0.3, ease: "none", duration: 0.18 },
      0.82
    )

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      className="relative"
      // Extra height gives the scroll-trigger its budget (pinned, so no visual jump)
      style={{ height: "100vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white flex items-center justify-center">

        {/* Radial vignette overlay — fades in as video shrinks, warm light tone */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, #f5f2ee 85%)",
            opacity: 0,
          }}
        />

        {/* ── Video wrapper — GSAP scales this ── */}
        <div
          ref={videoWrapRef}
          className="absolute inset-0 overflow-hidden origin-center"
          style={{ willChange: "transform, border-radius, opacity" }}
        >
          <video
            src={vid}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* ── Title — letters revealed one by one in sync with scroll ── */}
        <div className="relative z-20 px-6 pointer-events-none select-none text-center">
          <h1
            style={{
              fontSize: "clamp(2.6rem, 6.5vw, 6.5rem)",
              fontWeight: 0,
              color: "#1a1a1a",
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
              textShadow: "0 2px 24px rgba(245,242,238,0.8)",
            }}
          >
            {TITLE.split("").map((char, i) => (
              <span
                key={i}
                ref={(el) => { lettersRef.current[i] = el }}
                style={{
                  display: "inline-block",
                  opacity: 0,
                  marginRight: char === " " ? "0.28em" : "0",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          {/* Thin underline accent */}
          <div
            className="mx-auto mt-4"
            style={{
              width: "3rem",
              height: "1px",
              background: "rgba(26,26,26,0.25)",
            }}
          />
        </div>

        {/* ── Scroll hint ── */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span
            style={{
              color: "rgba(26,26,26,0.4)",
              fontSize: "0.65rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              fontFamily: "system-ui",
            }}
          >
            Scroll
          </span>
          <div
            className="animate-bounce"
            style={{ width: "1px", height: "2.5rem", background: "rgba(26,26,26,0.2)" }}
          />
        </div>

      </div>
    </div>
  )
}

export default Welcome