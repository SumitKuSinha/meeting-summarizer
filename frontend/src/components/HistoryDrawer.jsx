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
  Sparkles,
  ChevronRight,
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

  // Fetch all meetings when the drawer is opened
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

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter meetings by search term
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

  // Handle selecting a meeting to view in insights
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

  // Handle deleting a meeting
  const handleDelete = async (e, meetingId) => {
    e.stopPropagation(); // Prevent opening meeting

    const confirmDelete = window.confirm('Are you sure you want to delete this meeting summary?');
    if (!confirmDelete) return;

    setDeletingId(meetingId);
    try {
      const res = await deleteMeeting(meetingId);
      if (res && res.success) {
        // Optimistically remove from state
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col relative z-10 animate-slideLeft">
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">Meeting History</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                    {meetings.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Saved meeting summaries & insights</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={fetchMeetings}
                disabled={loading}
                title="Refresh history"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                title="Close panel"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by title, file, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Meeting List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y-0">
            {loading && meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                <p className="text-sm font-medium">Loading meeting history...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-xs font-semibold">Error Loading History</span>
                </div>
                <p className="text-xs text-red-400/90">{error}</p>
                <button
                  onClick={fetchMeetings}
                  className="text-xs text-brand-400 hover:underline font-medium pt-1"
                >
                  Try again
                </button>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
                  {searchQuery ? <Search className="w-6 h-6" /> : <FileAudio className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-300">
                    {searchQuery ? 'No matching meetings found' : 'No meetings saved yet'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    {searchQuery
                      ? 'Try a different search term or keyword.'
                      : 'Upload an audio recording to generate your first AI meeting summary!'}
                  </p>
                </div>
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
                    className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500/50 shadow-md shadow-brand-500/10'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Title */}
                        <div className="flex items-center space-x-2">
                          <h4
                            className={`text-sm font-semibold truncate transition-colors ${
                              isSelected ? 'text-brand-300' : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {meeting.title || 'Untitled Meeting'}
                          </h4>
                        </div>

                        {/* File Name & Date */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400">
                          <span className="flex items-center space-x-1 truncate max-w-[160px]">
                            <FileAudio className="w-3 h-3 text-brand-400 flex-shrink-0" />
                            <span className="truncate">{meeting.fileName}</span>
                          </span>

                          <span className="flex items-center space-x-1 text-slate-500">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{formatDate(meeting.createdAt)}</span>
                          </span>
                        </div>

                        {/* Overview Snippet */}
                        {meeting.overview && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                            {meeting.overview}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-1">
                        {isItemLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                        ) : (
                          <button
                            onClick={(e) => handleDelete(e, meeting._id)}
                            disabled={isDeleting}
                            title="Delete meeting"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
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
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 text-center">
            <p className="text-[11px] text-slate-500">
              InsightSync • MongoDB Atlas Powered
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
