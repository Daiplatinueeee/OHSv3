const serviceCategoryDescriptions = {
  "Plumbing Services":
    "Essential water and drainage system services including repairs, installations, and maintenance for pipes, fixtures, and water-related appliances in Philippine homes.",

  "Handyman Services":
    "General home repair and maintenance services covering multiple trades, perfect for small to medium repairs and installations around the house.",

  "Home Cleaning Services":
    "Comprehensive cleaning solutions from regular maintenance to deep cleaning, including specialized services for tropical climate challenges in the Philippines.",

  "Pest Control Services":
    "Professional pest management services targeting common Philippine household pests including tropical insects, rodents, and disease-carrying vectors.",

  "Landscaping Services":
    "Garden and outdoor space design, maintenance, and enhancement services adapted to tropical Philippine climate and native plant species.",

  "Massage Services":
    "Therapeutic and relaxation massage services including traditional Filipino healing practices and modern wellness techniques.",

  "Roofing Services":
    "Roof installation, repair, and maintenance services designed to withstand Philippine weather conditions including typhoons and heavy rainfall.",

  "Interior Design":
    "Professional interior design and decoration services to create functional and beautiful living spaces suited to Filipino lifestyle and preferences.",

  "Technology Services":
    "Home and office technology installation, repair, and setup services including internet, security systems, and smart home solutions.",

  "Automotive Services":
    "Vehicle maintenance, repair, and detailing services for cars, motorcycles, and other vehicles commonly used in the Philippines.",

  "Childcare Services":
    "Professional care services for children, elderly, and pets, providing peace of mind for Filipino families with busy schedules.",

  "Electrical Services":
    "Licensed electrical work including installations, repairs, and safety inspections to ensure safe and reliable power systems in Philippine homes.",

  "Air Conditioning Services":
    "Essential cooling system services for the tropical Philippine climate, including installation, repair, and maintenance of various AC units.",

  "Security Services":
    "Home and business security solutions including physical security, surveillance systems, and access control for Philippine properties.",

  "Appliance Services":
    "Repair and maintenance services for household appliances commonly used in Filipino homes, from refrigerators to rice cookers.",

  "Construction & Renovation":
    "Building and renovation services for Philippine homes, including traditional and modern construction techniques and materials.",

  "Water Services":
    "Water system installation, maintenance, and quality services essential for reliable water supply in Philippine households.",

  "Laundry Services":
    "Professional laundry and garment care services, particularly valuable in the humid Philippine climate where drying can be challenging.",

  "Moving Services":
    "Relocation and moving services for households and businesses, including local and long-distance moves within the Philippines.",

  "Event Services":
    "Complete event planning and execution services for Filipino celebrations, from intimate gatherings to large festivities.",

  "Health & Wellness":
    "Home-based health and wellness services bringing medical care and wellness treatments directly to Filipino families.",
}

const serviceSubcategoriesData = {
  "Plumbing Services": [
    { name: "Leak Repairs" },
    { name: "Pipe Installation" },
    { name: "Toilet Repairs" },
    { name: "Water Heater Installation" },
    { name: "Faucet Replacement" },
    { name: "Shower Installation" },
    { name: "Water Pump Installation" },
    { name: "Septic Tank Cleaning" },
    { name: "Grease Trap Cleaning" },
    { name: "Water Tank Cleaning" },
    { name: "Pipe Unclogging" },
  ],

  "Handyman Services": [
    { name: "Plumbing Fixes" },
    { name: "Door & Window Repairs" },
    { name: "Furniture Assembly" },
    { name: "Wall Mounting" },
    { name: "Ceiling Fan Installation" },
    { name: "Light Fixture Installation" },
    { name: "Cabinet Installation" },
    { name: "Tile Repairs" },
    { name: "Drywall Repairs" },
    { name: "Painting Touch-ups" },
  ],

  "Home Cleaning Services": [
    { name: "Regular Cleaning" },
    { name: "Deep Cleaning" },
    { name: "Move-In/Move-Out Cleaning" },
    { name: "Carpet Cleaning" },
    { name: "Window Cleaning" },
    { name: "Septic Tank Declogging" },
    { name: "Drain Cleaning" },
    { name: "Gutter Cleaning" },
    { name: "Pressure Washing" },
    { name: "Upholstery Cleaning" },
    { name: "Mattress Cleaning" },
    { name: "Aircon Cleaning" },
    { name: "Kitchen Deep Clean" },
    { name: "Bathroom Deep Clean" },
    { name: "Post-Construction Cleanup" },
  ],

  "Pest Control Services": [
    { name: "Rodent Control" },
    { name: "Bed Bug Treatment" },
    { name: "Mosquito Control" },
    { name: "Cockroach Extermination" },
    { name: "Ant Control" },
    { name: "Termite Treatment" },
    { name: "Fly Control" },
    { name: "Spider Control" },
    { name: "General Pest Inspection" },
  ],

  "Landscaping Services": [
    { name: "Lawn Maintenance" },
    { name: "Garden Design" },
    { name: "Tree Services" },
    { name: "Plant Installation" },
    { name: "Irrigation System Installation" },
    { name: "Hedge Trimming" },
    { name: "Soil Preparation" },
    { name: "Garden Maintenance" },
    { name: "Tree Pruning" },
    { name: "Landscape Lighting" },
  ],

  "Massage Services": [
    { name: "Swedish Massage" },
    { name: "Deep Tissue Massage" },
    { name: "Hot Stone Massage" },
    { name: "Filipino Traditional Massage (Hilot)" },
    { name: "Reflexology" },
    { name: "Prenatal Massage" },
    { name: "Sports Massage" },
  ],

  "Roofing Services": [
    { name: "Roof Inspection" },
    { name: "Roof Repair" },
    { name: "Roof Replacement" },
    { name: "Gutter Installation" },
    { name: "Roof Waterproofing" },
    { name: "Typhoon Damage Repair" },
    { name: "Metal Roofing Installation" },
    { name: "Roof Insulation" },
  ],

  "Interior Design": [
    { name: "Design Consultation" },
    { name: "Room Styling" },
    { name: "Color Consultation" },
    { name: "Space Planning" },
    { name: "Furniture Selection" },
    { name: "Lighting Design" },
    { name: "Window Treatment" },
  ],

  "Technology Services": [
    { name: "Home Wifi Setup" },
    { name: "Office Network Installation" },
    { name: "Smart Home Installation" },
    { name: "CCTV Installation" },
    { name: "Computer Repair" },
    { name: "TV Mounting" },
    { name: "Sound System Setup" },
  ],

  "Automotive Services": [
    { name: "Car Engine Repair" },
    { name: "Brake System Check" },
    { name: "Oil Change" },
    { name: "Car Wash & Detailing" },
    { name: "Tire Services" },
    { name: "Battery Replacement" },
    { name: "Aircon Service" },
  ],

  "Childcare Services": [
    { name: "Babysitting" },
    { name: "Nanny Services" },
    { name: "After-School Care" },
    { name: "Elderly Care" },
    { name: "Pet Sitting" },
    { name: "Tutoring Services" },
  ],

  "Electrical Services": [
    { name: "Electrical Repairs" },
    { name: "Wiring Installation" },
    { name: "Circuit Breaker Replacement" },
    { name: "Outlet Installation" },
    { name: "Generator Installation" },
    { name: "Solar Panel Installation" },
    { name: "Electrical Safety Inspection" },
  ],

  "Air Conditioning Services": [
    { name: "Aircon Installation" },
    { name: "Aircon Repair" },
    { name: "Aircon Maintenance" },
    { name: "Aircon Cleaning" },
    { name: "Freon Refill" },
    { name: "Duct Cleaning" },
  ],

  "Security Services": [
    { name: "Security Guard Services" },
    { name: "CCTV Installation" },
    { name: "Alarm System Installation" },
    { name: "Door Lock Installation" },
    { name: "Security Consultation" },
  ],

  "Appliance Services": [
    { name: "Refrigerator Repair" },
    { name: "Washing Machine Repair" },
    { name: "Microwave Repair" },
    { name: "TV Repair" },
    { name: "Water Heater Repair" },
    { name: "Rice Cooker Repair" },
    { name: "Appliance Installation" },
  ],

  "Construction & Renovation": [
    { name: "Home Renovation" },
    { name: "Kitchen Renovation" },
    { name: "Bathroom Renovation" },
    { name: "Flooring Installation" },
    { name: "Painting Services" },
    { name: "Tiling Services" },
    { name: "Concrete Work" },
    { name: "Carpentry Services" },
  ],

  "Water Services": [
    { name: "Water Tank Installation" },
    { name: "Water Pump Repair" },
    { name: "Well Drilling" },
    { name: "Water Filtration System" },
    { name: "Pool Maintenance" },
    { name: "Water Quality Testing" },
  ],

  "Laundry Services": [
    { name: "Wash & Fold" },
    { name: "Dry Cleaning" },
    { name: "Ironing Services" },
    { name: "Pickup & Delivery" },
    { name: "Comforter Cleaning" },
    { name: "Shoe Cleaning" },
  ],

  "Moving Services": [
    { name: "Local Moving" },
    { name: "Long Distance Moving" },
    { name: "Packing Services" },
    { name: "Storage Services" },
    { name: "Furniture Moving" },
    { name: "Office Relocation" },
  ],

  "Event Services": [
    { name: "Event Planning" },
    { name: "Catering Services" },
    { name: "Party Equipment Rental" },
    { name: "Photography Services" },
    { name: "Entertainment Services" },
    { name: "Decoration Services" },
  ],

  "Health & Wellness": [
    { name: "Home Nursing" },
    { name: "Physical Therapy" },
    { name: "Medical Equipment Rental" },
    { name: "Health Screening" },
    { name: "Vaccination Services" },
    { name: "Mental Health Counseling" },
  ],
}

// Extract main category names (keys of the object)
const mainCategoryNames = Object.keys(serviceSubcategoriesData)

// Extract subcategory names grouped by their main category
const subcategoryNamesByMainCategory = {}
for (const mainCat in serviceSubcategoriesData) {
  subcategoryNamesByMainCategory[mainCat] = serviceSubcategoriesData[mainCat].map((sub) => sub.name)
}

export { mainCategoryNames, subcategoryNamesByMainCategory, serviceCategoryDescriptions }
