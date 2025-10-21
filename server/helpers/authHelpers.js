// File handling utilities
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;
  
  return {
    isValid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough,
    requirements: [
      { met: isLongEnough, text: 'At least 8 characters' },
      { met: hasUpperCase, text: 'Contains uppercase letter' },
      { met: hasLowerCase, text: 'Contains lowercase letter' },
      { met: hasNumber, text: 'Contains a number' },
      { met: hasSpecialChar, text: 'Contains special character' },
    ]
  };
};

// Location utilities
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Haversine formula to calculate distance between two points on Earth
  const R = 6371; // Radius of Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

export const formatCurrency = (amount, currency = "PHP") => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Date formatting
export const formatDate = (date, format = "medium") => {
  const options = { 
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'long', day: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  };
  
  return new Date(date).toLocaleDateString("en-US", options[format]);
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Form data utilities
export const formDataToObject = (formData) => {
  const object = {};
  formData.forEach((value, key) => {
    // Check if key already exists
    if (object[key]) {
      // If it exists and is not an array, convert to array
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      // Add new value to array
      object[key].push(value);
    } else {
      // Set value
      object[key] = value;
    }
  });
  return object;
};