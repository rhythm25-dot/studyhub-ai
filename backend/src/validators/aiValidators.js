const { body } = require('express-validator');

const summarizeValidator = [
  body('noteId').isInt().withMessage('A valid noteId is required'),
];

const generateQuizValidator = [
  body('noteId').isInt().withMessage('A valid noteId is required'),
  body('mcqCount').optional().isInt({ min: 0, max: 15 }),
  body('trueFalseCount').optional().isInt({ min: 0, max: 15 }),
  body('shortCount').optional().isInt({ min: 0, max: 10 }),
  body('longCount').optional().isInt({ min: 0, max: 5 }),
];

const chatValidator = [
  body('noteId').isInt().withMessage('A valid noteId is required'),
  body('question').trim().notEmpty().withMessage('A question is required').isLength({ max: 1000 }),
  body('sessionId').optional().isInt(),
];

const doubtValidator = [
  body('question').trim().notEmpty().withMessage('A question is required').isLength({ max: 1000 }),
];

module.exports = { summarizeValidator, generateQuizValidator, chatValidator, doubtValidator };
