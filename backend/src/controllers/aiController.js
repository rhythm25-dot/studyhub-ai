const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const aiService = require('../services/ai/aiService');
const aiModel = require('../models/aiModel');
const noteModel = require('../models/noteModel');
const assignmentModel = require('../models/assignmentModel');
const subjectModel = require('../models/subjectModel');
const { extractTextFromUrl } = require('../utils/fileTextExtractor');

// Shared guard: a student may only run AI tools against notes from
// subjects they're actually enrolled in.
async function assertStudentCanAccessNote(note, studentId) {
  const enrolled = await subjectModel.isStudentEnrolled(note.subject_id, studentId);
  if (!enrolled) throw new ApiError(403, 'You do not have access to this note');
}

// ---------------------------------------------------------------------
// 1. POST /api/ai/summarize  (student)  body: { noteId }
// ---------------------------------------------------------------------
const summarizeNote = asyncHandler(async (req, res) => {
  const { noteId } = req.body;
  const note = await noteModel.findById(noteId);
  if (!note) throw new ApiError(404, 'Note not found');
  await assertStudentCanAccessNote(note, req.user.id);

  const text = await extractTextFromUrl(note.file_url, note.file_type);
  const result = await aiService.summarizeNotes(text);
  const saved = await aiModel.saveSummary(noteId, req.user.id, result);

  return success(res, 200, 'Summary generated successfully', { summary: saved });
});

// ---------------------------------------------------------------------
// 2. POST /api/ai/generate-quiz  (teacher)  body: { noteId, mcqCount, trueFalseCount, shortCount, longCount }
//    Returns draft questions only - the teacher reviews/edits them in the
//    UI, then saves the final set via POST /api/quizzes/:id/questions/bulk.
// ---------------------------------------------------------------------
const generateQuizFromNote = asyncHandler(async (req, res) => {
  const { noteId, mcqCount, trueFalseCount, shortCount, longCount } = req.body;
  const note = await noteModel.findById(noteId);
  if (!note) throw new ApiError(404, 'Note not found');
  if (note.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this note');

  const text = await extractTextFromUrl(note.file_url, note.file_type);
  const questions = await aiService.generateQuiz(text, { mcqCount, trueFalseCount, shortCount, longCount });

  return success(res, 200, 'Quiz questions generated - review and save them', { questions });
});

// ---------------------------------------------------------------------
// 3. POST /api/ai/chat  (student)  body: { noteId, question, sessionId? }
// ---------------------------------------------------------------------
const chatWithNotes = asyncHandler(async (req, res) => {
  const { noteId, question } = req.body;
  let { sessionId } = req.body;

  const note = await noteModel.findById(noteId);
  if (!note) throw new ApiError(404, 'Note not found');
  await assertStudentCanAccessNote(note, req.user.id);

  if (sessionId) {
    const session = await aiModel.findChatSession(sessionId);
    if (!session || session.student_id !== req.user.id) throw new ApiError(404, 'Chat session not found');
  } else {
    sessionId = await aiModel.createChatSession(noteId, req.user.id, question.slice(0, 60));
  }

  const history = await aiModel.listChatMessages(sessionId);
  const text = await extractTextFromUrl(note.file_url, note.file_type);
  const result = await aiService.chatWithNotes(text, history, question);

  await aiModel.addChatMessage(sessionId, 'user', question);
  await aiModel.addChatMessage(sessionId, 'assistant', result.answer, result.sourceReferences);

  return success(res, 200, 'Response generated', {
    sessionId,
    answer: result.answer,
    sourceReferences: result.sourceReferences || [],
    suggestedQuestions: result.suggestedQuestions || [],
  });
});

// GET /api/ai/chat/sessions?noteId=  (student)
const getChatSessions = asyncHandler(async (req, res) => {
  const sessions = await aiModel.listChatSessions(req.user.id, req.query.noteId);
  return success(res, 200, 'Chat sessions fetched', { sessions });
});

// GET /api/ai/chat/sessions/:id/messages  (student, owner only)
const getChatMessages = asyncHandler(async (req, res) => {
  const session = await aiModel.findChatSession(req.params.id);
  if (!session || session.student_id !== req.user.id) throw new ApiError(404, 'Chat session not found');

  const messages = await aiModel.listChatMessages(req.params.id);
  return success(res, 200, 'Messages fetched', { session, messages });
});

// ---------------------------------------------------------------------
// 4. POST /api/ai/doubt  (student)  body: { question }
// ---------------------------------------------------------------------
const solveDoubt = asyncHandler(async (req, res) => {
  const { question } = req.body;
  const result = await aiService.solveDoubt(question);
  const saved = await aiModel.saveDoubt(req.user.id, question, result);
  return success(res, 200, 'Doubt solved', { doubt: saved });
});

// GET /api/ai/doubt/history  (student)
const getDoubtHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const doubts = await aiModel.listDoubts(req.user.id, { page, limit });
  return success(res, 200, 'Doubt history fetched', { doubts });
});

// ---------------------------------------------------------------------
// 5. POST /api/ai/check-assignment/:submissionId  (owning teacher)
//    Submission must be a pdf/docx; rubric is optional (assignment.rubric_url).
// ---------------------------------------------------------------------
const checkAssignment = asyncHandler(async (req, res) => {
  const submission = await assignmentModel.findSubmissionById(req.params.submissionId);
  if (!submission) throw new ApiError(404, 'Submission not found');
  if (submission.teacher_id !== req.user.id) throw new ApiError(403, 'You do not own this assignment');

  const submissionFileType = submission.file_url.split('.').pop().toLowerCase() === 'pdf' ? 'pdf' : 'docx';
  const submissionText = await extractTextFromUrl(submission.file_url, submissionFileType);

  let rubricText = '';
  if (submission.rubric_url) {
    const rubricFileType = submission.rubric_url.split('.').pop().toLowerCase() === 'pdf' ? 'pdf' : 'docx';
    rubricText = await extractTextFromUrl(submission.rubric_url, rubricFileType);
  }

  const result = await aiService.checkAssignment(submissionText, rubricText);
  const updated = await assignmentModel.saveAiFeedback(submission.id, {
    grammarScore: result.grammarScore,
    contentScore: result.contentScore,
    feedback: JSON.stringify({ suggestions: result.suggestions, overallFeedback: result.overallFeedback }),
  });

  return success(res, 200, 'AI feedback generated', {
    submission: updated,
    suggestions: result.suggestions,
    overallFeedback: result.overallFeedback,
  });
});

module.exports = {
  summarizeNote,
  generateQuizFromNote,
  chatWithNotes,
  getChatSessions,
  getChatMessages,
  solveDoubt,
  getDoubtHistory,
  checkAssignment,
};
