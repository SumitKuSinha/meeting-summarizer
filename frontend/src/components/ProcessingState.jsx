import React, { useEffect, useState } from 'react';
import { UploadCloud, AudioLines, Sparkles, Check, Loader2 } from 'lucide-react';

export default function ProcessingState({ uploadProgress = 0 }) {
  const [activeStage, setActiveStage] = useState(1);

  useEffect(() => {
    if (uploadProgress < 100) {
      setActiveStage(1);
    } else {
      setActiveStage(2);
      const timer = setTimeout(() => {
        setActiveStage(3);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [uploadProgress]);

  const stages = [
    {
      id: 1,
      title: 'Upload Audio',
      description: uploadProgress < 100 ? `Streaming binary payload (${uploadProgress}%)` : 'Payload transferred successfully',
      icon: UploadCloud,
    },
    {
      id: 2,
      title: 'Speech Transcription',
      description: 'Groq Whisper Large-v3 running acoustic model inference...',
      icon: AudioLines,
    },
    {
      id: 3,
      title: 'Insight Extraction',
      description: 'Gemini 2.5 Flash parsing decisions and action items...',
      icon: Sparkles,
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto py-6">
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-6 sm:p-7 backdrop-blur-md shadow-2xl">
        {/* Header Indicator */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">
            Processing Pipeline Active
          </h3>
          <p className="text-xs text-zinc-400 text-center max-w-xs">
            Analyzing audio stream and extracting structured meeting metadata.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2.5">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isCompleted = activeStage > stage.id;
            const isCurrent = activeStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex items-start space-x-3.5 p-3 rounded-lg border transition-all duration-200 ${
                  isCurrent
                    ? 'bg-zinc-900/90 border-zinc-700/90 shadow-sm'
                    : isCompleted
                    ? 'bg-zinc-900/40 border-zinc-800/60'
                    : 'bg-zinc-950/30 border-zinc-900/60 opacity-40'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Check className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-medium ${
                        isCurrent
                          ? 'text-zinc-100'
                          : isCompleted
                          ? 'text-zinc-300'
                          : 'text-zinc-500'
                      }`}
                    >
                      {stage.title}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                        Running
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
