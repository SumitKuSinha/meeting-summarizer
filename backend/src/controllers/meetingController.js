import fs from 'fs/promises';
import { existsSync } from 'fs';
import Meeting from '../models/Meeting.js';
import { transcribeAudio } from '../services/asrService.js';
import { generateMeetingInsights } from '../services/llmService.js';

/**
 * Controller to handle meeting audio upload, transcription, AI insight generation,
 * and persistence to MongoDB.
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

    // 4. Save processed meeting into MongoDB
    const savedMeeting = await Meeting.create({
      fileName,
      transcript,
      title: insights.title || 'Meeting Summary',
      overview: insights.overview || '',
      key_decisions: Array.isArray(insights.key_decisions) ? insights.key_decisions : [],
      action_items: Array.isArray(insights.action_items) ? insights.action_items : []
    });

    // 5. Return structured response with saved document (including _id)
    return res.status(200).json({
      success: true,
      data: savedMeeting
    });
  } catch (error) {
    console.error('Error in processMeetingAudio controller:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while processing the meeting audio.'
    });
  } finally {
    // 6. Ensure temporary uploaded file is deleted even if processing fails
    if (uploadedFilePath && existsSync(uploadedFilePath)) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (unlinkError) {
        console.error(`Failed to remove temporary file at ${uploadedFilePath}:`, unlinkError);
      }
    }
  }
};

/**
 * Controller to retrieve all saved meetings list.
 * Returns recent meetings sorted by createdAt descending with projection.
 */
export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({}, '_id title fileName createdAt overview')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error('Error in getAllMeetings controller:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch meetings history.'
    });
  }
};

/**
 * Controller to fetch a specific meeting by its ID.
 */
export const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Error in getMeetingById controller:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch meeting details.'
    });
  }
};

/**
 * Controller to delete a specific meeting by its ID.
 */
export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMeeting = await Meeting.findByIdAndDelete(id);

    if (!deletedMeeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found or already deleted.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully.',
      data: { id }
    });
  } catch (error) {
    console.error('Error in deleteMeeting controller:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete meeting.'
    });
  }
};
