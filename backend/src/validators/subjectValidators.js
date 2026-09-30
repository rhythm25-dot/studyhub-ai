const { body } = require('express-validator');

const createSubjectValidator = [
  body('name').trim().notEmpty().withMessage('Subject name is required').isLength({ max: 150 }),
  body('code').trim().notEmpty().withMessage('Subject code is required').isLength({ max: 30 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('coverColor').optional().trim().isLength({ max: 20 }),
];

const updateSubjectValidator = [
  body('name').optional().trim().isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('coverColor').optional().trim().isLength({ max: 20 }),
];

const enrollValidator = [
  body('studentId').isInt().withMessage('A valid studentId is required'),
];

module.exports = { createSubjectValidator, updateSubjectValidator, enrollValidator };
