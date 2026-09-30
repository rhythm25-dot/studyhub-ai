const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const noteModel = require('../models/noteModel');
const subjectModel = require('../models/subjectModel');
const announcementModel = require('../models/announcementModel');

// GET /api/search?q=...
// A single endpoint that fans out to each feature's own scoped query,
// so results always respect the same role-based visibility rules as
// the individual list endpoints (a student never sees another class's notes).
const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return success(res, 200, 'Search results', {
      subjects: [], notes: [], announcements: [],
    });
  }

  const [subjects, notes, announcements] = await Promise.all([
    subjectModel.findForUser(req.user, { search: q, page: 1, limit: 5 }),
    noteModel.findForUser(req.user, { search: q, page: 1, limit: 5 }),
    announcementModel.findForUser(req.user, { search: q, page: 1, limit: 5 }),
  ]);

  return success(res, 200, 'Search results', {
    subjects: subjects.rows,
    notes: notes.rows,
    announcements: announcements.rows,
  });
});

module.exports = { globalSearch };
