import { API_URL } from '../config/api';

const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

export const fetchSettings = async () => {
  const token = getAdminToken();
  const response = await fetch(`${API_URL}/settings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch settings');
  }
  return data.data;
};

export const updateSettings = async (settingsData) => {
  const token = getAdminToken();
  const response = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(settingsData),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to update settings');
  }
  return data.data;
};
