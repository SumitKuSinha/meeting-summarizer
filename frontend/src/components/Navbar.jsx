import React from 'react';
import { Github, History, Radio } from 'lucide-react';

export default function Navbar({ onOpenHistory }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-inner">
            <Radio className="w-4 h-4 text-indigo-400" strokeWidth={1.75} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">
              InsightSync
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-all duration-150"
            title="Open Meeting History"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span>History</span>
          </button>

          {/* GitHub Repository */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-all duration-150"
            title="Source Code"
          >
            <Github className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
