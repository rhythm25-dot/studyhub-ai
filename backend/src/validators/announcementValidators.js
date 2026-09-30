const { body } = require('express-validator');

const createAnnouncementValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('subjectId').optional({ nullable: true }).isInt().withMessage('subjectId must be an integer'),
];

module.exports = { createAnnouncementValidator };
