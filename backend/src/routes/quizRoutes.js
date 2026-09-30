const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const {
  createQuizValidator,
  addQuestionValidator,
  submitAnswerValidator,
  gradeAnswerValidator,
} = require('../validators/quizValidators');

router.use(protect);

router.post('/', roleGuard('teacher'), createQuizValidator, validate, quizController.createQuiz);
router.get('/', quizController.getQuizzes);
router.get('/:id', quizController.getQuizById);
router.patch('/:id/publish', roleGuard('teacher'), quizController.publishQuiz);
router.delete('/:id', roleGuard('teacher'), quizController.deleteQuiz);

router.post('/:id/questions', roleGuard('teacher'), addQuestionValidator, validate, quizController.addQuestion);
router.post('/:id/questions/bulk', roleGuard('teacher'), quizController.addQuestionsBulk);
router.patch('/questions/:questionId', roleGuard('teacher'), quizController.updateQuestion);
router.delete('/questions/:questionId', roleGuard('teacher'), quizController.deleteQuestion);

router.post('/:id/start', roleGuard('student'), quizController.startQuiz);
router.post('/attempts/:attemptId/submit', roleGuard('student'), submitAnswerValidator, validate, quizController.submitAttempt);
router.get('/attempts/:attemptId/result', quizController.getAttemptResult);
router.get('/:id/my-attempts', roleGuard('student'), quizController.getMyAttempts);
router.get('/:id/attempts', roleGuard('teacher'), quizController.getQuizAttempts);
router.patch('/answers/:answerId/grade', roleGuard('teacher'), gradeAnswerValidator, validate, quizController.gradeAnswer);

module.exports = router;
