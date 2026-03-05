import { API_URL } from '../config/api';

const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

const approvalService = {
  // ==================
  // PACKAGES
  // ==================
  getPendingPackages: async () => {
    const token = getAdminToken();
    const response = await fetch(`${API_URL}/packages/admin/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch pending packages');
    }
    return data.packages;
  },

  approvePackage: async (id) => {
    const token = getAdminToken();
    const response = await fetch(`${API_URL}/packages/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to approve package');
    }
    return data.package;
  },

  rejectPackage: async (id) => {
    const token = getAdminToken();
    const response = await fetch(`${API_URL}/packages/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to reject package');
    }
    return data.package;
  },

  // ==================
  // HOTELS
  // ==================
  getPendingHotels: async () => {
    const token = getAdminToken();
    const response = await fetch(`${API_URL}/hotels/admin/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch pending hotels');
    }
    return data.hotels;
  },

  approveHotel: async (id) => {
    const token = getAdminToken();
    const response = await fetch(`${API_URL}/hotels/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to approve hotel');
    }
    return data.hotel;
  },

  rejectHotel: async (id) => {
    const token = getAdminToken();
    const response = await fetch(`${API_URL}/hotels/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to reject hotel');
    }
    return data.hotel;
  },
};

export default approvalService;
