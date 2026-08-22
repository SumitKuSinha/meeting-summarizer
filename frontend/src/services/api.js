import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for large audio processing
});

/**
 * Uploads an audio file and triggers the meeting transcription and analysis pipeline.
 * @param {File} audioFile - The audio file to process (.mp3, .wav, .m4a)
 * @param {Function} [onUploadProgress] - Callback to report upload percentage
 * @returns {Promise<Object>} Processed meeting insights data
 */
export async function processAudioMeeting(audioFile, onUploadProgress) {
  const formData = new FormData();
  formData.append('audio', audioFile);

  const response = await apiClient.post('/meetings/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
}

export default {
  processAudioMeeting,
};
