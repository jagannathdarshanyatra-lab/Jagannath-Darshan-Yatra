/**
 * Inquiry API Service for Admin Frontend
 * Handles all inquiry operations with the backend API
 */

import { API_URL } from '../config/api';

/**
 * Get admin token from localStorage
 */
const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

/**
 * Fetch all inquiries with pagination (optionally filter by status)
 * @param {Object} [options] - Query options
 * @param {string} [options.status] - Optional status filter: 'New', 'Contacted', 'Resolved'
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page
 * @returns {{ inquiries, totalCount, totalPages, currentPage }}
 */
export const fetchAllInquiries = async ({ status, page = 1, limit = 10 } = {}) => {
  const token = getAdminToken();
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  params.set('page', String(page));
  params.set('limit', String(limit));

  const response = await fetch(`${API_URL}/contact/admin/all?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch inquiries');
  }

  return {
    inquiries: data.inquiries,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
    currentPage: data.currentPage,
  };
};

/**
 * Fetch a single inquiry by ID
 * @param {string} id - Inquiry ID
 */
export const fetchInquiryById = async (id) => {
  const token = getAdminToken();

  const response = await fetch(`${API_URL}/contact/admin/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch inquiry');
  }

  return data.inquiry;
};

/**
 * Update inquiry status
 * @param {string} id - Inquiry ID
 * @param {string} status - New status: 'New' | 'Contacted' | 'Resolved'
 */
export const updateInquiryStatus = async (id, status) => {
  const token = getAdminToken();

  const response = await fetch(`${API_URL}/contact/admin/${id}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to update inquiry status');
  }

  return data.inquiry;
};

/**
 * Delete an inquiry
 * @param {string} id - Inquiry ID
 */
export const deleteInquiry = async (id) => {
  const token = getAdminToken();

  const response = await fetch(`${API_URL}/contact/admin/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete inquiry');
  }

  return data;
};

export default {
  fetchAllInquiries,
  fetchInquiryById,
  updateInquiryStatus,
  deleteInquiry,
};
