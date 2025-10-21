import { useEffect, useState } from "react" // Import useState for isMobile

interface SecondSectionProps {
  hoveredTeamMember: string
  handleTeamMemberHover: (memberName: string) => void
  handleTeamMemberLeave: () => void
  getCurrentImage: () => string
  imageTransitioning: boolean
}

function SecondSection({
  hoveredTeamMember,
  handleTeamMemberHover,
  handleTeamMemberLeave,
  getCurrentImage,
  imageTransitioning,
}: SecondSectionProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      // Define what "mobile" means for this context, e.g., screen width less than md breakpoint
      setIsMobile(window.innerWidth < 768) // Tailwind's 'md' breakpoint is 768px
    }

    // Set initial state
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  // Function to handle click on team member names for mobile
  const handleMobileClick = (memberName: string) => {
    if (hoveredTeamMember === memberName) {
      // If the same member is clicked again, "un-hover" it
      handleTeamMemberLeave()
    } else {
      // Otherwise, "hover" the new member
      handleTeamMemberHover(memberName)
    }
  }

  return (
    <section
      data-section="who-we-are"
      className="relative min-h-screen bg-white text-gray-600 py-8 px-4 sm:py-16 sm:px-8 md:px-16 lg:px-20 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]"
    >
      <div className="max-w-7xl mx-auto mt-8 sm:mt-12 md:mt-16">
        <div className="pb-4 sm:pb-8">
          <h2 className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">WHO WE ARE</h2>
        </div>

        <div>
          <div className="pr-0 md:pr-8">
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-[55px] lg:text-[55px] font-medium tracking-[-0.02em] leading-tight uppercase">
                WELCOME TO THE GREATEST ONLINE
                <br />
                <span className="text-sky-500">HOME SERVICE </span>
                PLATFORM
              </h1>

              {/* Adjusted flex container for responsiveness */}
              <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-12 mt-8 md:mt-16 md:ml-40 text-justify">
                {/* Text content block */}
                <div className="w-full md:w-[25rem]">
                  <p className="text-[13px] tracking-[0.02em] leading-[1.6] uppercase">
                    Handy Go was born out of a simple idea to make home services easier. During a time when many
                    struggled to find a more reliable help for repairs, cleaning, and maintenance, we saw the need for a
                    trusted platform that connects skilled professionals with homeowners.
                  </p>

                  <p className="text-[13px] tracking-[0.02em] leading-[1.6] uppercase mt-4 sm:mt-6">
                    What started as a small initiative has grown into a full-service online home solution. Whether it's
                    a quick repair or a complex project, Handy Go is here to deliver smooth, affordable, and dependable
                    service right when you need it most.
                  </p>

                  <p className="text-[13px] tracking-[0.02em] leading-[1.6] uppercase mt-4 sm:mt-6">
                    HANDY GO WAS DEVELOPED BY A DEDICATED TEAM OF SIX MEMBERS:{" "}
                    <span
                      className="cursor-pointer hover:text-sky-600 transition-colors duration-300 text-sky-500"
                      // Conditionally apply event handlers based on isMobile
                      {...(isMobile
                        ? { onClick: () => handleMobileClick("KIMBERLY BARON CAÑON AS PROJECT MANAGER") }
                        : {
                            onMouseEnter: () => handleTeamMemberHover("KIMBERLY BARON CAÑON AS PROJECT MANAGER"),
                            onMouseLeave: handleTeamMemberLeave,
                          })}
                    >
                      KIMBERLY BARON CAÑON AS PROJECT MANAGER
                    </span>
                    ,{" "}
                    <span
                      className="cursor-pointer hover:text-sky-600 transition-colors duration-300 text-sky-500"
                      {...(isMobile
                        ? { onClick: () => handleMobileClick("KATHLEEN REPUNTE AS DOCUMENTOR") }
                        : {
                            onMouseEnter: () => handleTeamMemberHover("KATHLEEN REPUNTE AS DOCUMENTOR"),
                            onMouseLeave: handleTeamMemberLeave,
                          })}
                    >
                      KATHLEEN REPUNTE AS ASSISTANT DOCUMENTOR
                    </span>
                    ,{" "}
                    <span
                      className="cursor-pointer hover:text-sky-600 transition-colors duration-300 text-sky-500"
                      {...(isMobile
                        ? { onClick: () => handleMobileClick("VINCE EDWARD CAÑEDO MAÑACAP AS DEVELOPER") }
                        : {
                            onMouseEnter: () => handleTeamMemberHover("VINCE EDWARD CAÑEDO MAÑACAP AS DEVELOPER"),
                            onMouseLeave: handleTeamMemberLeave,
                          })}
                    >
                      VINCE EDWARD CAÑEDO MAÑACAP AS DEVELOPER
                    </span>
                    ,{" "}
                    <span
                      className="cursor-pointer hover:text-sky-600 transition-colors duration-300 text-sky-500"
                      {...(isMobile
                        ? { onClick: () => handleMobileClick("KYLE SELLOTE AS DEVELOPER") }
                        : {
                            onMouseEnter: () => handleTeamMemberHover("KYLE SELLOTE AS DEVELOPER"),
                            onMouseLeave: handleTeamMemberLeave,
                          })}
                    >
                      KYLE SELLOTE AS SYSTEM ANALYST
                    </span>
                    ,{" "}
                    <span
                      className="cursor-pointer hover:text-sky-600 transition-colors duration-300 text-sky-500"
                      {...(isMobile
                        ? { onClick: () => handleMobileClick("BART JUAREZ AS SYSTEM ANALYST") }
                        : {
                            onMouseEnter: () => handleTeamMemberHover("BART JUAREZ AS SYSTEM ANALYST"),
                            onMouseLeave: handleTeamMemberLeave,
                          })}
                    >
                      BART JUAREZ AS SYSTEM TESTER
                    </span>
                    , AND{" "}
                    <span
                      className="cursor-pointer hover:text-sky-600 transition-colors duration-300 text-sky-500"
                      {...(isMobile
                        ? { onClick: () => handleMobileClick("JOSH VINCENT S. ALMENDRAS AS DOCUMENTOR") }
                        : {
                            onMouseEnter: () => handleTeamMemberHover("JOSH VINCENT S. ALMENDRAS AS DOCUMENTOR"),
                            onMouseLeave: handleTeamMemberLeave,
                          })}
                    >
                      JOSH VINCENT S. ALMENDRAS AS LEADING DOCUMENTOR.
                    </span>
                  </p>
                </div>
                {/* Image content block */}
                <div className="flex bg-sky-300 relative overflow-hidden w-full md:w-auto md:ml-60 justify-center">
                  {/* Cascading Wipe Animation Overlays */}
                  <div
                    className={`absolute inset-0 bg-sky-300 z-10 transition-transform duration-500 ease-out ${imageTransitioning ? "translate-x-0" : "translate-x-full"}`}
                    style={{ transformOrigin: "left" }}
                  ></div>
                  <div
                    className={`absolute inset-0 bg-sky-400 z-20 transition-transform duration-400 ease-out delay-100 ${imageTransitioning ? "translate-x-0" : "translate-x-full"}`}
                    style={{ transformOrigin: "left" }}
                  ></div>
                  <div
                    className={`absolute inset-0 bg-sky-500 z-30 transition-transform duration-300 ease-out delay-200 ${imageTransitioning ? "translate-x-0" : "translate-x-full"}`}
                    style={{ transformOrigin: "left" }}
                  ></div>

                  <img
                    src={getCurrentImage() || "/placeholder.svg"}
                    alt="Team member"
                    className={`w-full h-auto max-w-[425px] max-h-[425px] md:w-[425px] md:h-[425px] object-cover transition-all duration-700 ease-in-out transform ${hoveredTeamMember ? "brightness-1.1 contrast-1.05 scale-102" : "brightness-1 contrast-1 scale-100"} ${imageTransitioning ? "opacity-0" : "opacity-100"}`}
                  />
                </div>
              </div>

              <div className="mt-8 sm:mt-16 flex items-center">
                <button className="flex items-center text-xs sm:text-sm font-medium tracking-[0.2em] uppercase hover:text-sky-500 transition-colors duration-300">
                  SEE MORE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SecondSection