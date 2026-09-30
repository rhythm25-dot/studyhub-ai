import api from './api';

export const userService = {
  list: (params) => api.get('/users', { params }).then((r) => r.data),

  updateProfile: (formData) =>
    api
      .patch('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data.user),

  setStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),

  remove: (id) => api.delete(`/users/${id}`),
};
