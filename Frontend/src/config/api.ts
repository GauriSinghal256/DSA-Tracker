// API Configuration
// This file centralizes the backend API URL
// It uses environment variables for different environments

const getApiBaseUrl = (): string => {
  // Get API URL from environment variable (Vercel/dotenv)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback: Check if we're in production mode
  const isProduction = import.meta.env.PROD;
  
  return isProduction 
    ? 'https://dsa-tracker-v5t7.onrender.com' // Your Render backend URL
    : 'http://localhost:8000'; // Local development backend
};

export const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;


