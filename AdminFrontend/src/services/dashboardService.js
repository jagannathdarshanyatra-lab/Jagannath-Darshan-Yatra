import axiosInstance from '@/lib/axios';

const dashboardService = {
  getStats: async () => {
    try {
      const response = await axiosInstance.get('admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch dashboard stats';
    }
  },
  getNotifications: async () => {
    try {
      const response = await axiosInstance.get('admin/dashboard/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch notifications';
    }
  },
  markNotificationAsRead: async (id) => {
    try {
      const response = await axiosInstance.put(`admin/dashboard/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to mark notification as read';
    }
  },
};

export default dashboardService;
