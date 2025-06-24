'use client';

import { useState } from 'react';
import { CheckCircle, Flag, Clock, AlertCircle, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ReviewControlsProps {
  responseId: string;
  currentStatus: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  onStatusChange?: (newStatus: string) => void;
}

export default function ReviewControls({
  responseId,
  currentStatus,
  reviewedBy,
  reviewedAt,
  reviewNotes,
  onStatusChange
}: ReviewControlsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(reviewNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const updateReviewStatus = async (newStatus: string, noteText?: string) => {
    setIsSaving(true);
    try {
      const updateData: any = {
        review_status: newStatus,
        reviewed_by: 'Admin', // TODO: Replace with actual user when auth is implemented
        reviewed_at: new Date().toISOString(),
      };

      if (noteText !== undefined) {
        updateData.review_notes = noteText;
      }

      const { error } = await supabase
        .from('responses')
        .update(updateData)
        .eq('response_id', responseId);

      if (error) {
        console.error('Error updating review status:', error);
        alert('Error updating review status');
      } else {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
        console.log(`Response ${responseId} marked as ${newStatus}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating review status');
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotes = async () => {
    await updateReviewStatus(status, notes);
    setShowNotes(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'bg-green-600 hover:bg-green-700';
      case 'in_progress': return 'bg-blue-600 hover:bg-blue-700';
      case 'flagged': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'flagged': return <Flag className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Status Dropdown */}
      <select 
        value={status}
        onChange={(e) => {
          const newStatus = e.target.value;
          setStatus(newStatus);
          updateReviewStatus(newStatus);
        }}
        disabled={isSaving}
        className="text-sm border border-gray-300 rounded px-2 py-1 min-w-[120px]"
      >
        <option value="unreviewed">Unreviewed</option>
        <option value="in_progress">In Progress</option>
        <option value="reviewed">Reviewed</option>
        <option value="flagged">Flagged</option>
      </select>

      {/* Quick Action Buttons */}
      <button
        onClick={() => updateReviewStatus('reviewed')}
        disabled={isSaving || status === 'reviewed'}
        className="flex items-center space-x-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors"
      >
        <CheckCircle className="h-3 w-3" />
        <span>Mark Reviewed</span>
      </button>

      <button
        onClick={() => updateReviewStatus('flagged')}
        disabled={isSaving || status === 'flagged'}
        className="flex items-center space-x-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors"
      >
        <Flag className="h-3 w-3" />
        <span>Flag</span>
      </button>

      {/* Notes Button */}
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="text-sm border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded transition-colors"
      >
        Notes
      </button>

      {/* Notes Modal/Dropdown */}
      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-medium mb-4">Review Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this response review..."
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowNotes(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded"
              >
                <Save className="h-4 w-4" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isSaving && (
        <span className="text-sm text-gray-500">Saving...</span>
      )}
    </div>
  );
}