const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subjectController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const {
  createSubjectValidator,
  updateSubjectValidator,
  enrollValidator,
} = require('../validators/subjectValidators');

router.use(protect);

router.post('/', roleGuard('teacher'), createSubjectValidator, validate, subjectController.createSubject);
router.get('/', subjectController.getSubjects);
router.get('/:id', subjectController.getSubjectById);
router.patch('/:id', roleGuard('teacher'), updateSubjectValidator, validate, subjectController.updateSubject);
router.delete('/:id', roleGuard('teacher', 'admin'), subjectController.deleteSubject);

router.get('/:id/students', roleGuard('teacher', 'admin'), subjectController.getEnrolledStudents);
router.post('/:id/enroll', roleGuard('teacher'), enrollValidator, validate, subjectController.enrollStudent);
router.delete('/:id/enroll/:studentId', roleGuard('teacher'), subjectController.unenrollStudent);

module.exports = router;
