import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AudioUploader from './components/AudioUploader';
import ProcessingState from './components/ProcessingState';
import MeetingInsights from './components/MeetingInsights';
import { processAudioMeeting } from './services/api';
import { AlertTriangle, X, Sparkles } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle' | 'processing' | 'completed' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStartAnalysis = async (file) => {
    setAppState('processing');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const response = await processAudioMeeting(file, (progress) => {
        setUploadProgress(progress);
      });

      if (response && response.success && response.data) {
        setAnalysisResult(response.data);
        setAppState('completed');
      } else {
        throw new Error(response.error || 'Failed to process the audio meeting.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        'An unexpected error occurred while communicating with the server.';
      setErrorMessage(msg);
      setAppState('error');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setAnalysisResult(null);
    setErrorMessage('');
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="w-full max-w-2xl mb-8 p-4 rounded-2xl bg-red-950/60 border border-red-800/80 backdrop-blur-md text-red-200 flex items-start justify-between gap-3 shadow-xl animate-fadeIn">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-100">Processing Failed</h4>
                <p className="text-xs sm:text-sm text-red-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="p-1 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-900/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Header (Shown only when in idle or error state) */}
        {(appState === 'idle' || appState === 'error') && (
          <div className="text-center max-w-2xl mb-10 space-y-3 animate-fadeIn">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Turn Audio into Structured Insights</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Instant AI Meeting Summaries
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Upload your meeting recording. Groq Whisper transcribes speech in seconds, and Google Gemini extracts key decisions and action items automatically.
            </p>
          </div>
        )}

        {/* State Conditional Views */}
        {appState === 'idle' && (
          <AudioUploader onStartAnalysis={handleStartAnalysis} />
        )}

        {appState === 'processing' && (
          <ProcessingState uploadProgress={uploadProgress} />
        )}

        {appState === 'completed' && analysisResult && (
          <MeetingInsights data={analysisResult} onReset={handleReset} />
        )}

        {appState === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all shadow-lg shadow-brand-500/25"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 InsightSync — Powered by Groq Whisper & Google Gemini AI</p>
      </footer>
    </div>
  );
}
