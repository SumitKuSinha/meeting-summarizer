import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  History,
  Trash2,
  Calendar,
  FileAudio,
  Search,
  RefreshCw,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getAllMeetings, getMeetingById, deleteMeeting } from '../services/api';

export default function HistoryDrawer({
  isOpen,
  onClose,
  onSelectMeeting,
  currentMeetingId,
  onMeetingDeleted
}) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [loadingMeetingId, setLoadingMeetingId] = useState(null);

  const fetchMeetings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllMeetings();
      if (response && response.success) {
        setMeetings(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch history');
      }
    } catch (err) {
      console.error('Error fetching meetings history:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load meeting history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMeetings();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return meetings;
    const q = searchQuery.toLowerCase();
    return meetings.filter(
      (m) =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.fileName && m.fileName.toLowerCase().includes(q)) ||
        (m.overview && m.overview.toLowerCase().includes(q))
    );
  }, [meetings, searchQuery]);

  const handleSelect = async (meetingSummary) => {
    setLoadingMeetingId(meetingSummary._id);
    try {
      const response = await getMeetingById(meetingSummary._id);
      if (response && response.success && response.data) {
        onSelectMeeting(response.data);
        onClose();
      } else {
        throw new Error(response.error || 'Failed to load meeting');
      }
    } catch (err) {
      console.error('Failed to load meeting details:', err);
      alert(err.response?.data?.error || err.message || 'Could not load meeting details.');
    } finally {
      setLoadingMeetingId(null);
    }
  };

  const handleDelete = async (e, meetingId) => {
    e.stopPropagation();

    const confirmDelete = window.confirm('Delete this meeting summary?');
    if (!confirmDelete) return;

    setDeletingId(meetingId);
    try {
      const res = await deleteMeeting(meetingId);
      if (res && res.success) {
        setMeetings((prev) => prev.filter((m) => m._id !== meetingId));
        if (onMeetingDeleted) {
          onMeetingDeleted(meetingId);
        }
      } else {
        throw new Error(res.error || 'Failed to delete meeting');
      }
    } catch (err) {
      console.error('Error deleting meeting:', err);
      alert(err.response?.data?.error || err.message || 'Could not delete meeting.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col relative z-10 animate-slideLeft">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <History className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-zinc-100">Meeting History</h3>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {meetings.length}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={fetchMeetings}
                disabled={loading}
                title="Refresh history"
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} strokeWidth={1.5} />
              </button>
              <button
                onClick={onClose}
                title="Close drawer"
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-zinc-800/80 bg-zinc-950">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-2 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" strokeWidth={1.5} />
                <p className="text-xs font-mono">Loading history...</p>
              </div>
            ) : error ? (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />
                  <span>Error Loading History</span>
                </div>
                <p className="text-[11px] text-rose-400/90">{error}</p>
                <button
                  onClick={fetchMeetings}
                  className="text-xs text-indigo-400 hover:underline font-medium pt-0.5"
                >
                  Retry
                </button>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4 space-y-2 text-zinc-500">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <FileAudio className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h4 className="text-xs font-semibold text-zinc-300">
                  {searchQuery ? 'No matching meetings' : 'No saved records'}
                </h4>
                <p className="text-[11px] text-zinc-500 max-w-xs">
                  {searchQuery
                    ? 'Try another search query.'
                    : 'Transcribed meetings will automatically appear here.'}
                </p>
              </div>
            ) : (
              filteredMeetings.map((meeting) => {
                const isSelected = currentMeetingId === meeting._id;
                const isItemLoading = loadingMeetingId === meeting._id;
                const isDeleting = deletingId === meeting._id;

                return (
                  <div
                    key={meeting._id}
                    onClick={() => handleSelect(meeting)}
                    className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-700 shadow-sm'
                        : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4
                          className={`text-xs font-semibold truncate transition-colors ${
                            isSelected ? 'text-indigo-400' : 'text-zinc-200 group-hover:text-zinc-100'
                          }`}
                        >
                          {meeting.title || 'Untitled Meeting'}
                        </h4>

                        <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-500">
                          <span className="truncate max-w-[130px]">{meeting.fileName}</span>
                          <span>•</span>
                          <span>{formatDate(meeting.createdAt)}</span>
                        </div>

                        {meeting.overview && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed pt-0.5">
                            {meeting.overview}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0 ml-1">
                        {isItemLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" strokeWidth={1.5} />
                        ) : (
                          <button
                            onClick={(e) => handleDelete(e, meeting._id)}
                            disabled={isDeleting}
                            title="Delete meeting"
                            className="p-1 rounded text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" strokeWidth={1.5} />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-950 text-center">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Atlas MongoDB Persistence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
