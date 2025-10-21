import logo1 from "@/assets/Home/undraw_choose_5kz4.png"

function MoreFeatures() {
  return (
    <div className="flex justify-center mb-12">
      <div className="px-6 py-3 text-sm text-gray-600 flex items-center gap-2 flex-col">
        <div className="mt-2 text-[16px]">
          Good Morning <span className="text-sm font-medium text-sky-500">User, </span>{" "}
          Do not forgot to check out our top-rated services!
        </div>
        <div className="flex flex-col items-center gap-1 mt-6 text-gray-600">
          <img
            src={logo1 || "/placeholder.svg"}
            alt={logo1}
            width={250}
            height={250}
            className="mb-8"
          />
          <span className="text-[14px]">We have latest services you could ask for!</span>
          <span className="text-sm font-medium text-sky-500">Today Check, 2 PM : 2025</span>
        </div>
        <div className="mt-2 text-[15px]">
          Discover all of our services with over <span className="text-sm font-medium text-sky-500">500,000,000</span>{" "}
          companies and counting!
        </div>
      </div>
    </div>
  )
}

export default MoreFeatures