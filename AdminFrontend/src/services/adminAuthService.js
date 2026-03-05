import { API_URL } from '../config/api';

const adminAuthService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  getToken: () => {
    return localStorage.getItem('adminToken');
  },

  getAdminUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },

  getRole: () => {
    const user = localStorage.getItem('adminUser');
    if (!user) return null;
    try {
      return JSON.parse(user).role;
    } catch {
      return null;
    }
  },

  isSuperAdmin: () => {
    const user = localStorage.getItem('adminUser');
    if (!user) return false;
    try {
      return JSON.parse(user).role === 'superadmin';
    } catch {
      return false;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  }
};

export default adminAuthService;
