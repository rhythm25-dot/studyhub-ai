const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const notificationModel = require('../models/notificationModel');

// GET /api/notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, page = 1, limit = 20 } = req.query;
  const { rows, total, unread } = await notificationModel.findForUser(req.user.id, {
    unreadOnly, page, limit,
  });
  return success(res, 200, 'Notifications fetched', { notifications: rows, unreadCount: unread }, {
    page: Number(page), limit: Number(limit), total,
  });
});

// PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  await notificationModel.markAsRead(req.params.id, req.user.id);
  return success(res, 200, 'Notification marked as read');
});

// PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationModel.markAllAsRead(req.user.id);
  return success(res, 200, 'All notifications marked as read');
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
