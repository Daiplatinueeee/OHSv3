import { useState, useEffect } from "react";
import {
  MapPin,
  X,
  Star,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Flag,
  ChevronRight,
  Home,
  Briefcase,
} from "lucide-react";
import type { CompanyDetails } from "./company-data";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyDetails | null;
}

const CompanyModal = ({ isOpen, onClose, company }: CompanyModalProps) => {
  const [activeTab, setActiveTab] = useState("about");
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState<number | null>(null);

  // Handle animation on open/close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle modal close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  if (!company) return null;

  // Fallback image for missing images
  const fallbackImage = "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

  const renderAboutContent = () => (
    <div className="space-y-8 [&>*]:opacity-0 [&>*]:animate-[fadeIn_0.4s_ease-out_forwards]">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm p-8">
        <h3 className="text-2xl font-medium mb-6 text-gray-800">About {company.name}</h3>
        <p className="text-gray-600 leading-relaxed">{company.longDescription || company.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Founded</h4>
            <p className="text-gray-800 flex items-center">
              <Calendar className="h-4 w-4 text-blue-500 mr-2" />
              {company.founded}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Team Size</h4>
            <p className="text-gray-800 flex items-center">
              <Users className="h-4 w-4 text-blue-500 mr-2" />
              {company.employees} employees
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Location</h4>
            <p className="text-gray-800 flex items-center">
              <MapPin className="h-4 w-4 text-blue-500 mr-2" />
              {company.address}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Operating Hours</h4>
            <div className="space-y-2">
              {company.operatingHours.map((hours, index) => (
                <p key={index} className="text-gray-800 flex items-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="font-medium mr-2">{hours.days}:</span> {hours.hours}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm p-8">
        <h3 className="text-2xl font-medium mb-6 text-gray-800">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center p-4 bg-blue-50 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                <p className="text-gray-900 font-medium">{company.phone}</p>
              </div>
            </div>
          </div>
          <div className="group transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center p-4 bg-blue-50 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="text-gray-900 font-medium">{company.email}</p>
              </div>
            </div>
          </div>
          <div className="group transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center p-4 bg-blue-50 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Website</h4>
                <p className="text-gray-900 font-medium">{company.website}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServicesContent = () => (
    <div className="space-y-8 [&>*]:opacity-0 [&>*]:animate-[fadeIn_0.4s_ease-out_forwards]">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm p-8">
        <h3 className="text-2xl font-medium mb-6 text-gray-800">Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {company.services.map((service) => (
            <div
              key={service.id}
              className={`group cursor-pointer rounded-3xl transition-all duration-300 overflow-hidden ${
                activeService === service.id
                  ? "bg-blue-50 scale-[1.02] shadow-md"
                  : "bg-white/60 hover:bg-blue-50/60 hover:scale-[1.01]"
              }`}
              onClick={() => setActiveService(activeService === service.id ? null : service.id)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image || fallbackImage}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h4 className="text-xl font-semibold">{service.name}</h4>
                    <div className="flex items-center mt-1">
                      <span className="font-medium text-white/90">
                        ${service.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 overflow-hidden transition-all duration-300 ${
                activeService === service.id ? "max-h-80" : "max-h-24"
              }`}>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {service.description}
                </p>
                <div className="flex justify-between items-center">
                  <button className="text-blue-500 text-sm font-medium flex items-center transition-all duration-300 hover:text-blue-600 group-hover:translate-x-1">
                    {activeService === service.id ? "Show less" : "Learn more"} 
                    <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${
                      activeService === service.id ? "rotate-90" : ""
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviewsContent = () => (
    <div className="space-y-8 [&>*]:opacity-0 [&>*]:animate-[fadeIn_0.4s_ease-out_forwards]">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h3 className="text-2xl font-medium text-gray-800">Customer Reviews</h3>
            <p className="text-gray-500">See what customers are saying about {company.name}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-4">
            <div className="text-3xl font-bold text-gray-900">{company.rating.toFixed(1)}</div>
            <div>
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(company.rating) ? "fill-current" : ""}`} />
                ))}
              </div>
              <p className="text-gray-500 text-sm">{company.reviews.toLocaleString()} reviews</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = company.customerReviews.filter((r) => Math.floor(r.rating) === rating).length;
            const percentage = (count / company.customerReviews.length) * 100;

            return (
              <div key={rating} className="flex items-center">
                <div className="flex items-center w-16">
                  <span className="text-sm text-gray-600 mr-1">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
                  <div 
                    className="h-2 bg-yellow-400 rounded-full transition-all duration-1000" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right text-sm text-gray-600">{percentage.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <h4 className="text-xl font-medium text-gray-800 mb-4">Recent Reviews</h4>
          <div className="space-y-6">
            {company.customerReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={review.customerImage || fallbackImage}
                      alt={review.customerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium text-gray-900">{review.customerName}</h5>
                      <p className="text-gray-500 text-xs">{review.date}</p>
                    </div>
                    
                    <div className="flex text-yellow-400 my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(review.rating) ? "fill-current" : ""}`} />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 text-sm mt-2">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Content to display based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return renderAboutContent();
      case 'services':
        return renderServicesContent();
      case 'reviews':
        return renderReviewsContent();
      default:
        return renderAboutContent();
    }
  };

  // Only render if open
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div 
        className={`relative w-[95%] h-[90vh] max-w-7xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex transition-all duration-500 ${
          isVisible 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-8"
        }`}
      >
        {/* Left Sidebar */}
        <div className="w-[280px] flex-shrink-0 bg-gray-50/90 backdrop-blur-sm h-full border-r border-gray-200/70 flex flex-col">
          {/* Company Info */}
          <div className="p-6 border-b border-gray-200/70">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-sm mx-auto">
                <img 
                  src={company.logo || fallbackImage} 
                  alt={company.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-1">{company.name}</h2>
            
            <div className="flex justify-center items-center gap-1 text-gray-500 text-sm mb-3">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{company.address.split(',')[0]}</span>
            </div>
            
            <div className="flex justify-center">
              <div className="flex items-center gap-1 bg-blue-50 py-1 px-2 rounded-full">
                <div className="flex text-yellow-400">
                  <Star className="h-3 w-3 fill-current" />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {company.rating.toFixed(1)} ({company.reviews.toLocaleString()})
                </span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab("about")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === "about"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Home className={`h-5 w-5 ${activeTab === "about" ? "text-blue-500" : "text-gray-400"}`} />
                  <span className="font-medium">About</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === "services"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Briefcase className={`h-5 w-5 ${activeTab === "services" ? "text-blue-500" : "text-gray-400"}`} />
                  <span className="font-medium">Services</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === "reviews"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Star className={`h-5 w-5 ${activeTab === "reviews" ? "text-blue-500" : "text-gray-400"}`} />
                  <span className="font-medium">Reviews</span>
                </button>
              </li>
            </ul>
          </nav>
          
          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200/70">
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                <MessageSquare className="h-4 w-4" />
                <span>Message</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors">
                <Flag className="h-4 w-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Cover Photo Header */}
          <div className="h-40 relative overflow-hidden">
            <img 
              src={company.coverPhoto || fallbackImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-2xl font-semibold">{company.name}</h1>
              <p className="text-sm text-white/80 mt-1">{company.description}</p>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 bg-black/20 backdrop-blur-xl p-2 rounded-full hover:bg-black/30 transition-all duration-200 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;