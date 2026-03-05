import axios from 'axios';

import { API_URL } from '../config/api';

const hotelService = {
  getHotels: async () => {
    const response = await axios.get(`${API_URL}/hotels`);
    return response.data;
  },

  getAllHotelsAdmin: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/hotels/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data.hotels;
  },

  getHotelById: async (id) => {
    const response = await axios.get(`${API_URL}/hotels/${id}`);
    return response.data;
  },

  createHotel: async (hotelData) => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_URL}/hotels`, hotelData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateHotel: async (id, hotelData) => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_URL}/hotels/${id}`, hotelData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteHotel: async (id) => {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_URL}/hotels/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default hotelService;
