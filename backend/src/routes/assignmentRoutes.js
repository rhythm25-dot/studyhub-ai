const express = require('express');
const router = express.Router();

const assignmentController = require('../controllers/assignmentController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  createAssignmentValidator,
  gradeSubmissionValidator,
} = require('../validators/assignmentValidators');

router.use(protect);

router.post('/', roleGuard('teacher'), upload.single('rubric'), createAssignmentValidator, validate, assignmentController.createAssignment);
router.get('/', assignmentController.getAssignments);
router.get('/:id', assignmentController.getAssignmentById);
router.delete('/:id', roleGuard('teacher'), assignmentController.deleteAssignment);

router.post('/:id/submit', roleGuard('student'), upload.single('file'), assignmentController.submitAssignment);
router.get('/:id/my-submission', roleGuard('student'), assignmentController.getMySubmission);
router.get('/:id/submissions', roleGuard('teacher'), assignmentController.getSubmissions);

// Nested under /api/assignments/submissions/:id/grade for simplicity -
// grading a submission always happens in the context of an assignment.
router.patch('/submissions/:id/grade', roleGuard('teacher'), gradeSubmissionValidator, validate, assignmentController.gradeSubmission);

module.exports = router;
