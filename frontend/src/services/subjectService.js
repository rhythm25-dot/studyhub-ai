import api from './api';

export const subjectService = {
  list: (params) => api.get('/subjects', { params }).then((r) => r.data),

  getById: (id) => api.get(`/subjects/${id}`).then((r) => r.data.data.subject),

  create: (data) => api.post('/subjects', data).then((r) => r.data.data.subject),

  update: (id, data) => api.patch(`/subjects/${id}`, data).then((r) => r.data.data.subject),

  remove: (id) => api.delete(`/subjects/${id}`),

  getStudents: (id) => api.get(`/subjects/${id}/students`).then((r) => r.data.data.students),

  enrollStudent: (id, studentId) => api.post(`/subjects/${id}/enroll`, { studentId }),

  unenrollStudent: (id, studentId) => api.delete(`/subjects/${id}/enroll/${studentId}`),
};
