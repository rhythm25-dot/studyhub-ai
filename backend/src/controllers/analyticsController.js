const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const analyticsModel = require('../models/analyticsModel');
const assignmentModel = require('../models/assignmentModel');
const { assertTeacherOwnsSubject } = require('./subjectController');

// GET /api/analytics/teacher/dashboard
const getTeacherDashboard = asyncHandler(async (req, res) => {
  const [overview, performance, recentActivity, pendingEvaluations] = await Promise.all([
    analyticsModel.teacherOverview(req.user.id),
    analyticsModel.teacherPerformanceBySubject(req.user.id),
    analyticsModel.recentStudentActivity(req.user.id),
    assignmentModel.findPendingForTeacher(req.user.id),
  ]);

  return success(res, 200, 'Teacher dashboard fetched', {
    overview, performance, recentActivity, pendingEvaluations,
  });
});

// GET /api/analytics/subjects/:id/students  (owning teacher) - "Student Analytics" page
const getSubjectStudentAnalytics = asyncHandler(async (req, res) => {
  await assertTeacherOwnsSubject(req.params.id, req.user.id);
  const students = await analyticsModel.studentAnalyticsForSubject(req.params.id);
  return success(res, 200, 'Student analytics fetched', { students });
});

// GET /api/analytics/student/dashboard
const getStudentDashboard = asyncHandler(async (req, res) => {
  const [overview, performanceTrend, recentActivity] = await Promise.all([
    analyticsModel.studentOverview(req.user.id),
    analyticsModel.studentPerformanceTrend(req.user.id),
    analyticsModel.studentRecentActivity(req.user.id),
  ]);

  return success(res, 200, 'Student dashboard fetched', {
    overview, performanceTrend, recentActivity,
  });
});

module.exports = { getTeacherDashboard, getSubjectStudentAnalytics, getStudentDashboard };
