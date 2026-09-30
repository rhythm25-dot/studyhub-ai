// This facade is the ONLY thing the rest of the app imports for AI work.
// It currently delegates to geminiService, but nothing outside this file
// knows that. Swapping providers later (OpenAI, Anthropic, etc.) means
// writing a new services/ai/<provider>Service.js with the same generateJSON /
// generateText shape and changing the two require() lines below - nothing
// in controllers, routes, or the frontend needs to change.

const provider = require('./geminiService');

// ---------------------------------------------------------------------
// 1. AI Notes Summarizer
// ---------------------------------------------------------------------
async function summarizeNotes(noteText) {
  const prompt = `
You are an expert academic tutor. Read the study material below and produce a JSON object
(and ONLY a JSON object, no markdown, no extra text) with this exact shape:

{
  "summary": "a clear 4-6 sentence summary of the material",
  "keyConcepts": ["concept 1", "concept 2", "..."],
  "definitions": [{"term": "...", "definition": "..."}],
  "formulas": ["formula 1 with a short label", "..."],
  "examTips": ["tip 1", "tip 2", "..."]
}

If the material has no formulas, return an empty array for "formulas". Keep each list to at most 8 items.

STUDY MATERIAL:
"""${noteText}"""
`.trim();

  return provider.generateJSON(prompt);
}

// ---------------------------------------------------------------------
// 2. AI Quiz Generator
// ---------------------------------------------------------------------
async function generateQuiz(noteText, options = {}) {
  const {
    mcqCount = 5,
    trueFalseCount = 3,
    shortCount = 2,
    longCount = 1,
  } = options;

  const prompt = `
You are creating a quiz for students based on the study material below.
Generate exactly ${mcqCount} multiple-choice questions, ${trueFalseCount} true/false questions,
${shortCount} short-answer questions, and ${longCount} long-answer questions.

Reply with ONLY a JSON array (no markdown) where each item has this exact shape:
{
  "questionText": "...",
  "questionType": "mcq" | "true_false" | "short" | "long",
  "options": ["option A", "option B", "option C", "option D"],   // ONLY for "mcq", omit/empty otherwise
  "correctAnswer": "...",   // the exact correct option text for mcq, "True"/"False" for true_false,
                             // or a model answer for short/long
  "marks": 1   // 1 for mcq/true_false, 3 for short, 5 for long
}

STUDY MATERIAL:
"""${noteText}"""
`.trim();

  return provider.generateJSON(prompt);
}

// ---------------------------------------------------------------------
// 3. AI Chat With Notes
// ---------------------------------------------------------------------
async function chatWithNotes(noteText, conversationHistory, question) {
  const historyText = (conversationHistory || [])
    .slice(-6) // keep prompts small - only recent turns matter for context
    .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
    .join('\n');

  const prompt = `
You are a helpful study tutor answering a student's question using ONLY the study material provided.
If the material doesn't contain the answer, say so honestly rather than making something up.

Reply with ONLY a JSON object of this exact shape:
{
  "answer": "a clear, well-formatted answer using markdown where helpful",
  "sourceReferences": ["short quote or paraphrase 1 from the material that supports the answer", "..."],
  "suggestedQuestions": ["a related follow-up question 1", "related follow-up question 2"]
}

STUDY MATERIAL:
"""${noteText}"""

CONVERSATION SO FAR:
${historyText || '(none yet)'}

STUDENT'S NEW QUESTION: ${question}
`.trim();

  return provider.generateJSON(prompt);
}

// ---------------------------------------------------------------------
// 4. AI Doubt Solver
// ---------------------------------------------------------------------
async function solveDoubt(question) {
  const prompt = `
A student has the following academic doubt/question. Explain it clearly.

Reply with ONLY a JSON object of this exact shape:
{
  "simpleExplanation": "a short, plain-language explanation (2-3 sentences)",
  "detailedExplanation": "a thorough explanation covering the underlying concepts",
  "examples": ["a concrete example 1", "a concrete example 2"],
  "relatedTopics": ["related topic 1", "related topic 2", "related topic 3"]
}

STUDENT'S QUESTION: "${question}"
`.trim();

  return provider.generateJSON(prompt);
}

// ---------------------------------------------------------------------
// 5. AI Assignment Checker
// ---------------------------------------------------------------------
async function checkAssignment(submissionText, rubricText) {
  const prompt = `
You are grading a student's assignment submission against the teacher's rubric.

Reply with ONLY a JSON object of this exact shape:
{
  "grammarScore": 85,       // 0-100, quality of writing/grammar/clarity
  "contentScore": 78,       // 0-100, how well the content meets the rubric
  "suggestions": ["specific suggestion 1", "specific suggestion 2", "..."],
  "overallFeedback": "a short paragraph of constructive overall feedback"
}

RUBRIC / EXPECTATIONS:
"""${rubricText || 'No specific rubric was provided - grade on general academic quality.'}"""

STUDENT SUBMISSION:
"""${submissionText}"""
`.trim();

  return provider.generateJSON(prompt);
}

module.exports = {
  summarizeNotes,
  generateQuiz,
  chatWithNotes,
  solveDoubt,
  checkAssignment,
};
