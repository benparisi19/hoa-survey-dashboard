'use client';

import { useState } from 'react';
import { CheckCircle, Flag } from 'lucide-react';
import { updateReviewStatus } from '@/app/actions/updateReviewStatus';

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
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateReviewStatus = async (newStatus: string) => {
    setIsSaving(true);
    try {
      const result = await updateReviewStatus(responseId, newStatus);

      if (result.success) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
        console.log(`Response ${responseId} marked as ${newStatus}`);
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        console.error('Error updating review status:', result.error);
        alert(`Error updating review status: ${result.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating review status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Only show buttons if not already in that status */}
      {status !== 'reviewed' && (
        <button
          onClick={() => handleUpdateReviewStatus('reviewed')}
          disabled={isSaving}
          className="flex items-center space-x-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors"
        >
          <CheckCircle className="h-3 w-3" />
          <span>Mark Reviewed</span>
        </button>
      )}

      {status !== 'flagged' && (
        <button
          onClick={() => handleUpdateReviewStatus('flagged')}
          disabled={isSaving}
          className="flex items-center space-x-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors"
        >
          <Flag className="h-3 w-3" />
          <span>Flag</span>
        </button>
      )}

      {/* Show current status */}
      {(status === 'reviewed' || status === 'flagged') && (
        <div className={`flex items-center space-x-1 text-sm px-3 py-1 rounded ${
          status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status === 'reviewed' ? <CheckCircle className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
          <span>{status === 'reviewed' ? 'Reviewed' : 'Flagged'}</span>
        </div>
      )}

      {/* Status Indicator */}
      {isSaving && (
        <span className="text-sm text-gray-500">Saving...</span>
      )}
    </div>
  );
}