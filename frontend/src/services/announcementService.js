import api from './api';

export const announcementService = {
  list: (params) => api.get('/announcements', { params }).then((r) => r.data),

  create: (data) => api.post('/announcements', data).then((r) => r.data.data.announcement),

  remove: (id) => api.delete(`/announcements/${id}`),
};
