import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
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
  CheckSquare,
  FileAudio
} from 'lucide-react';

export default function MeetingInsights({ data, onReset }) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState('');

  const {
    fileName = 'recording.mp3',
    title = 'Meeting Summary',
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

  const highlightedTranscript = useMemo(() => {
    if (!transcriptSearch.trim()) return transcript;
    return transcript;
  }, [transcript, transcriptSearch]);

  // Clean Markdown export with strict zero emojis
  const generateMarkdownSummary = () => {
    let md = `# ${title}\n\n`;
    md += `- Date: ${formattedDate}\n`;
    md += `- Source: ${fileName}\n\n`;
    md += `## Executive Overview\n${overview}\n\n`;

    if (key_decisions.length > 0) {
      md += `## Key Decisions\n`;
      key_decisions.forEach((decision) => {
        md += `- ${decision}\n`;
      });
      md += `\n`;
    }

    if (action_items.length > 0) {
      md += `## Action Items\n`;
      action_items.forEach((item) => {
        md += `- [ ] **${item.task}** | Assignee: ${item.assignee || 'Unassigned'} | Priority: ${item.priority || 'Medium'}\n`;
      });
      md += `\n`;
    }

    if (transcript) {
      md += `## Full Transcript\n${transcript}\n`;
    }

    return md;
  };

  const handleCopySummary = async () => {
    try {
      const markdown = generateMarkdownSummary();
      await navigator.clipboard.writeText(markdown);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    } catch (err) {
      console.error('Failed to copy transcript:', err);
    }
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          High
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
        Low
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-16 animate-fadeIn">
      {/* Top Metadata & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3.5 sm:px-5 sm:py-3.5 rounded-xl border border-zinc-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>PROCESSED</span>
          </span>

          <span className="flex items-center space-x-1 text-zinc-400 font-mono text-xs">
            <FileAudio className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
            <span className="truncate max-w-[180px] sm:max-w-xs">{fileName}</span>
          </span>

          <span className="text-zinc-700 hidden sm:inline">•</span>

          <span className="flex items-center space-x-1 text-zinc-500 text-xs">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{formattedDate}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopySummary}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 text-zinc-300 hover:text-zinc-100 border border-zinc-800 text-xs font-medium transition-all"
            title="Copy as Markdown"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all active:scale-[0.99] shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>New Recording</span>
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-7 backdrop-blur-md">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            Executive Summary
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mb-4">
          {title}
        </h2>

        <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-4 rounded-lg border border-zinc-800/80 whitespace-pre-line">
          {overview || 'No overview available.'}
        </p>
      </div>

      {/* 2-Column Grid: Key Decisions & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Key Decisions */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Key Decisions</h3>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {key_decisions.length} recorded
            </span>
          </div>

          {key_decisions.length > 0 ? (
            <ul className="space-y-2.5 flex-1">
              {key_decisions.map((decision, idx) => (
                <li
                  key={idx}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/70 border-l-2 border-l-emerald-500 text-xs text-zinc-200 leading-relaxed"
                >
                  <span className="text-zinc-300 font-medium">{decision}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500 italic py-3">No explicit decisions recorded.</p>
          )}
        </div>

        {/* Action Items */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ListTodo className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Action Items</h3>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {action_items.length} tasks
            </span>
          </div>

          {action_items.length > 0 ? (
            <div className="space-y-2.5 flex-1">
              {action_items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/70 flex flex-col justify-between gap-2.5"
                >
                  <p className="text-xs text-zinc-200 font-medium leading-snug">
                    {item.task}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                    <div className="flex items-center space-x-1.5 text-zinc-400">
                      <User className="w-3 h-3 text-zinc-500" strokeWidth={1.5} />
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {item.assignee || 'Unassigned'}
                      </span>
                    </div>
                    {getPriorityBadge(item.priority)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic py-3">No action items detected.</p>
          )}
        </div>
      </div>

      {/* Transcript Accordion */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden backdrop-blur-md">
        <button
          onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
          className="w-full px-5 py-3.5 flex items-center justify-between bg-zinc-900/70 hover:bg-zinc-800/40 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <FileText className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-zinc-200">
              Full Transcript
            </span>
            <span className="text-xs font-mono text-zinc-500">
              ({transcript ? `${transcript.split(/\s+/).filter(Boolean).length} words` : '0 words'})
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-zinc-400 text-xs">
            <span>{isTranscriptOpen ? 'Hide' : 'Expand'}</span>
            {isTranscriptOpen ? (
              <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
          </div>
        </button>

        {isTranscriptOpen && (
          <div className="p-5 border-t border-zinc-800 space-y-3.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Filter transcript keywords..."
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono transition-colors"
                />
              </div>

              <button
                onClick={handleCopyTranscript}
                className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-colors border border-zinc-800"
              >
                {copiedTranscript ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" strokeWidth={2} />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                    <span>Copy Raw Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto rounded-lg bg-zinc-950 p-4 border border-zinc-800/80 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
              {transcriptSearch ? (
                highlightedTranscript.split(new RegExp(`(${transcriptSearch})`, 'gi')).map((part, i) =>
                  part.toLowerCase() === transcriptSearch.toLowerCase() ? (
                    <mark key={i} className="bg-indigo-500/30 text-indigo-200 px-0.5 rounded">
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
