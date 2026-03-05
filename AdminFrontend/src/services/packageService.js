import { API_URL } from '../config/api';

/**
 * Get admin token from localStorage
 */
const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

/**
 * Fetch all packages for admin (including inactive)
 */
export const fetchAllPackages = async () => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/packages/admin/all`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch packages');
  }
  
  return data.packages;
};

/**
 * Fetch a single package by ID
 */
export const fetchPackageById = async (id) => {
  const response = await fetch(`${API_URL}/packages/${id}`);
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch package');
  }
  
  return data.package;
};

/**
 * Create a new package
 * @param {FormData} formData - Package data including files
 */
export const createPackage = async (formData) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/packages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create package');
  }
  
  return data.package;
};

/**
 * Update an existing package
 * @param {string} id - Package ID
 * @param {FormData} formData - Updated package data including files
 */
export const updatePackage = async (id, formData) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/packages/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to update package');
  }
  
  return data.package;
};

/**
 * Delete a package
 * @param {string} id - Package ID
 * @param {boolean} hardDelete - If true, permanently delete; otherwise soft delete
 */
export const deletePackage = async (id, hardDelete = false) => {
  const token = getAdminToken();
  
  const url = hardDelete 
    ? `${API_URL}/packages/${id}?hardDelete=true`
    : `${API_URL}/packages/${id}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete package');
  }
  
  return data;
};

/**
 * Toggle package active status
 * @param {string} id - Package ID
 * @param {boolean} isActive - New active status
 */
export const togglePackageStatus = async (id, isActive) => {
  const token = getAdminToken();
  
  const formData = new FormData();
  formData.append('isActive', isActive);
  
  const response = await fetch(`${API_URL}/packages/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to update package status');
  }
  
  return data.package;
};

export default {
  fetchAllPackages,
  fetchPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
};
