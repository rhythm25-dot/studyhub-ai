import api from './api';

export const noteService = {
  list: (params) => api.get('/notes', { params }).then((r) => r.data),

  getById: (id) => api.get(`/notes/${id}`).then((r) => r.data.data.note),

  upload: (formData, onProgress) =>
    api
      .post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
      })
      .then((r) => r.data.data.note),

  update: (id, data) => api.patch(`/notes/${id}`, data).then((r) => r.data.data.note),

  remove: (id) => api.delete(`/notes/${id}`),

  bookmark: (id) => api.post(`/notes/${id}/bookmark`),
  unbookmark: (id) => api.delete(`/notes/${id}/bookmark`),

  myBookmarks: (params) => api.get('/notes/bookmarks/mine', { params }).then((r) => r.data),
};
