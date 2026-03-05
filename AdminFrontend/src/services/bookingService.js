import axios from 'axios';
import { API_URL } from '../config/api';

// Get auth token from local storage
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Configure axios instance with auth header
const authAxios = axios.create({
  baseURL: API_URL.endsWith('/') ? API_URL : `${API_URL}/`,
});

authAxios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get all bookings
export const getAllBookings = async (page = 1, limit = 10) => {
  try {
    const response = await authAxios.get('bookings', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch bookings';
  }
};

// Get booking by ID
export const getBookingById = async (id) => {
  try {
    const response = await authAxios.get(`bookings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch booking details';
  }
};

// Create manual booking
export const createManualBooking = async (bookingData) => {
  try {
    const response = await authAxios.post('bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create booking';
  }
};

// Update booking status
export const updateBookingStatus = async (id, statusData) => {
  try {
    const response = await authAxios.put(`bookings/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update booking status';
  }
};

// Delete booking
export const deleteBooking = async (id) => {
  try {
    const response = await authAxios.delete(`bookings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete booking';
  }
};

// Get refund preview for a booking
export const getRefundPreview = async (id) => {
  try {
    const response = await authAxios.get(`bookings/${id}/refund-preview`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to get refund preview';
  }
};

// Approve cancellation request
export const approveCancellation = async (id, data = {}) => {
  try {
    const response = await authAxios.put(`bookings/${id}/approve-cancel`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to approve cancellation';
  }
};

// Reject cancellation request
export const rejectCancellation = async (id, data = {}) => {
  try {
    const response = await authAxios.put(`bookings/${id}/reject-cancel`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to reject cancellation';
  }
};

// Process refund via Razorpay
export const processRefund = async (id) => {
  try {
    const response = await authAxios.post(`bookings/${id}/process-refund`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to process refund';
  }
};

