const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('./ApiError');

// The AI features (summarizer, quiz generator, chat, assignment checker) all
// need the plain text of an uploaded file, not the raw PDF/DOCX bytes.
// This is the one place that downloads a Cloudinary file and converts it
// to text, so every AI controller can just call extractTextFromUrl(url).

const MAX_CHARS = 12000; // keeps Gemini prompts small - controls latency & token cost

async function downloadBuffer(fileUrl) {
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer', timeout: 20000 });
  return Buffer.from(response.data);
}

async function extractTextFromUrl(fileUrl, fileType) {
  try {
    const buffer = await downloadBuffer(fileUrl);

    let text = '';
    if (fileType === 'pdf') {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      throw new ApiError(400, `AI text extraction is not supported for file type "${fileType}". Supported: pdf, docx.`);
    }

    text = text.replace(/\s+/g, ' ').trim();
    if (!text) {
      throw new ApiError(422, 'No readable text could be extracted from this file (it may be a scanned image).');
    }

    return text.slice(0, MAX_CHARS);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, 'Failed to read the file for AI processing. Please try a different file.');
  }
}

module.exports = { extractTextFromUrl };
