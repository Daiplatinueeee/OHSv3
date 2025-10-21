import React from "react"
import { motion } from "framer-motion"
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa"
import { WindArrowDown } from "lucide-react"

import handyVideo from "@/assets/Dark brown eye opening macro   Stock Video Footage.mp4"

const HeroSection: React.FC = () => {
    const scrollToSection = () => {
        const section = document.querySelector(".second-section")
        if (section) {
            section.scrollIntoView({ behavior: "smooth" })
        }
    }

    return (
        <section className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center bg-black text-white">
            {/* Background Video */}
            <video
                src={handyVideo}
                autoPlay
                muted
                loop
                playsInline
                onLoadedMetadata={(e) => {
                    const video = e.currentTarget
                    video.currentTime = 1 // ⏩ Skip first 1 second
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
            />


            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <motion.div
                className="relative z-10 flex flex-col items-center text-center px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                {/* Logo & Title */}
                <div className="flex items-center gap-2 text-3xl font-medium mb-2">
                    <i className="bx bx-home-smile text-indigo-400 text-4xl"></i>
                    <span>HandyGo</span>
                    <WindArrowDown className="w-8 h-8 mb-2" />
                </div>

                <h1 className="text-3xl md:text-5xl font-medium text-white drop-shadow-md mb-3">
                    The Future of <span className="text-sky-400">Home Services</span>
                </h1>
                <p className="text-gray-300 text-sm md:text-muted mb-6 mt-2">
                    Connecting You with Trusted Professionals, Anytime, Anywhere.
                </p>

                {/* Social Icons */}
                <div className="flex gap-4 mb-6 text-xl">
                    <a href="https://github.com" target="_blank" className="hover:text-sky-400">
                        <FaGithub />
                    </a>
                    <a href="https://linkedin.com" target="_blank" className="hover:text-sky-400">
                        <FaLinkedin />
                    </a>
                    <a href="https://twitter.com" target="_blank" className="hover:text-sky-400">
                        <FaTwitter />
                    </a>
                    <a href="mailto:hello@example.com" className="hover:text-sky-400">
                        <FaEnvelope />
                    </a>
                </div>

                {/* Button */}
                <motion.button
                    onClick={scrollToSection}
                    className="bg-sky-500 hover:bg-sky-600 cursor-pointer transition px-6 py-3 rounded-full text-white font-medium"
                >
                    Explore More
                </motion.button>

                {/* Scroll Arrow */}
                <div
                    className="absolute top-70 cursor-pointer flex flex-col items-center"
                    onClick={scrollToSection}
                >
                    <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center items-start">
                        <motion.div
                            className="w-1 h-2 bg-white rounded-full mt-2"
                            animate={{ y: [0, 6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>

                    <div className="mt-3 flex flex-col items-center space-y-1">
                        {[...Array(3)].map((_, i) => (
                            <motion.span
                                key={i}
                                className="block w-1.5 h-1.5 bg-white rounded-full"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ✅ Copyright Icon */}
            <div className="absolute bottom-4 left-6 z-40 group">
                <div className="absolute bottom-full mb-2 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white text-black text-xs font-medium px-3 py-2 rounded-lg shadow-md border border-gray-200 whitespace-nowrap">
                        @kareemabdulah12, Link: https://www.youtube.com/watch?v=N_XcW6jmbIA
                        <div className="absolute top-full left-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                </div>
                <div className="bg-transparent text-white duration-300 flex items-center justify-center cursor-default">
                    <span className="text-lg font-bold">&copy;</span>
                </div>
            </div>


        </section>
    )
}

export default HeroSection