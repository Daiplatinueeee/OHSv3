import { X, Sparkles, Check } from 'lucide-react';

interface WelcomeMsgProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeMsg = ({ isOpen, onClose }: WelcomeMsgProps) => {
  if (!isOpen) return null;

  // Animation keyframes
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes bounceIn {
      0% { transform: scale(0.8); opacity: 0; }
      60% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes slideInUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @keyframes sparkle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.2); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4" 
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        <div 
          className="mx-auto max-w-lg w-full bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transform transition-all border border-white/20 p-8"
          style={{ animation: 'bounceIn 0.5s ease-out' }}
        >
          <div className="absolute top-4 right-4">
            <button 
              onClick={onClose}
              className="rounded-full bg-gray-200/50 p-2 text-gray-500 hover:bg-gray-300/60 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div 
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            >
              <Sparkles className="h-10 w-10 text-green-500" style={{ animation: 'sparkle 1.5s ease-out infinite' }} />
            </div>

            <h3 
              className="text-2xl font-bold text-gray-900 mb-3" 
              style={{ animation: 'slideInUp 0.4s ease-out' }}
            >
              Welcome to Online Home Services!
            </h3>

            <p 
              className="text-gray-600 mb-6 max-w-md" 
              style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}
            >
              Your one-stop platform for all home service needs. Discover professional service providers, book appointments, and manage your home maintenance with ease.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6" style={{ animation: 'fadeIn 0.5s ease-out 0.3s both' }}>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Check className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">Expert Providers</h4>
                  <p className="text-sm text-gray-600">Verified professionals for quality service</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Check className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">Easy Booking</h4>
                  <p className="text-sm text-gray-600">Schedule services with just a few clicks</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Check className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">Secure Payments</h4>
                  <p className="text-sm text-gray-600">Safe and transparent payment system</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Check className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">Service Tracking</h4>
                  <p className="text-sm text-gray-600">Real-time updates on your bookings</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full" style={{ animation: 'fadeIn 0.5s ease-out 0.4s both' }}>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-all"
              >
                Maybe Later
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-lime-400 text-white rounded-full font-medium shadow-sm hover:shadow-md hover:opacity-90 active:scale-95 transition-all duration-200"
              >
                Explore Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeMsg;