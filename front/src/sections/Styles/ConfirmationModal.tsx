import React, { useState } from "react";
import { AlertTriangle, File, Shield, AlertCircle, XCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onSkip: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onContinue, 
  onSkip 
}) => {
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSkipClick = () => {
    setIsWarningModalOpen(true);
  };
  
  const handleGoBack = () => {
    setIsWarningModalOpen(false);
  };
  
  const handleConfirmSkip = () => {
    setIsWarningModalOpen(false);
    onSkip();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      {!isWarningModalOpen ? (
        <div 
          className="mx-auto max-w-4xl w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
          style={{ animation: "fadeIn 0.5s ease-out" }}
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div 
              className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6"
              style={{ animation: "pulse 2s ease-in-out infinite" }}
            >
              <AlertTriangle className="h-10 w-10 text-blue-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
            </div>
            
            <h3 className="text-xl font-medium text-gray-700 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
              Verification Requirements
            </h3>
            
            <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              To complete your account verification, you'll need to submit the following documents:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8" style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}>
            {/* Left Column - Business Permits & Registrations */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center text-lg border-b pb-3 border-blue-200">
                <File className="h-5 w-5 mr-2 text-blue-500" />
                Business Permits & Registrations
              </h4>
              <ul className="space-y-4">
                <li>
                  <h5 className="font-medium text-gray-800">SEC Registration</h5>
                  <p className="text-gray-600 text-sm">Required for corporations and partnerships to legally operate in the country.</p>
                </li>
                <li>
                  <h5 className="font-medium text-gray-800">BIR Registration</h5>
                  <p className="text-gray-600 text-sm">Tax identification and registration with the Bureau of Internal Revenue.</p>
                </li>
                <li>
                  <h5 className="font-medium text-gray-800">Mayor's Permit / Business Permit</h5>
                  <p className="text-gray-600 text-sm">Local authorization to operate a business within the city or municipality.</p>
                </li>
                <li>
                  <h5 className="font-medium text-gray-800">Environmental Compliance Certificate (ECC)</h5>
                  <p className="text-gray-600 text-sm">Certifies compliance with environmental regulations for businesses with environmental impact.</p>
                </li>
              </ul>
            </div>
            
            {/* Right Column - Insurance and Liability Coverage */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center text-lg border-b pb-3 border-green-200">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Insurance and Liability Coverage
              </h4>
              <ul className="space-y-4">
                <li>
                  <h5 className="font-medium text-gray-800">General Liability Insurance</h5>
                  <p className="text-gray-600 text-sm">Protects against third-party claims of bodily injury or property damage during service provision.</p>
                </li>
                <li>
                  <h5 className="font-medium text-gray-800">Property Damage Insurance</h5>
                  <p className="text-gray-600 text-sm">Covers damage to client property that may occur while providing services.</p>
                </li>
                <li>
                  <h5 className="font-medium text-gray-800">Worker's Compensation Insurance</h5>
                  <p className="text-gray-600 text-sm">Provides benefits to employees who suffer work-related injuries or illnesses.</p>
                </li>
                <li>
                  <h5 className="font-medium text-gray-800">Professional Indemnity Insurance</h5>
                  <p className="text-gray-600 text-sm">Protects against claims of negligence or inadequate work performance.</p>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full" style={{ animation: "fadeIn 0.5s ease-out 0.4s both" }}>
            <button
              onClick={handleSkipClick}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all w-full sm:w-1/2 order-2 sm:order-1"
            >
              Skip for Now
            </button>
            <button
              onClick={onContinue}
              className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium shadow-sm hover:bg-blue-600 active:scale-95 transition-all duration-200 w-full sm:w-1/2 order-1 sm:order-2"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="mx-auto max-w-6xl w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-6"
          style={{ animation: "fadeIn 0.5s ease-out" }}
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div 
              className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6"
              style={{ animation: "pulse 2s ease-in-out infinite" }}
            >
              <AlertCircle className="h-10 w-10 text-amber-500" style={{ animation: "bounceIn 0.6s ease-out" }} />
            </div>
            
            <h3 className="text-xl font-medium text-gray-700 mb-2" style={{ animation: "slideInUp 0.4s ease-out" }}>
              Warning: Unverified Account Limitations
            </h3>
            
            <p className="text-gray-600 mb-6" style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}>
              If you skip verification, your account will remain unverified, which has the following limitations:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Limitations */}
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center text-lg border-b pb-3 border-amber-200">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Account Limitations
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-gray-800">Service Creation Restricted</h5>
                    <p className="text-gray-600 text-sm">Unable to create or publish any services on the platform</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-gray-800">Unverified Badge</h5>
                    <p className="text-gray-600 text-sm">A visible unverified status badge on your profile</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-gray-800">Limited Visibility</h5>
                    <p className="text-gray-600 text-sm">Lower ranking and reduced visibility in search results</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-gray-800">Feature Restrictions</h5>
                    <p className="text-gray-600 text-sm">No access to premium features and advanced tools</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* Right Column - Example Account */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center text-lg border-b pb-3 border-gray-200">
                <AlertCircle className="h-5 w-5 mr-2 text-gray-500" />
                Example: Unverified Account View
              </h4>
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-900">Business Name</h5>
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full border border-amber-200 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Unverified
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">@username</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Service creation is disabled for unverified accounts</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Profile views: Limited</span>
                      <span className="text-gray-500">Search rank: Reduced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full" style={{ animation: "fadeIn 0.5s ease-out 0.4s both" }}>
            <button
              onClick={handleConfirmSkip}
              className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all w-full sm:w-1/2 order-2 sm:order-1"
            >
              Skip Anyway
            </button>
            <button
              onClick={handleGoBack}
              className="px-6 py-3 bg-amber-500 text-white rounded-full font-medium shadow-sm hover:bg-amber-600 active:scale-95 transition-all duration-200 w-full sm:w-1/2 order-1 sm:order-2"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmationModal;