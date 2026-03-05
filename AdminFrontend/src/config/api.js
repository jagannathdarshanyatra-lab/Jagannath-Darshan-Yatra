/**
 * Centralized API Configuration for Admin Frontend
 */

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Ensure it ends with /api if not already present
    // Remove trailing slash from envUrl first if it exists
    const base = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  // Default for local development
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();
