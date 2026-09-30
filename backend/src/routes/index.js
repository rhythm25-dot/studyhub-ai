const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const subjectRoutes = require('./subjectRoutes');
const noteRoutes = require('./noteRoutes');
const announcementRoutes = require('./announcementRoutes');
const notificationRoutes = require('./notificationRoutes');
const searchRoutes = require('./searchRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const quizRoutes = require('./quizRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const aiRoutes = require('./aiRoutes');

// This file is the single place that wires up the whole API surface.
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/subjects', subjectRoutes);
router.use('/notes', noteRoutes);
router.use('/announcements', announcementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/search', searchRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/quizzes', quizRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'StudyHub AI API is running' });
});

module.exports = router;
