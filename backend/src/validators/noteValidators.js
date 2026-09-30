const { body } = require('express-validator');

const createNoteValidator = [
  body('subjectId').isInt().withMessage('A valid subjectId is required'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

const updateNoteValidator = [
  body('title').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

module.exports = { createNoteValidator, updateNoteValidator };
