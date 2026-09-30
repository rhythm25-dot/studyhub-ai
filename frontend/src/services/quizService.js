import api from './api';

export const quizService = {
  list: (params) => api.get('/quizzes', { params }).then((r) => r.data),

  getById: (id) => api.get(`/quizzes/${id}`).then((r) => r.data.data),

  create: (data) => api.post('/quizzes', data).then((r) => r.data.data.quiz),

  publish: (id, isPublished) =>
    api.patch(`/quizzes/${id}/publish`, { isPublished }).then((r) => r.data.data.quiz),

  remove: (id) => api.delete(`/quizzes/${id}`),

  addQuestion: (id, question) => api.post(`/quizzes/${id}/questions`, question),

  addQuestionsBulk: (id, questions) => api.post(`/quizzes/${id}/questions/bulk`, { questions }),

  updateQuestion: (questionId, data) => api.patch(`/quizzes/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/quizzes/questions/${questionId}`),

  start: (id) => api.post(`/quizzes/${id}/start`).then((r) => r.data.data),

  submitAttempt: (attemptId, answers) =>
    api.post(`/quizzes/attempts/${attemptId}/submit`, { answers }).then((r) => r.data.data.attempt),

  getResult: (attemptId) =>
    api.get(`/quizzes/attempts/${attemptId}/result`).then((r) => r.data.data),

  myAttempts: (quizId) =>
    api.get(`/quizzes/${quizId}/my-attempts`).then((r) => r.data.data.attempts),

  quizAttempts: (quizId) =>
    api.get(`/quizzes/${quizId}/attempts`).then((r) => r.data.data.attempts),

  gradeAnswer: (answerId, marksAwarded) =>
    api.patch(`/quizzes/answers/${answerId}/grade`, { marksAwarded }).then((r) => r.data.data),
};
