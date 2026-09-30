import api from './api';

export const aiService = {
  summarize: (noteId) => api.post('/ai/summarize', { noteId }).then((r) => r.data.data.summary),

  generateQuiz: (data) => api.post('/ai/generate-quiz', data).then((r) => r.data.data.questions),

  chat: (data) => api.post('/ai/chat', data).then((r) => r.data.data),

  chatSessions: (noteId) =>
    api.get('/ai/chat/sessions', { params: { noteId } }).then((r) => r.data.data.sessions),

  chatMessages: (sessionId) =>
    api.get(`/ai/chat/sessions/${sessionId}/messages`).then((r) => r.data.data),

  solveDoubt: (question) => api.post('/ai/doubt', { question }).then((r) => r.data.data.doubt),

  doubtHistory: () => api.get('/ai/doubt/history').then((r) => r.data.data.doubts),

  checkAssignment: (submissionId) =>
    api.post(`/ai/check-assignment/${submissionId}`).then((r) => r.data.data),
};
