const { body } = require('express-validator');

const createQuizValidator = [
  body('subjectId').isInt().withMessage('A valid subjectId is required'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim(),
  body('durationMinutes').optional().isInt({ min: 1 }).withMessage('durationMinutes must be positive'),
];

const addQuestionValidator = [
  body('questionText').trim().notEmpty().withMessage('questionText is required'),
  body('questionType').isIn(['mcq', 'true_false', 'short', 'long']).withMessage('Invalid questionType'),
  body('correctAnswer').trim().notEmpty().withMessage('correctAnswer is required'),
  body('marks').optional().isInt({ min: 1 }),
  body('options').optional().isArray().withMessage('options must be an array'),
];

const submitAnswerValidator = [
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array'),
];

const gradeAnswerValidator = [
  body('marksAwarded').isFloat({ min: 0 }).withMessage('marksAwarded must be a non-negative number'),
];

module.exports = { createQuizValidator, addQuestionValidator, submitAnswerValidator, gradeAnswerValidator };
