/**
 * FAQ API Service for Admin Frontend
 * Handles all FAQ CRUD operations with the backend API
 */

import { API_URL } from '../config/api';

/**
 * Get admin token from localStorage
 */
const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

/**
 * Fetch all FAQs for admin (including inactive)
 */
export const fetchAllFaqs = async () => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/faqs/admin/all`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch FAQs');
  }
  
  return data.faqs;
};

/**
 * Fetch a single FAQ by ID
 */
export const fetchFaqById = async (id) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/faqs/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch FAQ');
  }
  
  return data.faq;
};

/**
 * Create a new FAQ
 * @param {Object} faqData - FAQ data with question, answer, isActive
 */
export const createFaq = async (faqData) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/faqs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(faqData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create FAQ');
  }
  
  return data.faq;
};

/**
 * Update an existing FAQ
 * @param {string} id - FAQ ID
 * @param {Object} faqData - Updated FAQ data
 */
export const updateFaq = async (id, faqData) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/faqs/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(faqData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to update FAQ');
  }
  
  return data.faq;
};

/**
 * Delete a FAQ
 * @param {string} id - FAQ ID
 */
export const deleteFaq = async (id) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/faqs/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete FAQ');
  }
  
  return data;
};

/**
 * Reorder FAQs
 * @param {string[]} orderedIds - Array of FAQ IDs in desired order
 */
export const reorderFaqs = async (orderedIds) => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_URL}/faqs/reorder`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderedIds }),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to reorder FAQs');
  }
  
  return data.faqs;
};

export default {
  fetchAllFaqs,
  fetchFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
};
