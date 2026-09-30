import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),

  login: (data) => api.post('/auth/login', data).then((r) => r.data.data),

  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`).then((r) => r.data),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (data) => api.post('/auth/reset-password', data).then((r) => r.data),

  getMe: () => api.get('/auth/me').then((r) => r.data.data.user),

  logout: () => api.post('/auth/logout'),
};
