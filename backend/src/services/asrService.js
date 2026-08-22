import fs from 'fs';
import { groq } from '../config/apiClients.js';

/**
 * Transcribes a local audio file using Groq Whisper Large v3 model.
 * @param {string} filePath - Path to the audio file.
 * @returns {Promise<string>} - Raw text transcript.
 */
export async function transcribeAudio(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at path: ${filePath}`);
  }

  const fileStream = fs.createReadStream(filePath);

  const transcription = await groq.audio.transcriptions.create({
    file: fileStream,
    model: 'whisper-large-v3',
    response_format: 'verbose_json'
  });

  return transcription.text || '';
}
