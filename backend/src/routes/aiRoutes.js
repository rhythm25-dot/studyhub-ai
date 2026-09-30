const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  summarizeValidator,
  generateQuizValidator,
  chatValidator,
  doubtValidator,
} = require('../validators/aiValidators');

router.use(protect, aiLimiter);

// 1. Notes Summarizer
router.post('/summarize', roleGuard('student'), summarizeValidator, validate, aiController.summarizeNote);

// 2. Quiz Generator
router.post('/generate-quiz', roleGuard('teacher'), generateQuizValidator, validate, aiController.generateQuizFromNote);

// 3. Chat With Notes
router.post('/chat', roleGuard('student'), chatValidator, validate, aiController.chatWithNotes);
router.get('/chat/sessions', roleGuard('student'), aiController.getChatSessions);
router.get('/chat/sessions/:id/messages', roleGuard('student'), aiController.getChatMessages);

// 4. Doubt Solver
router.post('/doubt', roleGuard('student'), doubtValidator, validate, aiController.solveDoubt);
router.get('/doubt/history', roleGuard('student'), aiController.getDoubtHistory);

// 5. Assignment Checker
router.post('/check-assignment/:submissionId', roleGuard('teacher'), aiController.checkAssignment);

module.exports = router;
