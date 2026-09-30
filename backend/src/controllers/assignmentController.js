const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const assignmentModel = require('../models/assignmentModel');
const { assertTeacherOwnsSubject } = require('./subjectController');
const notificationService = require('../services/notificationService');

// POST /api/assignments  (teacher) - optional rubric file under field "rubric"
const createAssignment = asyncHandler(async (req, res) => {
  const { subjectId, title, description, maxMarks, dueDate } = req.body;
  await assertTeacherOwnsSubject(subjectId, req.user.id);

  const assignment = await assignmentModel.create({
    subjectId,
    teacherId: req.user.id,
    title,
    description,
    rubricUrl: req.file ? req.file.path : null,
    maxMarks,
    dueDate,
  });

  notificationService.notifySubjectStudents(subjectId, {
    type: 'new_assignment',
    title: 'New assignment posted',
    message: `"${title}" is due ${new Date(dueDate).toLocaleDateString()}`,
    link: `/assignments/${assignment.id}`,
  }).catch((err) => console.error('Notification error:', err.message));

  return success(res, 201, 'Assignment created successfully', { assignment });
});

// GET /api/assignments
const getAssignments = asyncHandler(async (req, res) => {
  const { subjectId, page = 1, limit = 20 } = req.query;
  const { rows, total } = await assignmentModel.findForUser(req.user, { subjectId, page, limit });
  return success(res, 200, 'Assignments fetched', { assignments: rows }, {
    page: Number(page), limit: Number(limit), total,
  });
});

// GET /api/assignments/:id
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await assignmentModel.findById(req.params.id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return success(res, 200, 'Assignment fetched', { assignment });
});

// DELETE /api/assignments/:id  (owning teacher)
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentModel.findById(req.params.id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  if (assignment.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this assignment');

  await assignmentModel.remove(req.params.id);
  return success(res, 200, 'Assignment deleted successfully');
});

// POST /api/assignments/:id/submit  (student, multipart field "file")
const submitAssignment = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A file is required');

  const assignment = await assignmentModel.findById(req.params.id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');

  const status = new Date() > new Date(assignment.due_date) ? 'late' : 'submitted';
  const submission = await assignmentModel.upsertSubmission({
    assignmentId: assignment.id,
    studentId: req.user.id,
    fileUrl: req.file.path,
    status,
  });

  return success(res, 200, 'Assignment submitted successfully', { submission });
});

// GET /api/assignments/:id/my-submission  (student)
const getMySubmission = asyncHandler(async (req, res) => {
  const submission = await assignmentModel.findSubmission(req.params.id, req.user.id);
  return success(res, 200, 'Submission fetched', { submission });
});

// GET /api/assignments/:id/submissions  (owning teacher) - all submissions for grading
const getSubmissions = asyncHandler(async (req, res) => {
  const assignment = await assignmentModel.findById(req.params.id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  if (assignment.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this assignment');

  const submissions = await assignmentModel.listSubmissions(req.params.id);
  return success(res, 200, 'Submissions fetched', { submissions });
});

// PATCH /api/submissions/:id/grade  (owning teacher)
const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await assignmentModel.findSubmissionById(req.params.id);
  if (!submission) throw new ApiError(404, 'Submission not found');
  if (submission.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this assignment');

  const { marksObtained, teacherFeedback } = req.body;
  if (marksObtained > submission.max_marks) {
    throw new ApiError(400, `marksObtained cannot exceed max marks (${submission.max_marks})`);
  }

  const graded = await assignmentModel.gradeSubmission(req.params.id, { marksObtained, teacherFeedback });

  notificationService.notifyUser(submission.student_id, {
    type: 'graded',
    title: 'Assignment graded',
    message: `"${submission.assignment_title}" was graded: ${marksObtained}/${submission.max_marks}`,
    link: `/assignments/${submission.assignment_id}`,
  }).catch((err) => console.error('Notification error:', err.message));

  return success(res, 200, 'Submission graded successfully', { submission: graded });
});

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  deleteAssignment,
  submitAssignment,
  getMySubmission,
  getSubmissions,
  gradeSubmission,
};
