const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const quizModel = require('../models/quizModel');
const { assertTeacherOwnsSubject } = require('./subjectController');
const notificationService = require('../services/notificationService');

// Objective question types (mcq, true_false) are graded automatically by
// comparing the trimmed, case-insensitive student answer to correct_answer.
// Subjective types (short, long) are left ungraded (marks_awarded = null)
// for the teacher to review manually.
function isObjective(questionType) {
  return questionType === 'mcq' || questionType === 'true_false';
}

// POST /api/quizzes  (teacher)
const createQuiz = asyncHandler(async (req, res) => {
  const { subjectId, title, description, durationMinutes } = req.body;
  await assertTeacherOwnsSubject(subjectId, req.user.id);

  const quiz = await quizModel.create({
    subjectId, teacherId: req.user.id, title, description, durationMinutes,
  });
  return success(res, 201, 'Quiz created successfully', { quiz });
});

// GET /api/quizzes
const getQuizzes = asyncHandler(async (req, res) => {
  const { subjectId, page = 1, limit = 20 } = req.query;
  const { rows, total } = await quizModel.findForUser(req.user, { subjectId, page, limit });
  return success(res, 200, 'Quizzes fetched', { quizzes: rows }, {
    page: Number(page), limit: Number(limit), total,
  });
});

// GET /api/quizzes/:id  - students never receive correct_answer here
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await quizModel.findById(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found');

  const isOwner = req.user.role === 'teacher' && quiz.teacher_id === req.user.id;
  const questions = await quizModel.listQuestions(quiz.id, { includeAnswers: isOwner || req.user.role === 'admin' });

  return success(res, 200, 'Quiz fetched', { quiz, questions });
});

// PATCH /api/quizzes/:id/publish  (owning teacher)
const publishQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizModel.findById(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  if (quiz.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this quiz');

  const { isPublished } = req.body;
  const updated = await quizModel.publish(req.params.id, isPublished);

  if (isPublished) {
    notificationService.notifySubjectStudents(quiz.subject_id, {
      type: 'new_quiz',
      title: 'New quiz available',
      message: `"${quiz.title}" is now open`,
      link: `/quizzes/${quiz.id}`,
    }).catch((err) => console.error('Notification error:', err.message));
  }

  return success(res, 200, `Quiz ${isPublished ? 'published' : 'unpublished'}`, { quiz: updated });
});

// DELETE /api/quizzes/:id  (owning teacher)
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizModel.findById(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  if (quiz.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this quiz');

  await quizModel.remove(req.params.id);
  return success(res, 200, 'Quiz deleted successfully');
});

// POST /api/quizzes/:id/questions  (owning teacher) - add one question
const addQuestion = asyncHandler(async (req, res) => {
  const quiz = await quizModel.findById(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  if (quiz.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this quiz');

  const { questionText, questionType, options, correctAnswer, marks } = req.body;
  if (questionType === 'mcq' && (!options || options.length < 2)) {
    throw new ApiError(400, 'MCQ questions need at least 2 options');
  }

  const id = await quizModel.addQuestion(req.params.id, {
    questionText, questionType, options, correctAnswer, marks,
  });
  return success(res, 201, 'Question added successfully', { questionId: id });
});

// POST /api/quizzes/:id/questions/bulk  (owning teacher) - used by the AI Quiz Generator
// to save a batch of AI-drafted (and teacher-edited) questions in one call.
const addQuestionsBulk = asyncHandler(async (req, res) => {
  const quiz = await quizModel.findById(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  if (quiz.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this quiz');

  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, 'questions must be a non-empty array');
  }

  const ids = await quizModel.addQuestionsBulk(req.params.id, questions);
  return success(res, 201, `${ids.length} questions added successfully`, { questionIds: ids });
});

// PATCH /api/quizzes/questions/:questionId  (owning teacher) - edit a question
const updateQuestion = asyncHandler(async (req, res) => {
  const { questionText, options, correctAnswer, marks } = req.body;
  await quizModel.updateQuestion(req.params.questionId, { questionText, options, correctAnswer, marks });
  return success(res, 200, 'Question updated successfully');
});

// DELETE /api/quizzes/questions/:questionId  (owning teacher)
const deleteQuestion = asyncHandler(async (req, res) => {
  await quizModel.removeQuestion(req.params.questionId);
  return success(res, 200, 'Question deleted successfully');
});

// POST /api/quizzes/:id/start  (student) - begins or resumes an attempt
const startQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizModel.findById(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  if (!quiz.is_published) throw new ApiError(403, 'This quiz is not available yet');

  let attempt = await quizModel.findActiveAttempt(quiz.id, req.user.id);
  if (!attempt) {
    attempt = await quizModel.startAttempt(quiz.id, req.user.id);
  }

  const questions = await quizModel.listQuestions(quiz.id, { includeAnswers: false });
  return success(res, 200, 'Quiz attempt started', { attempt, questions });
});

// POST /api/quizzes/attempts/:attemptId/submit  (student)
// body: { answers: [{ questionId, answer }] }
const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await quizModel.findAttemptById(req.params.attemptId);
  if (!attempt) throw new ApiError(404, 'Attempt not found');
  if (attempt.student_id !== req.user.id) throw new ApiError(403, 'This is not your attempt');
  if (attempt.status !== 'in_progress') throw new ApiError(400, 'This attempt was already submitted');

  const { answers } = req.body;
  const questions = await quizModel.listQuestions(attempt.quiz_id, { includeAnswers: true });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let score = 0;
  let totalMarks = 0;
  let hasSubjective = false;

  for (const q of questions) totalMarks += q.marks;

  for (const ans of answers) {
    const question = questionMap.get(ans.questionId);
    if (!question) continue;

    if (isObjective(question.question_type)) {
      const isCorrect = String(ans.answer).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase();
      const marksAwarded = isCorrect ? question.marks : 0;
      score += marksAwarded;
      await quizModel.saveAnswer(attempt.id, question.id, {
        studentAnswer: ans.answer, isCorrect, marksAwarded,
      });
    } else {
      hasSubjective = true;
      await quizModel.saveAnswer(attempt.id, question.id, {
        studentAnswer: ans.answer, isCorrect: null, marksAwarded: null,
      });
    }
  }

  // If there are only objective questions, we can finalize the score now.
  // If any subjective question exists, mark as "submitted" (needs teacher review)
  // rather than "evaluated".
  const status = hasSubjective ? 'submitted' : 'evaluated';
  const updated = await quizModel.submitAttempt(attempt.id, {
    score: hasSubjective ? null : score,
    totalMarks,
    status,
  });

  return success(res, 200, 'Quiz submitted successfully', { attempt: updated });
});

// GET /api/quizzes/:id/my-attempts  (student)
const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await quizModel.findMyAttempts(req.params.id, req.user.id);
  return success(res, 200, 'Attempts fetched', { attempts });
});

// GET /api/quizzes/attempts/:attemptId/result  (student who owns it, or owning teacher)
const getAttemptResult = asyncHandler(async (req, res) => {
  const attempt = await quizModel.findAttemptById(req.params.attemptId);
  if (!attempt) throw new ApiError(404, 'Attempt not found');

  const quiz = await quizModel.findById(attempt.quiz_id);
  const isOwner = attempt.student_id === req.user.id;
  const isTeacher = req.user.role === 'teacher' && quiz.teacher_id === req.user.id;
  if (!isOwner && !isTeacher && req.user.role !== 'admin') {
    throw new ApiError(403, 'You cannot view this result');
  }

  const answers = await quizModel.listAnswers(attempt.id);
  return success(res, 200, 'Result fetched', { attempt, answers });
});

// GET /api/quizzes/:id/attempts  (owning teacher) - all student attempts, for grading subjective answers
const getQuizAttempts = asyncHandler(async (req, res) => {
  const quiz = await quizModel.findById(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  if (quiz.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this quiz');

  const attempts = await quizModel.listAttemptsForQuiz(req.params.id);
  return success(res, 200, 'Attempts fetched', { attempts });
});

// PATCH /api/quizzes/answers/:answerId/grade  (owning teacher) - score one short/long answer.
// Once every answer on the attempt has a score, the attempt is automatically
// finalized (status -> evaluated, total score computed) and the student notified.
const gradeAnswer = asyncHandler(async (req, res) => {
  const { marksAwarded } = req.body;
  const answer = await quizModel.findAnswerWithOwner(req.params.answerId);
  if (!answer) throw new ApiError(404, 'Answer not found');
  if (answer.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this quiz');
  if (marksAwarded < 0) throw new ApiError(400, 'marksAwarded cannot be negative');

  await quizModel.gradeAnswer(req.params.answerId, marksAwarded);
  const finalizedAttempt = await quizModel.finalizeAttemptIfComplete(answer.attempt_id);

  if (finalizedAttempt) {
    const quiz = await quizModel.findById(answer.quiz_id);
    notificationService.notifyUser(answer.student_id, {
      type: 'quiz_graded',
      title: 'Quiz graded',
      message: `"${quiz.title}" was graded: ${finalizedAttempt.score}/${finalizedAttempt.total_marks}`,
      link: `/quizzes/attempts/${answer.attempt_id}/result`,
    }).catch((err) => console.error('Notification error:', err.message));
  }

  return success(res, 200, finalizedAttempt ? 'Answer graded — quiz fully evaluated' : 'Answer graded', {
    finalized: Boolean(finalizedAttempt),
    attempt: finalizedAttempt,
  });
});

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  publishQuiz,
  deleteQuiz,
  addQuestion,
  addQuestionsBulk,
  updateQuestion,
  deleteQuestion,
  startQuiz,
  submitAttempt,
  getMyAttempts,
  getAttemptResult,
  getQuizAttempts,
  gradeAnswer,
};
