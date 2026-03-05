/**
 * Destination API Service for Admin Frontend
 * Handles all destination CRUD operations with the backend API
 */

import { API_URL } from '../config/api';

/**
 * Get admin token from localStorage
 */
const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

/**
 * Fetch all destinations for admin (including inactive)
 */
export const fetchAllDestinations = async () => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/destinations/admin/all`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch destinations');
  }
  
  return data.destinations;
};

/**
 * Fetch a single destination by ID
 */
export const fetchDestinationById = async (id) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/destinations/id/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch destination');
  }
  
  return data.destination;
};

/**
 * Create a new destination
 * @param {FormData} formData - Destination data including heroImage file
 */
export const createDestination = async (formData) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/destinations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create destination');
  }
  
  return data.destination;
};

/**
 * Update an existing destination
 * @param {string} id - Destination ID
 * @param {FormData} formData - Updated destination data including optional heroImage file
 */
export const updateDestination = async (id, formData) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/destinations/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to update destination');
  }
  
  return data.destination;
};

/**
 * Delete a destination
 * @param {string} id - Destination ID
 * @param {boolean} hardDelete - If true, permanently delete; otherwise soft delete
 */
export const deleteDestination = async (id, hardDelete = false) => {
  const token = getAdminToken();
  
  const url = hardDelete 
    ? `${API_URL}/destinations/${id}?hardDelete=true`
    : `${API_URL}/destinations/${id}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete destination');
  }
  
  return data;
};

/**
 * Toggle destination active status
 * @param {string} id - Destination ID
 * @param {boolean} isActive - New active status
 */
export const toggleDestinationStatus = async (id, isActive) => {
  const token = getAdminToken();
  
  const formData = new FormData();
  formData.append('isActive', isActive);
  
  const response = await fetch(`${API_URL}/destinations/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to update destination status');
  }
  
  return data.destination;
};

export default {
  fetchAllDestinations,
  fetchDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  toggleDestinationStatus,
};
