import api from './api';

export const analyticsService = {
  teacherDashboard: () => api.get('/analytics/teacher/dashboard').then((r) => r.data.data),

  studentDashboard: () => api.get('/analytics/student/dashboard').then((r) => r.data.data),

  subjectStudentAnalytics: (subjectId) =>
    api.get(`/analytics/subjects/${subjectId}/students`).then((r) => r.data.data.students),
};
