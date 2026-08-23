import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle,
  ListTodo,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Tag,
  User,
  AlertCircle
} from 'lucide-react';

export default function MeetingInsights({ data, onReset }) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState('');

  const {
    fileName = 'audio-recording',
    title = 'Executive Meeting Summary',
    overview = '',
    key_decisions = [],
    action_items = [],
    transcript = '',
    createdAt,
  } = data || {};

  const formattedDate = useMemo(() => {
    const dateObj = createdAt ? new Date(createdAt) : new Date();
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [createdAt]);

  // Filter transcript text based on search keyword
  const highlightedTranscript = useMemo(() => {
    if (!transcriptSearch.trim()) return transcript;
    return transcript;
  }, [transcript, transcriptSearch]);

  // Format full meeting insights as clean Markdown for export/copying
  const generateMarkdownSummary = () => {
    let md = `# ${title}\n\n`;
    md += `**Date:** ${formattedDate}\n`;
    md += `**Source File:** ${fileName}\n\n`;
    md += `## 📌 Executive Overview\n${overview}\n\n`;

    if (key_decisions.length > 0) {
      md += `## ✅ Key Decisions\n`;
      key_decisions.forEach((decision) => {
        md += `- ${decision}\n`;
      });
      md += `\n`;
    }

    if (action_items.length > 0) {
      md += `## 📋 Action Items\n`;
      action_items.forEach((item) => {
        md += `- [ ] **${item.task}** | Assignee: ${item.assignee || 'Unassigned'} | Priority: ${item.priority || 'Medium'}\n`;
      });
      md += `\n`;
    }

    if (transcript) {
      md += `## 🎙️ Full Transcript\n${transcript}\n`;
    }

    return md;
  };

  const handleCopySummary = async () => {
    try {
      const markdown = generateMarkdownSummary();
      await navigator.clipboard.writeText(markdown);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2500);
    } catch (err) {
      console.error('Failed to copy transcript:', err);
    }
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          High
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-600/40">
        Low
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Tag className="w-4 h-4 text-brand-400" />
          <span className="truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopySummary}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-colors"
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Summary Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Summary (Markdown)</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-medium shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.01]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Upload New Recording</span>
          </button>
        </div>
      </div>

      {/* 1. Executive Summary Card */}
      <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-800/90 via-slate-800/60 to-slate-900/90 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Executive Summary</span>
          </span>
          <span className="flex items-center space-x-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
          {title}
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-700/40 whitespace-pre-line">
          {overview || 'No overview generated.'}
        </p>
      </div>

      {/* 2-Column Grid: Key Decisions & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Decisions Section */}
        <div className="rounded-2xl border border-slate-700/80 bg-slate-800/60 p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Key Decisions</h3>
              <p className="text-xs text-slate-400">{key_decisions.length} recorded agreements</p>
            </div>
          </div>

          {key_decisions.length > 0 ? (
            <ul className="space-y-3 flex-1">
              {key_decisions.map((decision, idx) => (
                <li
                  key={idx}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/40 border border-slate-700/40 text-sm text-slate-200"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">
                    ✓
                  </span>
                  <span className="leading-snug">{decision}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic py-4">No explicit decisions identified.</p>
          )}
        </div>

        {/* Action Items Section */}
        <div className="rounded-2xl border border-slate-700/80 bg-slate-800/60 p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Action Items</h3>
              <p className="text-xs text-slate-400">{action_items.length} prioritized tasks</p>
            </div>
          </div>

          {action_items.length > 0 ? (
            <div className="space-y-3 flex-1">
              {action_items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-700/40 flex flex-col justify-between gap-3"
                >
                  <p className="text-sm text-slate-200 font-medium leading-snug">
                    {item.task}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-300">
                        {item.assignee || 'Unassigned'}
                      </span>
                    </div>
                    {getPriorityBadge(item.priority)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic py-4">No action items detected.</p>
          )}
        </div>
      </div>

      {/* 3. Collapsible Full Transcript */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-800/60 overflow-hidden backdrop-blur-md">
        <button
          onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
          className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/80 hover:bg-slate-700/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-brand-400" />
            <div>
              <h4 className="text-base font-bold text-white">Full Whisper Transcript</h4>
              <p className="text-xs text-slate-400">
                {transcript ? `${transcript.split(/\s+/).filter(Boolean).length} words transcribed` : 'No transcript'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            <span className="text-xs font-medium hidden sm:inline">
              {isTranscriptOpen ? 'Hide Transcript' : 'Show Transcript'}
            </span>
            {isTranscriptOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isTranscriptOpen && (
          <div className="p-6 border-t border-slate-700/80 space-y-4">
            {/* Search and Copy bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter keywords in transcript..."
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                onClick={handleCopyTranscript}
                className="flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-600/50"
              >
                {copiedTranscript ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Transcript Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Raw Transcript</span>
                  </>
                )}
              </button>
            </div>

            {/* Transcript Text Box */}
            <div className="max-h-96 overflow-y-auto rounded-xl bg-slate-950/60 p-4 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-brand-500/40">
              {transcriptSearch ? (
                // Highlight matches if search is active
                highlightedTranscript.split(new RegExp(`(${transcriptSearch})`, 'gi')).map((part, i) =>
                  part.toLowerCase() === transcriptSearch.toLowerCase() ? (
                    <mark key={i} className="bg-amber-400 text-slate-950 font-bold px-1 rounded">
                      {part}
                    </mark>
                  ) : (
                    part
                  )
                )
              ) : (
                transcript || 'Transcript is empty.'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
