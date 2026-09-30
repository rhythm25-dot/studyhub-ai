import api from './api';

export const notificationService = {
  list: (unreadOnly = false) =>
    api
      .get('/notifications', {
        params: { unreadOnly, limit: 15 },
      })
      .then((r) => r.data.data),

  markAsRead: (id) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/notifications/read-all'),
};
