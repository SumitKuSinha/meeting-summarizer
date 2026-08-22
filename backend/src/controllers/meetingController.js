import fs from 'fs/promises';
import { existsSync } from 'fs';
import { transcribeAudio } from '../services/asrService.js';
import { generateMeetingInsights } from '../services/llmService.js';

/**
 * Controller to handle meeting audio upload, transcription, and AI insight generation.
 */
export const processMeetingAudio = async (req, res) => {
  const uploadedFilePath = req.file?.path;

  try {
    // 1. Validate file presence
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded. Please upload a file with the field name "audio".'
      });
    }

    const fileName = req.file.originalname;

    // 2. Transcribe Audio using Groq Whisper Large v3
    const transcript = await transcribeAudio(uploadedFilePath);

    if (!transcript || transcript.trim() === '') {
      return res.status(422).json({
        success: false,
        error: 'Unable to extract speech transcript from the provided audio file.'
      });
    }

    // 3. Generate Structured Meeting Insights using Gemini 2.5 Flash
    const insights = await generateMeetingInsights(transcript);

    // 4. Return structured response
    return res.status(200).json({
      success: true,
      data: {
        fileName,
        transcript,
        title: insights.title || 'Meeting Summary',
        overview: insights.overview || '',
        key_decisions: insights.key_decisions || [],
        action_items: insights.action_items || []
      }
    });
  } catch (error) {
    console.error('Error in processMeetingAudio controller:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while processing the meeting audio.'
    });
  } finally {
    // 5. Ensure temporary uploaded file is deleted even if processing fails
    if (uploadedFilePath && existsSync(uploadedFilePath)) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (unlinkError) {
        console.error(`Failed to remove temporary file at ${uploadedFilePath}:`, unlinkError);
      }
    }
  }
};
