'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateResponseModal from './CreateResponseModal';

export default function ResponsesPageClient() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  const handleCreateSuccess = (responseIds: string[]) => {
    // Close the modal
    setShowCreateModal(false);
    
    // If only one response was created, navigate to it
    if (responseIds.length === 1) {
      router.push(`/responses/${responseIds[0]}`);
    } else {
      // For bulk creation, refresh the page to show new responses
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Response
        </button>
      </div>

      <CreateResponseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}