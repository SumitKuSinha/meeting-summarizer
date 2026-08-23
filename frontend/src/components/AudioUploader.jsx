import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, X, AlertCircle, ArrowRight, Zap, FileText } from 'lucide-react';

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

    if (file.size > MAX_FILE_SIZE) {
      setValidationError('File size exceeds the 25MB limit. Please upload a smaller file.');
      return;
    }

    const nameLower = file.name.toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.some((ext) => nameLower.endsWith(ext));
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);

    if (!isExtensionValid && !isMimeValid) {
      setValidationError('Unsupported format. Only .mp3, .wav, and .m4a audio files are supported.');
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
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Upload Zone */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-xl border border-dashed transition-all duration-200 p-8 sm:p-10 text-center flex flex-col items-center justify-center ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/5'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/m4a"
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700 transition-colors shadow-sm">
            <UploadCloud className="w-5 h-5" strokeWidth={1.5} />
          </div>

          <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">
            Select or drop meeting recording
          </h3>
          <p className="text-xs text-zinc-400 mb-5 max-w-xs leading-relaxed">
            Drag and drop an audio file here, or{' '}
            <span className="text-indigo-400 hover:underline">browse files</span>
          </p>

          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              MP3, WAV, M4A
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              Max 25MB
            </span>
          </div>
        </div>
      ) : (
        /* File Preview Card */
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md p-5 sm:p-6 shadow-xl animate-fadeIn">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <FileAudio className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-zinc-100 truncate max-w-xs sm:max-w-sm">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 mt-1">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="uppercase text-zinc-400">
                    {selectedFile.name.split('.').pop()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRemoveFile}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleRemoveFile}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-all text-xs font-medium text-center"
            >
              Change file
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:flex-1 py-2 px-5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all duration-150 active:scale-[0.99]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
              <span>Process Audio</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-rose-300 bg-rose-950/30 border border-rose-800/40 rounded-lg p-3 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" strokeWidth={1.5} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
