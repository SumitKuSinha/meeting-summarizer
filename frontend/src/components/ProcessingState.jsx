import React, { useEffect, useState } from 'react';
import { UploadCloud, AudioLines, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

export default function ProcessingState({ uploadProgress = 0 }) {
  // Simulate active stage transitions for smooth user feedback
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
      title: 'Uploading Audio File',
      description: uploadProgress < 100 ? `Sending payload to server (${uploadProgress}%)` : 'Upload complete',
      icon: UploadCloud,
    },
    {
      id: 2,
      title: 'Transcribing Audio',
      description: 'Groq Whisper Large-v3 converting speech to text...',
      icon: AudioLines,
    },
    {
      id: 3,
      title: 'Extracting Meeting Intelligence',
      description: 'Gemini 2.5 Flash analyzing decisions & action items...',
      icon: Sparkles,
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto py-8">
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
        {/* Animated Radar / Pulsing Wave */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-24 h-24 rounded-full bg-brand-500/20 animate-ping opacity-75"></div>
            <div className="absolute w-16 h-16 rounded-full bg-indigo-500/30 animate-pulse"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/30 z-10">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-100 mt-6 mb-1">
            Analyzing Meeting Audio
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 text-center max-w-sm">
            Please wait while our speech and intelligence pipeline processes your recording.
          </p>
        </div>

        {/* Step Progress List */}
        <div className="space-y-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isCompleted = activeStage > stage.id;
            const isCurrent = activeStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex items-start space-x-4 p-3.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-brand-500/10 border-brand-500/30 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-800/80 border-slate-700/50'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-50'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 animate-pulse">
                      <Icon className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                      <Icon className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-brand-300'
                          : isCompleted
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {stage.title}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
