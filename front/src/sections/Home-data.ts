import image1 from "../assets/Home/Elderly Clown Among Vintage Electronics.jpeg"
import image2 from "../assets/Home/Fashion in Motion.jpeg"
import image3 from "../assets/Home/Dramatic Black-and-White Portrait.jpeg"

import service1 from "../assets/Home/s1.jpg"
import service2 from "../assets/Home/s2.jpg"
import service3 from "../assets/Home/s3.jpg"
import service4 from "../assets/Home/s4.jpg"
import service5 from "../assets/Home/s5.jpg"
import service6 from "../assets/services/Indoor Cave Spa.jpeg"
import service7 from "../assets/Home/s7.jpg"
import service8 from "../assets/Home/s8.jpg"

import types1 from "../assets/services/Luxurious Bathroom Design.jpeg"
import types2 from "../assets/services/Modern Minimalist Pipe Installation.jpeg"
import types3 from "../assets/services/Minimalist Bathroom Scene.jpeg"

import types4 from "../assets/services/Inviting Bathroom Counter Design.jpeg"
import types5 from "../assets/services/Mediterranean Doorway.jpeg"

import types6 from "../assets/services/Spotless Serenity_ Capturing the Essence of Household Cleanliness.jpeg"
import types7 from "../assets/services/auto-1006216_960_720.jpg"
import types8 from "../assets/services/Minimalist Interior Design.jpeg"
import types9 from "../assets/services/workplace-5517744_1280.jpg"
import types10 from "../assets/services/Minimalist Window Scene.jpeg"

import types11 from "../assets/services/hamster-1772742_960_720.jpg"
import types12 from "../assets/services/insects-4619045_960_720.jpg"
import types13 from "../assets/services/insects-820484_1280.jpg"

import types14 from "../assets/services/Serene Green Landscape.jpeg"
import types15 from "../assets/services/Serene Residential Greenhouse.jpeg"
import types16 from "../assets/services/Autumn Solitude.jpeg"

import types17 from "../assets/services/Tranquil Beauty Spa Facial.jpeg"
import types18 from "../assets/services/Serene Beauty Spa Facial.jpeg"
import types19 from "../assets/services/Peaceful Wellness Therapy Session.jpeg"

import types20 from "../assets/services/Modern Two-Story House.jpeg"
import types21 from "../assets/services/roof-9004113_1280.jpg"
import types22 from "../assets/services/cottage-768889_1280.jpg"

import types23 from "../assets/services/kitchen-2165756_1280.jpg"
import types24 from "../assets/services/living-room-1835923_1280.jpg"
import types25 from "../assets/services/living-room-2732939_1280.jpg"

import types26 from "../assets/services/Man on Urban Rooftop.jpeg"
import types27 from "../assets/services/Network Devices Setup.jpeg"
import types28 from "../assets/services/Serene Study Session in a Wintry Light-bathed Room.jpeg"

import types29 from "../assets/services/Aviation Maintenance Worker.jpeg"
import types30 from "../assets/services/Vintage Car in Flowers.jpeg"
import types31 from "../assets/services/Mechanical Component Close-Up.jpeg"

export const serviceSubcategories = {
  "Plumbing Services": [
    {
      id: 1,
      name: "Leak Repairs",
      description: "Quick identification and repair of leaks in pipes, faucets, and fixtures to prevent water damage.",
      price: 1500,
      image: types1,
      workerCount: 1,
      estimatedTime: "1-2 hours",
      category: "Plumbing Services", // Added category
    },
    {
      id: 2,
      name: "Pipe Installation",
      description: "Professional installation of new pipes, including PVC, copper, and PEX piping systems.",
      price: 3500,
      image: types2,
      workerCount: 2,
      estimatedTime: "3-5 hours",
      category: "Plumbing Services", // Added category
    },
    {
      id: 3,
      name: "Toilet Repairs",
      description: "Fixing running toilets, replacing flush mechanisms, and addressing leaks at the base.",
      price: 1000,
      image: types3,
      workerCount: 1,
      estimatedTime: "1 hour",
      category: "Plumbing Services", // Added category
    },
  ],
  "Handyman Services": [
    {
      id: 5,
      name: "Plumbing Fixes",
      description: "Minor plumbing repairs including leaky faucets, running toilets, and clogged drains.",
      price: 1300,
      image: types4,
      workerCount: 1,
      estimatedTime: "1-2 hours",
      category: "Handyman Services", // Added category
    },
    {
      id: 6,
      name: "Door & Window Repairs",
      description: "Fixing stuck doors, broken hinges, window tracks, and hardware replacement.",
      price: 950,
      image: types5,
      workerCount: 1,
      estimatedTime: "1-2 hours",
      category: "Handyman Services", // Added category
    },
  ],
  "Home Cleaning Services": [
    {
      id: 12,
      name: "Regular Cleaning",
      description: "Standard cleaning service including dusting, vacuuming, mopping, and bathroom cleaning.",
      price: 2500,
      image: types6,
      workerCount: 2,
      estimatedTime: "2-3 hours",
      category: "Home Cleaning Services", // Added category
    },
    {
      id: 13,
      name: "Deep Cleaning",
      description: "Thorough cleaning of all areas including hard-to-reach places, appliances, and detailed scrubbing.",
      price: 4500,
      image: types7,
      workerCount: 3,
      estimatedTime: "4-6 hours",
      category: "Home Cleaning Services", // Added category
    },
    {
      id: 14,
      name: "Move-In/Move-Out Cleaning",
      description: "Comprehensive cleaning for vacant properties before moving in or after moving out.",
      price: 5000,
      image: types8,
      workerCount: 3,
      estimatedTime: "5-7 hours",
      category: "Home Cleaning Services", // Added category
    },
    {
      id: 15,
      name: "Carpet Cleaning",
      description: "Professional deep cleaning of carpets using hot water extraction and specialized equipment.",
      price: 3000,
      image: types9,
      workerCount: 2,
      estimatedTime: "2-4 hours",
      category: "Home Cleaning Services", // Added category
    },
    {
      id: 16,
      name: "Window Cleaning",
      description: "Interior and exterior window cleaning, including screens, tracks, and sills.",
      price: 2800,
      image: types10,
      workerCount: 2,
      estimatedTime: "2-4 hours",
      category: "Home Cleaning Services", // Added category
    },
  ],
  "Pest Control Services": [
    {
      id: 19,
      name: "Rodent Control",
      description: "Elimination and prevention of mice, rats, and other rodents using traps and exclusion methods.",
      price: 4000,
      image: types11,
      workerCount: 1,
      estimatedTime: "2-3 hours",
      category: "Pest Control Services", // Added category
    },
    {
      id: 20,
      name: "Bed Bug Treatment",
      description: "Comprehensive treatment to eliminate bed bugs from mattresses, furniture, and living spaces.",
      price: 5500,
      image: types12,
      workerCount: 2,
      estimatedTime: "3-4 hours",
      category: "Pest Control Services", // Added category
    },
    {
      id: 21,
      name: "Mosquito Control",
      description: "Yard treatments to reduce mosquito populations and prevent breeding around your home.",
      price: 2800,
      image: types13,
      workerCount: 1,
      estimatedTime: "1-2 hours",
      category: "Pest Control Services", // Added category
    },
  ],
  "Landscaping Services": [
    {
      id: 43,
      name: "Lawn Maintenance",
      description: "Regular lawn care including mowing, edging, and fertilization.",
      price: 2500,
      image: types14,
      workerCount: 2,
      estimatedTime: "2-3 hours",
      category: "Landscaping Services", // Added category
    },
    {
      id: 44,
      name: "Garden Design",
      description: "Custom garden design and installation with expert plant selection.",
      price: 15000,
      image: types15,
      workerCount: 3,
      estimatedTime: "2-3 days",
      category: "Landscaping Services", // Added category
    },
    {
      id: 45,
      name: "Tree Services",
      description: "Professional tree trimming, removal, and maintenance services.",
      price: 8000,
      image: types16,
      workerCount: 3,
      estimatedTime: "4-6 hours",
      category: "Landscaping Services", // Added category
    },
  ],
  "Massage Services": [
    {
      id: 101,
      name: "Swedish Massage",
      description:
        "Relaxing full-body massage using long, flowing strokes to ease muscle tension and promote relaxation.",
      price: 2500,
      image: types17,
      workerCount: 1,
      estimatedTime: "1 hour",
      category: "Massage Services", // Added category
    },
    {
      id: 102,
      name: "Deep Tissue Massage",
      description:
        "Targets chronic muscle tension and knots with deep pressure and slow strokes, ideal for pain relief.",
      price: 3000,
      image: types18,
      workerCount: 1,
      estimatedTime: "1 hour 30 mins",
      category: "Massage Services", // Added category
    },
    {
      id: 103,
      name: "Hot Stone Massage",
      description:
        "Uses heated smooth stones placed on the body to warm and relax muscles, allowing for deeper pressure.",
      price: 3500,
      image: types19,
      workerCount: 1,
      estimatedTime: "1 hour 15 mins",
      category: "Massage Services", // Added category
    },
  ],
  "Roofing Services": [
    {
      id: 49,
      name: "Roof Inspection",
      description: "Thorough roof inspection and maintenance check.",
      price: 2000,
      image: types20,
      workerCount: 1,
      estimatedTime: "1-2 hours",
      category: "Roofing Services", // Added category
    },
    {
      id: 50,
      name: "Roof Repair",
      description: "Professional repair of leaks and damaged roofing.",
      price: 8000,
      image: types21,
      workerCount: 2,
      estimatedTime: "4-8 hours",
      category: "Roofing Services", // Added category
    },
    {
      id: 51,
      name: "Roof Replacement",
      description: "Complete roof replacement with quality materials.",
      price: 35000,
      image: types22,
      workerCount: 4,
      estimatedTime: "2-3 days",
      category: "Roofing Services", // Added category
    },
  ],
  "Interior Design": [
    {
      id: 52,
      name: "Design Consultation",
      description: "Professional interior design consultation and planning.",
      price: 5000,
      image: types23,
      workerCount: 1,
      estimatedTime: "2-3 hours",
      category: "Interior Design", // Added category
    },
    {
      id: 53,
      name: "Room Styling",
      description: "Complete room styling and decoration services.",
      price: 15000,
      image: types24,
      workerCount: 2,
      estimatedTime: "1-2 days",
      category: "Interior Design", // Added category
    },
    {
      id: 54,
      name: "Color Consultation",
      description: "Expert color scheme selection and planning.",
      price: 3000,
      image: types25,
      workerCount: 1,
      estimatedTime: "1-2 hours",
      category: "Interior Design", // Added category
    },
  ],
  "Wifi Installment Services": [
    {
      id: 104,
      name: "Home Wifi Setup",
      description: "Complete setup of home Wi-Fi networks, including router configuration and signal optimization.",
      price: 1500,
      image: types27,
      workerCount: 1,
      estimatedTime: "1-2 hours",
      category: "Wifi Installment Services", // Added category
    },
    {
      id: 105,
      name: "Office Network Installation",
      description: "Installation of robust Wi-Fi networks for offices, including cabling and multiple access points.",
      price: 5000,
      image: types28,
      workerCount: 2,
      estimatedTime: "3-5 hours",
      category: "Wifi Installment Services", // Added category
    },
  ],
  "Mechanic Services": [
    {
      id: 106,
      name: "Car Engine Repair",
      description: "Diagnosis and repair of car engine issues, from minor fixes to major overhauls.",
      price: 8000,
      image: types30,
      workerCount: 2,
      estimatedTime: "4-8 hours",
      category: "Mechanic Services", // Added category
    },
    {
      id: 107,
      name: "Brake System Check",
      description: "Inspection and repair of brake systems, including pad replacement and fluid checks.",
      price: 2500,
      image: types31,
      workerCount: 1,
      estimatedTime: "1-2 hours",
      category: "Mechanic Services", // Added category
    },
  ],
}

export const sellers = {
  "Leak Repairs": [
    {
      id: 1,
      name: "PipeFix Pros",
      totalRating: 4,
      reviews: 1250,
      location: "New York",
      startingRate: 1500,
      ratePerKm: 25,
      badges: ["hot", "top"],
      description: "Expert leak detection and repair with minimal disruption to your home.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 2,
      name: "LeakBusters",
      totalRating: 5,
      reviews: 2100,
      location: "Los Angeles",
      startingRate: 1600,
      ratePerKm: 30,
      badges: ["in demand"],
      description: "Specialized in finding hidden leaks using advanced technology and fixing them permanently.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Pipe Installation": [
    {
      id: 3,
      name: "PipeMasters",
      totalRating: 5,
      reviews: 1800,
      location: "Chicago",
      startingRate: 3500,
      ratePerKm: 35,
      badges: ["top"],
      description: "Professional pipe installation with quality materials and expert craftsmanship.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 4,
      name: "FlowPro Plumbing",
      totalRating: 4,
      reviews: 1200,
      location: "Houston",
      startingRate: 3200,
      ratePerKm: 30,
      badges: ["hot"],
      description: "Comprehensive pipe installation services for new construction and remodels.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Drain Cleaning": [
    {
      id: 5,
      name: "DrainMasters",
      totalRating: 4,
      reviews: 890,
      location: "Chicago",
      startingRate: 1200,
      ratePerKm: 20,
      badges: [],
      description: "Effective drain cleaning using professional-grade equipment for lasting results.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 6,
      name: "FlowFix",
      totalRating: 5,
      reviews: 1050,
      location: "Philadelphia",
      startingRate: 1300,
      ratePerKm: 22,
      badges: ["top"],
      description: "Specialized in clearing stubborn clogs and preventing future blockages.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Toilet Repairs": [
    {
      id: 7,
      name: "ToiletTechs",
      totalRating: 5,
      reviews: 780,
      location: "Phoenix",
      startingRate: 1000,
      ratePerKm: 18,
      badges: ["hot"],
      description: "Fast and reliable toilet repair services with same-day appointments available.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 8,
      name: "FlushMasters",
      totalRating: 4,
      reviews: 650,
      location: "San Diego",
      startingRate: 950,
      ratePerKm: 15,
      badges: [],
      description: "Toilet repair specialists with expertise in all brands and models.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Water Heater Services": [
    {
      id: 9,
      name: "HotWater Pros",
      totalRating: 5,
      reviews: 920,
      location: "Dallas",
      startingRate: 4500,
      ratePerKm: 40,
      badges: ["top", "in demand"],
      description: "Expert water heater installation, repair, and maintenance for all types and brands.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 10,
      name: "HeaterFix",
      totalRating: 4,
      reviews: 780,
      location: "San Antonio",
      startingRate: 4200,
      ratePerKm: 35,
      badges: [],
      description: "Specialized in tankless water heater installation and traditional water heater repairs.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Furniture Assembly": [
    {
      id: 11,
      name: "FixIt All",
      totalRating: 5,
      reviews: 3200,
      location: "San Francisco",
      startingRate: 800,
      ratePerKm: 15,
      badges: ["hot", "in demand"],
      description:
        "Expert furniture assembly with attention to detail. We assemble all types of furniture quickly and correctly.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 12,
      name: "AssembleIt",
      totalRating: 4,
      reviews: 1200,
      location: "Seattle",
      startingRate: 750,
      ratePerKm: 12,
      badges: ["top"],
      description:
        "Specialized in IKEA and other flat-pack furniture assembly. Fast, efficient, and guaranteed satisfaction.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Drywall Repair": [
    {
      id: 13,
      name: "WallFixers",
      totalRating: 5,
      reviews: 980,
      location: "Portland",
      startingRate: 1200,
      ratePerKm: 18,
      badges: ["top"],
      description: "Professional drywall repair and patching. We make damaged walls look like new again.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 14,
      name: "PatchPros",
      totalRating: 4,
      reviews: 750,
      location: "Denver",
      startingRate: 1100,
      ratePerKm: 20,
      badges: [],
      description: "Specializing in drywall patching, texturing, and finishing. Quality repairs at affordable prices.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Painting Services": [
    {
      id: 15,
      name: "ColorMasters",
      totalRating: 5,
      reviews: 2100,
      location: "Austin",
      startingRate: 1500,
      ratePerKm: 22,
      badges: ["hot", "top"],
      description:
        "Professional painting services for interior and exterior projects. We use premium paints and deliver flawless results.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 16,
      name: "BrushStrokes",
      totalRating: 4,
      reviews: 1800,
      location: "Dallas",
      startingRate: 1400,
      ratePerKm: 20,
      badges: ["in demand"],
      description: "Quality painting services with attention to detail. We prep, paint, and clean up thoroughly.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Electrical Repairs": [
    {
      id: 17,
      name: "PowerPros",
      totalRating: 5,
      reviews: 1600,
      location: "Phoenix",
      startingRate: 1800,
      ratePerKm: 25,
      badges: ["top"],
      description:
        "Licensed electricians for all your electrical repair needs. Safe, reliable, and code-compliant work.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 18,
      name: "WireMasters",
      totalRating: 4,
      reviews: 1200,
      location: "Las Vegas",
      startingRate: 1700,
      ratePerKm: 22,
      badges: [],
      description: "Electrical repair specialists with years of experience. We fix it right the first time.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Plumbing Fixes": [
    {
      id: 19,
      name: "QuickFix Plumbing",
      totalRating: 5,
      reviews: 1400,
      location: "Miami",
      startingRate: 1300,
      ratePerKm: 20,
      badges: ["hot"],
      description: "Fast and reliable minor plumbing repairs. We fix leaks, clogs, and other common issues quickly.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 20,
      name: "DrainDoctors",
      totalRating: 4,
      reviews: 950,
      location: "Atlanta",
      startingRate: 1200,
      ratePerKm: 18,
      badges: [],
      description: "Specializing in drain cleaning and minor plumbing repairs. Affordable rates and quality service.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Door & Window Repairs": [
    {
      id: 21,
      name: "DoorDoctors",
      totalRating: 5,
      reviews: 1100,
      location: "Chicago",
      startingRate: 950,
      ratePerKm: 15,
      badges: ["top"],
      description: "Expert door and window repair services. We fix sticking doors, broken hardware, and more.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 22,
      name: "WindowWizards",
      totalRating: 4,
      reviews: 850,
      location: "Boston",
      startingRate: 900,
      ratePerKm: 16,
      badges: [],
      description: "Specializing in window track repairs, hardware replacement, and weatherstripping installation.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Regular Cleaning": [
    {
      id: 23,
      name: "SparkleClean",
      totalRating: 5,
      reviews: 4200,
      location: "Boston",
      startingRate: 2500,
      ratePerKm: 20,
      badges: ["hot", "top", "in demand"],
      description: "Thorough regular cleaning services using eco-friendly products and professional techniques.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 24,
      name: "FreshSpaces",
      totalRating: 4,
      reviews: 2800,
      location: "Miami",
      startingRate: 2300,
      ratePerKm: 22,
      badges: ["hot"],
      description: "Reliable regular cleaning services customized to your specific needs and preferences.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Deep Cleaning": [
    {
      id: 25,
      name: "DeepClean Pros",
      totalRating: 5,
      reviews: 1900,
      location: "Washington DC",
      startingRate: 4500,
      ratePerKm: 25,
      badges: ["top"],
      description: "Comprehensive deep cleaning that reaches every corner and surface in your home.",
      workerCount: 3,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 26,
      name: "ThoroughClean",
      totalRating: 4,
      reviews: 1600,
      location: "Atlanta",
      startingRate: 4200,
      ratePerKm: 23,
      badges: ["in demand"],
      description: "Detailed deep cleaning services that eliminate dirt, grime, and allergens from your home.",
      workerCount: 3,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Move-In/Move-Out Cleaning": [
    {
      id: 27,
      name: "FreshStart Cleaning",
      totalRating: 5,
      reviews: 1500,
      location: "Denver",
      startingRate: 5000,
      ratePerKm: 30,
      badges: ["top"],
      description: "Thorough move-in/move-out cleaning that meets landlord and property management standards.",
      workerCount: 3,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 28,
      name: "CleanSlate",
      totalRating: 4,
      reviews: 1200,
      location: "Portland",
      startingRate: 4800,
      ratePerKm: 28,
      badges: ["hot"],
      description: "Comprehensive cleaning services for vacant properties, ensuring they're ready for new occupants.",
      workerCount: 3,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Carpet Cleaning": [
    {
      id: 29,
      name: "CarpetRevive",
      totalRating: 5,
      reviews: 1300,
      location: "Seattle",
      startingRate: 3000,
      ratePerKm: 25,
      badges: ["top"],
      description: "Professional carpet cleaning that removes deep stains, allergens, and odors.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 30,
      name: "FreshFibers",
      totalRating: 4,
      reviews: 950,
      location: "San Diego",
      startingRate: 2800,
      ratePerKm: 22,
      badges: [],
      description: "Specialized carpet cleaning using hot water extraction and eco-friendly solutions.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Window Cleaning": [
    {
      id: 31,
      name: "ClearView",
      totalRating: 5,
      reviews: 1100,
      location: "Chicago",
      startingRate: 2800,
      ratePerKm: 20,
      badges: ["top"],
      description: "Professional window cleaning for crystal clear results, inside and out.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 32,
      name: "ShineTime",
      totalRating: 4,
      reviews: 850,
      location: "Philadelphia",
      startingRate: 2600,
      ratePerKm: 18,
      badges: [],
      description: "Detailed window cleaning services that leave your windows spotless and streak-free.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "General Pest Control": [
    {
      id: 33,
      name: "PestAway",
      totalRating: 5,
      reviews: 1800,
      location: "Austin",
      startingRate: 3500,
      ratePerKm: 30,
      badges: ["hot"],
      description: "Comprehensive pest control for common household pests with eco-friendly options available.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 34,
      name: "BugBusters",
      totalRating: 4,
      reviews: 1500,
      location: "San Antonio",
      startingRate: 3300,
      ratePerKm: 28,
      badges: ["top"],
      description: "Effective pest control treatments that eliminate current infestations and prevent future ones.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Termite Treatment": [
    {
      id: 35,
      name: "TermiteTerminators",
      totalRating: 5,
      reviews: 1200,
      location: "Phoenix",
      startingRate: 6000,
      ratePerKm: 40,
      badges: ["top", "in demand"],
      description: "Specialized termite treatment and prevention services to protect your home from damage.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 36,
      name: "WoodDefenders",
      totalRating: 4,
      reviews: 950,
      location: "Las Vegas",
      startingRate: 5800,
      ratePerKm: 38,
      badges: [],
      description: "Comprehensive termite control with inspection, treatment, and preventive measures.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Rodent Control": [
    {
      id: 37,
      name: "RodentRid",
      totalRating: 5,
      reviews: 1100,
      location: "Seattle",
      startingRate: 4000,
      ratePerKm: 35,
      badges: ["top"],
      description: "Effective rodent control using humane trapping and exclusion methods.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 38,
      name: "MouseMasters",
      totalRating: 4,
      reviews: 850,
      location: "Portland",
      startingRate: 3800,
      ratePerKm: 32,
      badges: [],
      description: "Comprehensive rodent control services that eliminate current infestations and prevent future ones.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Bed Bug Treatment": [
    {
      id: 39,
      name: "BedBugBanishers",
      totalRating: 5,
      reviews: 980,
      location: "New York",
      startingRate: 5500,
      ratePerKm: 35,
      badges: ["top", "in demand"],
      description: "Specialized bed bug treatment using heat treatment and targeted applications.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 40,
      name: "NightmareNoMore",
      totalRating: 4,
      reviews: 820,
      location: "Chicago",
      startingRate: 5200,
      ratePerKm: 32,
      badges: ["hot"],
      description: "Effective bed bug elimination with follow-up inspections to ensure complete removal.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Mosquito Control": [
    {
      id: 41,
      name: "MosquitoMasters",
      totalRating: 5,
      reviews: 750,
      location: "Miami",
      startingRate: 2800,
      ratePerKm: 25,
      badges: ["top"],
      description: "Yard treatments that significantly reduce mosquito populations around your home.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 42,
      name: "BuzzOff",
      totalRating: 4,
      reviews: 620,
      location: "Houston",
      startingRate: 2600,
      ratePerKm: 22,
      badges: [],
      description: "Effective mosquito control services that target breeding sites and adult mosquitoes.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Lawn Maintenance": [
    {
      id: 43,
      name: "GreenThumb Pro",
      totalRating: 5,
      reviews: 890,
      location: "Portland",
      startingRate: 2500,
      ratePerKm: 20,
      badges: ["top"],
      description: "Expert lawn care services with attention to detail.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 44,
      name: "LawnMasters",
      totalRating: 4,
      reviews: 750,
      location: "Seattle",
      startingRate: 2300,
      ratePerKm: 18,
      badges: ["hot"],
      description: "Professional lawn maintenance with eco-friendly practices.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Garden Design": [
    {
      id: 45,
      name: "Garden Artistry",
      totalRating: 5,
      reviews: 680,
      location: "San Francisco",
      startingRate: 15000,
      ratePerKm: 30,
      badges: ["top", "in demand"],
      description: "Creative garden design solutions for any space.",
      workerCount: 3,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 46,
      name: "EdenCreators",
      totalRating: 4,
      reviews: 520,
      location: "Los Angeles",
      startingRate: 14000,
      ratePerKm: 28,
      badges: [],
      description: "Transforming outdoor spaces into beautiful gardens.",
      workerCount: 3,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Tree Services": [
    {
      id: 47,
      name: "TreeCare Experts",
      totalRating: 5,
      reviews: 450,
      location: "Denver",
      startingRate: 8000,
      ratePerKm: 35,
      badges: ["top"],
      description: "Professional tree care and maintenance services.",
      workerCount: 3,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 48,
      name: "Arbor Masters",
      totalRating: 4,
      reviews: 380,
      location: "Phoenix",
      startingRate: 7500,
      ratePerKm: 32,
      badges: ["hot"],
      description: "Expert tree trimming and removal services.",
      workerCount: 3,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Swedish Massage": [
    {
      id: 49,
      name: "Relaxation Haven",
      totalRating: 5,
      reviews: 920,
      location: "Houston",
      startingRate: 2500,
      ratePerKm: 25,
      badges: ["top", "in demand"],
      description: "Experience ultimate relaxation with our expert Swedish massage therapists.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 50,
      name: "Serene Touch Spa",
      totalRating: 4,
      reviews: 780,
      location: "Dallas",
      startingRate: 2300,
      ratePerKm: 22,
      badges: ["hot"],
      description: "Professional Swedish massage for stress relief and muscle relaxation.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Deep Tissue Massage": [
    {
      id: 51,
      name: "Muscle Melt Studio",
      totalRating: 5,
      reviews: 850,
      location: "Chicago",
      startingRate: 3000,
      ratePerKm: 28,
      badges: ["top"],
      description: "Target deep muscle knots and chronic pain with our specialized deep tissue massage.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 52,
      name: "Therapeutic Hands",
      totalRating: 4,
      reviews: 680,
      location: "Boston",
      startingRate: 2800,
      ratePerKm: 25,
      badges: [],
      description: "Expert deep tissue massage to alleviate tension and improve mobility.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Hot Stone Massage": [
    {
      id: 53,
      name: "Stone Serenity Spa",
      totalRating: 5,
      reviews: 720,
      location: "Atlanta",
      startingRate: 3500,
      ratePerKm: 30,
      badges: ["top"],
      description: "Indulge in a soothing hot stone massage for deep relaxation and muscle relief.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 54,
      name: "Warmth & Wellness",
      totalRating: 4,
      reviews: 580,
      location: "Miami",
      startingRate: 3300,
      ratePerKm: 28,
      badges: ["hot"],
      description: "Experience the therapeutic benefits of hot stone massage from certified therapists.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Roof Inspection": [
    {
      id: 55,
      name: "RoofCheck Pro",
      totalRating: 5,
      reviews: 620,
      location: "Denver",
      startingRate: 2000,
      ratePerKm: 20,
      badges: ["top"],
      description: "Detailed roof inspections and assessments.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 56,
      name: "InspectTech Roofing",
      totalRating: 4,
      reviews: 480,
      location: "Seattle",
      startingRate: 1800,
      ratePerKm: 18,
      badges: [],
      description: "Professional roof inspection services.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Roof Repair": [
    {
      id: 57,
      name: "RoofFix Masters",
      totalRating: 5,
      reviews: 780,
      location: "Portland",
      startingRate: 8000,
      ratePerKm: 35,
      badges: ["top", "in demand"],
      description: "Expert roof repair and maintenance services.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 58,
      name: "LeakStop Pro",
      totalRating: 4,
      reviews: 650,
      location: "Phoenix",
      startingRate: 7500,
      ratePerKm: 32,
      badges: ["hot"],
      description: "Professional roof leak repair services.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Roof Replacement": [
    {
      id: 59,
      name: "RoofRenew Elite",
      totalRating: 5,
      reviews: 890,
      location: "Las Vegas",
      startingRate: 35000,
      ratePerKm: 45,
      badges: ["top"],
      description: "Complete roof replacement and installation services.",
      workerCount: 4,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 60,
      name: "TopTier Roofing",
      totalRating: 4,
      reviews: 720,
      location: "San Diego",
      startingRate: 33000,
      ratePerKm: 42,
      badges: ["in demand"],
      description: "Professional roof replacement with quality materials.",
      workerCount: 4,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Design Consultation": [
    {
      id: 61,
      name: "DesignVision Pro",
      totalRating: 5,
      reviews: 580,
      location: "New York",
      startingRate: 5000,
      ratePerKm: 25,
      badges: ["top"],
      description: "Expert interior design consultation services.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 62,
      name: "StyleSense Design",
      totalRating: 4,
      reviews: 420,
      location: "Los Angeles",
      startingRate: 4800,
      ratePerKm: 22,
      badges: ["hot"],
      description: "Professional interior design planning and consultation.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Room Styling": [
    {
      id: 63,
      name: "SpaceStyle Masters",
      totalRating: 5,
      reviews: 680,
      location: "Miami",
      startingRate: 15000,
      ratePerKm: 35,
      badges: ["top", "in demand"],
      description: "Complete room styling and decoration services.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 64,
      name: "RoomRevive Pro",
      totalRating: 4,
      reviews: 520,
      location: "Chicago",
      startingRate: 14000,
      ratePerKm: 32,
      badges: [],
      description: "Professional room styling and interior decoration.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Color Consultation": [
    {
      id: 65,
      name: "ColorHarmony Pro",
      totalRating: 5,
      reviews: 420,
      location: "San Francisco",
      startingRate: 3000,
      ratePerKm: 20,
      badges: ["top"],
      description: "Expert color scheme selection and planning.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
    {
      id: 66,
      name: "ChromaStyle Design",
      totalRating: 4,
      reviews: 380,
      location: "Boston",
      startingRate: 2800,
      ratePerKm: 18,
      badges: ["hot"],
      description: "Professional color consultation services.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Home Wifi Setup": [
    {
      id: 67,
      name: "ConnectFast",
      totalRating: 5,
      reviews: 300,
      location: "Manila",
      startingRate: 1500,
      ratePerKm: 20,
      badges: ["top"],
      description: "Quick and reliable home Wi-Fi setup. Get connected in no time!",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Office Network Installation": [
    {
      id: 68,
      name: "NetPro Solutions",
      totalRating: 5,
      reviews: 450,
      location: "Makati",
      startingRate: 5000,
      ratePerKm: 30,
      badges: ["in demand"],
      description: "Expert office network installation for seamless business operations.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Car Engine Repair": [
    {
      id: 69,
      name: "EngineFix Pros",
      totalRating: 5,
      reviews: 600,
      location: "Quezon City",
      startingRate: 8000,
      ratePerKm: 40,
      badges: ["top", "hot"],
      description: "Specialized in all types of car engine repairs. Get your vehicle running like new.",
      workerCount: 2,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
  "Brake System Check": [
    {
      id: 70,
      name: "BrakeSafe Auto",
      totalRating: 4,
      reviews: 350,
      location: "Pasig",
      startingRate: 2500,
      ratePerKm: 25,
      badges: [],
      description: "Thorough brake system checks and reliable repairs for your safety.",
      workerCount: 1,
      profilePicture: "/placeholder.svg", // Added this
    },
  ],
}

export const carouselItems = [
  {
    image: image1,
  },
  {
    image: image2,
  },
  {
    image: image3,
  },
]

export const products = [
  {
    id: 1,
    name: "Plumbing Services",
    price: 8000,
    category: "Plumbing",
    image: service1,
    description:
      "Keep your water systems running smoothly with expert plumbing services, from leak repairs to pipe installations.",
  },
  {
    id: 2,
    name: "Handyman Services",
    price: 5499,
    category: "Handyman",
    image: service2,
    description:
      "Get quality home repairs and improvements at HandyGo's discounted rates—fast, affordable, and hassle-free.",
  },
  {
    id: 3,
    name: "Home Cleaning Services",
    price: 12000,
    category: "Cleaning",
    image: service3,
    description: "Enjoy a spotless, sanitized home with deep cleaning, carpet care, and move-in/move-out services.",
  },
  {
    id: 4,
    name: "Pest Control Services",
    price: 29000,
    category: "Pest Control",
    image: service4,
    description: "Keep your space pest-free with expert extermination for termites, rodents, bed bugs, and more.",
  },
  {
    id: 5,
    name: "Landscaping Services",
    price: 15000,
    category: "Outdoor",
    image: service5,
    description: "Transform your outdoor space with professional landscaping, lawn care, and garden design services.",
  },
  {
    id: 6,
    name: "Massage Services",
    price: 10000,
    category: "Wellness",
    image: service6,
    description:
      "Relax and rejuvenate with professional massage services tailored to your needs, from Swedish to deep tissue.",
  },
  {
    id: 7,
    name: "Roofing Services",
    price: 35000,
    category: "Construction",
    image: service7,
    description:
      "Protect your home with expert roof repairs, replacements, and inspections by certified professionals.",
  },
  {
    id: 8,
    name: "Interior Design",
    price: 25000,
    category: "Design",
    image: service8,
    description:
      "Transform your living spaces with customized interior design solutions tailored to your style and budget.",
  },
  {
    id: 9,
    name: "Wifi Installment Services",
    price: 3000,
    category: "Connectivity",
    image: types26,
    description:
      "Professional Wi-Fi setup and network installation for homes and offices, ensuring seamless connectivity.",
  },
  {
    id: 10,
    name: "Mechanic Services",
    price: 4500,
    category: "Automotive",
    image: types29,
    description:
      "Reliable automotive repair and maintenance services for all types of vehicles, right at your doorstep.",
  },
]