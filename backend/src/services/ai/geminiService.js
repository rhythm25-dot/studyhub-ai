const { getModel } = require('../../config/gemini');
const ApiError = require('../../utils/ApiError');

// This is the single point of contact with the Gemini API. Every prompt
// asks the model to reply with JSON ONLY (no markdown, no commentary) so
// the rest of the app can treat AI output as structured data. If Google's
// SDK or model name ever changes, this is the only file that needs to change -
// aiService.js (the facade) and all controllers stay untouched.

function stripCodeFences(text) {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim();
}

async function generateJSON(prompt) {
  let raw;
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    raw = result.response.text();
  } catch (err) {
    console.error('Gemini API error:', err.message);
    throw new ApiError(502, 'The AI service is temporarily unavailable. Please try again shortly.');
  }

  try {
    return JSON.parse(stripCodeFences(raw));
  } catch (err) {
    console.error('Gemini returned non-JSON output:', raw?.slice(0, 300));
    throw new ApiError(502, 'The AI returned an unexpected response. Please try again.');
  }
}

async function generateText(prompt) {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini API error:', err.message);
    throw new ApiError(502, 'The AI service is temporarily unavailable. Please try again shortly.');
  }
}

module.exports = { generateJSON, generateText };
