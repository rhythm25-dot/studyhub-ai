const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const subjectModel = require('../models/subjectModel');
const userModel = require('../models/userModel');

// POST /api/subjects  (teacher)
const createSubject = asyncHandler(async (req, res) => {
  const { name, code, description, coverColor } = req.body;
  const subject = await subjectModel.create({
    name, code, description, coverColor, teacherId: req.user.id,
  });
  return success(res, 201, 'Subject created successfully', { subject });
});

// GET /api/subjects  (role-scoped: admin sees all, teacher sees owned, student sees enrolled)
const getSubjects = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const { rows, total } = await subjectModel.findForUser(req.user, { search, page, limit });
  return success(res, 200, 'Subjects fetched', { subjects: rows }, {
    page: Number(page), limit: Number(limit), total,
  });
});

// GET /api/subjects/:id
const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await subjectModel.findById(req.params.id);
  if (!subject) throw new ApiError(404, 'Subject not found');

  if (req.user.role === 'student') {
    const enrolled = await subjectModel.isStudentEnrolled(subject.id, req.user.id);
    if (!enrolled) throw new ApiError(403, 'You are not enrolled in this subject');
  }
  if (req.user.role === 'teacher' && subject.teacher_id !== req.user.id) {
    throw new ApiError(403, 'You do not own this subject');
  }

  return success(res, 200, 'Subject fetched', { subject });
});

// Helper used by other controllers (notes, assignments, quizzes) to enforce ownership.
const assertTeacherOwnsSubject = async (subjectId, teacherId) => {
  const owns = await subjectModel.isTeacherOwner(subjectId, teacherId);
  if (!owns) throw new ApiError(403, 'You do not own this subject');
};

// PATCH /api/subjects/:id  (owning teacher only)
const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await subjectModel.findById(id);
  if (!existing) throw new ApiError(404, 'Subject not found');
  if (existing.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this subject');

  const { name, description, coverColor } = req.body;
  const subject = await subjectModel.update(id, { name, description, coverColor });
  return success(res, 200, 'Subject updated successfully', { subject });
});

// DELETE /api/subjects/:id  (owning teacher or admin) - soft delete
const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await subjectModel.findById(id);
  if (!existing) throw new ApiError(404, 'Subject not found');
  if (req.user.role === 'teacher' && existing.teacher_id !== req.user.id) {
    throw new ApiError(403, 'You do not own this subject');
  }

  await subjectModel.remove(id);
  return success(res, 200, 'Subject deleted successfully');
});

// POST /api/subjects/:id/enroll  (owning teacher) - enroll a student by id
const enrollStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  const subject = await subjectModel.findById(id);
  if (!subject) throw new ApiError(404, 'Subject not found');
  if (subject.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this subject');

  const student = await userModel.findById(studentId);
  if (!student || student.role !== 'student') throw new ApiError(404, 'Student not found');

  await subjectModel.enrollStudent(id, studentId);
  return success(res, 200, 'Student enrolled successfully');
});

// DELETE /api/subjects/:id/enroll/:studentId  (owning teacher)
const unenrollStudent = asyncHandler(async (req, res) => {
  const { id, studentId } = req.params;
  const subject = await subjectModel.findById(id);
  if (!subject) throw new ApiError(404, 'Subject not found');
  if (subject.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this subject');

  await subjectModel.unenrollStudent(id, studentId);
  return success(res, 200, 'Student removed from subject');
});

// GET /api/subjects/:id/students
const getEnrolledStudents = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subject = await subjectModel.findById(id);
  if (!subject) throw new ApiError(404, 'Subject not found');
  if (req.user.role === 'teacher' && subject.teacher_id !== req.user.id) {
    throw new ApiError(403, 'You do not own this subject');
  }

  const students = await subjectModel.listEnrolledStudents(id);
  return success(res, 200, 'Enrolled students fetched', { students });
});

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  enrollStudent,
  unenrollStudent,
  getEnrolledStudents,
  assertTeacherOwnsSubject,
};
