const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const noteModel = require('../models/noteModel');
const { assertTeacherOwnsSubject } = require('./subjectController');
const notificationService = require('../services/notificationService');

function detectFileType(originalName) {
  const ext = originalName.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'docx';
  if (['ppt', 'pptx'].includes(ext)) return 'pptx';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
  return 'other';
}

// POST /api/notes  (teacher, multipart/form-data with a "file" field)
const uploadNote = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A file is required');

  const { subjectId, title, description } = req.body;
  await assertTeacherOwnsSubject(subjectId, req.user.id);

  const note = await noteModel.create({
    subjectId,
    teacherId: req.user.id,
    title,
    description,
    fileUrl: req.file.path,
    fileType: detectFileType(req.file.originalname),
    fileSizeKb: req.file.bytes ? Math.round(req.file.bytes / 1024) : null,
  });

  // Fire-and-forget notification to enrolled students; failure here shouldn't fail the upload.
  notificationService.notifySubjectStudents(subjectId, {
    type: 'new_note',
    title: 'New study material uploaded',
    message: `"${title}" was added to ${note.subject_name}`,
    link: `/notes/${note.id}`,
  }).catch((err) => console.error('Notification error:', err.message));

  return success(res, 201, 'Note uploaded successfully', { note });
});

// GET /api/notes
const getNotes = asyncHandler(async (req, res) => {
  const { subjectId, search, page = 1, limit = 20 } = req.query;
  const { rows, total } = await noteModel.findForUser(req.user, { subjectId, search, page, limit });

  // Attach bookmark status for the current student in one extra pass (small lists, fine to do per-row).
  if (req.user.role === 'student') {
    for (const note of rows) {
      note.is_bookmarked = await noteModel.isBookmarked(note.id, req.user.id);
    }
  }

  return success(res, 200, 'Notes fetched', { notes: rows }, {
    page: Number(page), limit: Number(limit), total,
  });
});

// GET /api/notes/:id
const getNoteById = asyncHandler(async (req, res) => {
  const note = await noteModel.findById(req.params.id);
  if (!note) throw new ApiError(404, 'Note not found');

  if (req.user.role === 'student') {
    await noteModel.incrementViews(note.id);
    note.is_bookmarked = await noteModel.isBookmarked(note.id, req.user.id);
  }

  return success(res, 200, 'Note fetched', { note });
});

// PATCH /api/notes/:id  (owning teacher)
const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await noteModel.findById(id);
  if (!existing) throw new ApiError(404, 'Note not found');
  if (existing.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this note');

  const { title, description } = req.body;
  const note = await noteModel.update(id, { title, description });
  return success(res, 200, 'Note updated successfully', { note });
});

// DELETE /api/notes/:id  (owning teacher)
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await noteModel.findById(id);
  if (!existing) throw new ApiError(404, 'Note not found');
  if (existing.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this note');

  await noteModel.remove(id);
  return success(res, 200, 'Note deleted successfully');
});

// POST /api/notes/:id/bookmark  (student)
const bookmarkNote = asyncHandler(async (req, res) => {
  const note = await noteModel.findById(req.params.id);
  if (!note) throw new ApiError(404, 'Note not found');

  await noteModel.addBookmark(note.id, req.user.id);
  return success(res, 200, 'Note bookmarked');
});

// DELETE /api/notes/:id/bookmark  (student)
const removeBookmark = asyncHandler(async (req, res) => {
  await noteModel.removeBookmark(req.params.id, req.user.id);
  return success(res, 200, 'Bookmark removed');
});

// GET /api/notes/bookmarks/mine  (student)
const getMyBookmarks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { rows, total } = await noteModel.listBookmarked(req.user.id, { page, limit });
  return success(res, 200, 'Bookmarked notes fetched', { notes: rows }, {
    page: Number(page), limit: Number(limit), total,
  });
});

module.exports = {
  uploadNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  bookmarkNote,
  removeBookmark,
  getMyBookmarks,
};
