import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AudioUploader from './components/AudioUploader';
import ProcessingState from './components/ProcessingState';
import MeetingInsights from './components/MeetingInsights';
import HistoryDrawer from './components/HistoryDrawer';
import { processAudioMeeting } from './services/api';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle' | 'processing' | 'completed' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
        throw new Error(response.error || 'Failed to process the audio recording.');
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

  const handleSelectMeetingFromHistory = (meeting) => {
    setAnalysisResult(meeting);
    setAppState('completed');
    setErrorMessage('');
  };

  const handleMeetingDeleted = (deletedMeetingId) => {
    if (analysisResult && analysisResult._id === deletedMeetingId) {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-radial-glow text-zinc-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation */}
      <Navbar onOpenHistory={() => setIsHistoryOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col items-center justify-center">
        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full max-w-xl mb-6 p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 flex items-start justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <h4 className="text-xs font-semibold text-rose-200">Processing Failed</h4>
                <p className="text-xs text-rose-400/90 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-900/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Hero Section */}
        {(appState === 'idle' || appState === 'error') && (
          <div className="text-center max-w-2xl mb-8 space-y-3 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
              High-Precision Meeting Summaries
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Transcribe audio recordings with Groq Whisper Large-v3 and extract structured decisions and action items with Google Gemini.
            </p>
          </div>
        )}

        {/* Dynamic Views */}
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
          <div className="flex flex-col items-center space-y-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-all active:scale-[0.99] shadow-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Slide-over History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectMeeting={handleSelectMeetingFromHistory}
        currentMeetingId={analysisResult?._id}
        onMeetingDeleted={handleMeetingDeleted}
      />

      {/* Minimalist SaaS Footer */}
      <footer className="border-t border-zinc-900 py-5 text-center text-[11px] font-mono text-zinc-400">
        <p>InsightSync Engine • Groq Whisper Large-v3 • Google Gemini • MongoDB</p>
      </footer>
    </div>
  );
}
