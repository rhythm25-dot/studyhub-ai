const { body } = require('express-validator');

const createAssignmentValidator = [
  body('subjectId').isInt().withMessage('A valid subjectId is required'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim(),
  body('maxMarks').optional().isInt({ min: 1 }).withMessage('maxMarks must be a positive number'),
  body('dueDate').isISO8601().withMessage('A valid dueDate is required'),
];

const gradeSubmissionValidator = [
  body('marksObtained').isFloat({ min: 0 }).withMessage('marksObtained must be a non-negative number'),
  body('teacherFeedback').optional().trim(),
];

module.exports = { createAssignmentValidator, gradeSubmissionValidator };
