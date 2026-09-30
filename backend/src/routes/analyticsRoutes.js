const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.use(protect);

router.get('/teacher/dashboard', roleGuard('teacher'), analyticsController.getTeacherDashboard);
router.get('/student/dashboard', roleGuard('student'), analyticsController.getStudentDashboard);
router.get('/subjects/:id/students', roleGuard('teacher'), analyticsController.getSubjectStudentAnalytics);

module.exports = router;
