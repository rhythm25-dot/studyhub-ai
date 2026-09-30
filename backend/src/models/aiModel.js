const { pool } = require('../config/db');

// --- AI Notes Summarizer ---

async function saveSummary(noteId, studentId, { summary, keyConcepts, definitions, formulas, examTips }) {
  const [result] = await pool.query(
    `INSERT INTO ai_summaries (note_id, student_id, summary, key_concepts, definitions, formulas, exam_tips)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [noteId, studentId, summary, JSON.stringify(keyConcepts || []), JSON.stringify(definitions || []),
      JSON.stringify(formulas || []), JSON.stringify(examTips || [])]
  );
  return findSummaryById(result.insertId);
}

async function findSummaryById(id) {
  const [rows] = await pool.query('SELECT * FROM ai_summaries WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findLatestSummary(noteId, studentId) {
  const [rows] = await pool.query(
    'SELECT * FROM ai_summaries WHERE note_id = ? AND student_id = ? ORDER BY created_at DESC LIMIT 1',
    [noteId, studentId]
  );
  return rows[0] || null;
}

// --- AI Chat With Notes ---

async function createChatSession(noteId, studentId, title) {
  const [result] = await pool.query(
    'INSERT INTO ai_chat_sessions (note_id, student_id, title) VALUES (?, ?, ?)',
    [noteId, studentId, title || 'New Chat']
  );
  return result.insertId;
}

async function findChatSession(id) {
  const [rows] = await pool.query('SELECT * FROM ai_chat_sessions WHERE id = ?', [id]);
  return rows[0] || null;
}

async function listChatSessions(studentId, noteId) {
  const params = [studentId];
  let noteFilter = '';
  if (noteId) {
    noteFilter = 'AND note_id = ?';
    params.push(noteId);
  }
  const [rows] = await pool.query(
    `SELECT * FROM ai_chat_sessions WHERE student_id = ? ${noteFilter} ORDER BY created_at DESC`,
    params
  );
  return rows;
}

async function addChatMessage(sessionId, role, content, sources = null) {
  await pool.query(
    'INSERT INTO ai_chat_messages (session_id, role, content, sources) VALUES (?, ?, ?, ?)',
    [sessionId, role, content, sources ? JSON.stringify(sources) : null]
  );
}

async function listChatMessages(sessionId) {
  const [rows] = await pool.query(
    'SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC',
    [sessionId]
  );
  return rows;
}

// --- AI Doubt Solver ---

async function saveDoubt(studentId, question, { simpleExplanation, detailedExplanation, examples, relatedTopics }) {
  const [result] = await pool.query(
    `INSERT INTO ai_doubts (student_id, question, simple_explanation, detailed_explanation, examples, related_topics)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [studentId, question, simpleExplanation, detailedExplanation,
      JSON.stringify(examples || []), JSON.stringify(relatedTopics || [])]
  );
  const [rows] = await pool.query('SELECT * FROM ai_doubts WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function listDoubts(studentId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    'SELECT * FROM ai_doubts WHERE student_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [studentId, Number(limit), Number(offset)]
  );
  return rows;
}

module.exports = {
  saveSummary,
  findSummaryById,
  findLatestSummary,
  createChatSession,
  findChatSession,
  listChatSessions,
  addChatMessage,
  listChatMessages,
  saveDoubt,
  listDoubts,
};
