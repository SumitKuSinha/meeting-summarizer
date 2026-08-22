import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, X, AlertCircle, ArrowRight, Music, Zap } from 'lucide-react';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a'];
const ALLOWED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/aac',
];

export default function AudioUploader({ onStartAnalysis }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setValidationError('');

    if (!file) return;

    // Check size
    if (file.size > MAX_FILE_SIZE) {
      setValidationError('File size exceeds the 25MB limit. Please upload a smaller file.');
      return;
    }

    // Check format
    const nameLower = file.name.toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.some((ext) => nameLower.endsWith(ext));
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);

    if (!isExtensionValid && !isMimeValid) {
      setValidationError('Unsupported format. Please upload an audio file (.mp3, .wav, or .m4a).');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onStartAnalysis(selectedFile);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Zone */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center ${
            dragActive
              ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-brand-500/50 bg-slate-800/40 hover:bg-slate-800/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/m4a"
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-brand-500/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-brand-500/20 transition-transform">
            <UploadCloud className="w-8 h-8 text-brand-400" />
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-2">
            Upload Meeting Recording
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-4">
            Drag and drop your audio file here, or{' '}
            <span className="text-brand-400 font-medium hover:underline">browse your files</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
              MP3, WAV, M4A
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
              Max 25 MB
            </span>
          </div>
        </div>
      ) : (
        /* File Preview Card */
        <div className="rounded-2xl border border-slate-700/80 bg-slate-800/60 backdrop-blur-sm p-6 sm:p-8 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0">
                <FileAudio className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-semibold text-slate-100 truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="uppercase font-medium text-brand-400">
                    {selectedFile.name.split('.').pop()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRemoveFile}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleRemoveFile}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium text-center"
            >
              Change File
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              <Zap className="w-4 h-4" />
              <span>Analyze Meeting</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="mt-4 flex items-center space-x-2 text-sm text-red-400 bg-red-950/40 border border-red-800/60 rounded-xl p-3.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
