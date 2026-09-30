import api from './api';

export const assignmentService = {
  list: (params) => api.get('/assignments', { params }).then((r) => r.data),

  getById: (id) => api.get(`/assignments/${id}`).then((r) => r.data.data.assignment),

  create: (formData) =>
    api
      .post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data.assignment),

  remove: (id) => api.delete(`/assignments/${id}`),

  submit: (id, formData) =>
    api
      .post(`/assignments/${id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data.submission),

  mySubmission: (id) =>
    api.get(`/assignments/${id}/my-submission`).then((r) => r.data.data.submission),

  submissions: (id) =>
    api.get(`/assignments/${id}/submissions`).then((r) => r.data.data.submissions),

  gradeSubmission: (submissionId, data) =>
    api
      .patch(`/assignments/submissions/${submissionId}/grade`, data)
      .then((r) => r.data.data.submission),
};
