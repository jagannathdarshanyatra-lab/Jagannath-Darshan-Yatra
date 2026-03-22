const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchSettings = async (query = '', signal) => {
  const response = await fetch(`${API_URL}/api/settings${query}`, { signal });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch settings');
  }
  return data.data;
};
