const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const announcementModel = require('../models/announcementModel');
const { assertTeacherOwnsSubject } = require('./subjectController');
const notificationService = require('../services/notificationService');

// POST /api/announcements
// - admin: subjectId must be omitted -> platform-wide announcement
// - teacher: subjectId required -> must own that subject
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  let { subjectId } = req.body;

  if (req.user.role === 'admin') {
    subjectId = null;
  } else {
    if (!subjectId) throw new ApiError(400, 'subjectId is required for a subject announcement');
    await assertTeacherOwnsSubject(subjectId, req.user.id);
  }

  const announcement = await announcementModel.create({
    subjectId, authorId: req.user.id, title, content,
  });

  if (subjectId) {
    notificationService.notifySubjectStudents(subjectId, {
      type: 'announcement',
      title: 'New announcement',
      message: title,
      link: `/announcements/${announcement.id}`,
    }).catch((err) => console.error('Notification error:', err.message));
  }

  return success(res, 201, 'Announcement posted successfully', { announcement });
});

// GET /api/announcements
const getAnnouncements = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const { rows, total } = await announcementModel.findForUser(req.user, { search, page, limit });
  return success(res, 200, 'Announcements fetched', { announcements: rows }, {
    page: Number(page), limit: Number(limit), total,
  });
});

// GET /api/announcements/:id
const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await announcementModel.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  return success(res, 200, 'Announcement fetched', { announcement });
});

// DELETE /api/announcements/:id  (author or admin)
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementModel.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  if (announcement.author_id !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'You cannot delete this announcement');
  }
  await announcementModel.remove(req.params.id);
  return success(res, 200, 'Announcement deleted successfully');
});

module.exports = { createAnnouncement, getAnnouncements, getAnnouncementById, deleteAnnouncement };
