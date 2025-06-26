'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, AlertTriangle, Clock, CheckCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { addNote, updateNote, deleteNote } from '@/app/actions/notesActions';

interface SurveyNote {
  note_id: number;
  response_id: string;
  section: string;
  question_context: string | null;
  note_text: string;
  note_type: string;
  requires_follow_up: boolean;
  priority: string;
  admin_notes: string | null;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

interface NotesSectionProps {
  notes: SurveyNote[];
  responseId: string;
  editable?: boolean;
}

export default function NotesSection({ notes, responseId, editable = true }: NotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [newNote, setNewNote] = useState({
    note_text: '',
    section: 'general',
    note_type: 'margin_note',
    priority: 'medium',
    requires_follow_up: false
  });
  
  const router = useRouter();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddNote = async () => {
    try {
      const result = await addNote({
        response_id: responseId,
        section: newNote.section,
        note_text: newNote.note_text,
        note_type: newNote.note_type,
        requires_follow_up: newNote.requires_follow_up,
        priority: newNote.priority
      });

      if (!result.success) {
        console.error('Error adding note:', result.error);
        alert(`Failed to add note: ${result.error}`);
        return;
      }

      // Reset form and refresh page
      setIsAddingNote(false);
      setNewNote({
        note_text: '',
        section: 'general',
        note_type: 'margin_note',
        priority: 'medium',
        requires_follow_up: false
      });
      router.refresh();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const result = await deleteNote(noteId, responseId);

      if (!result.success) {
        console.error('Error deleting note:', result.error);
        alert(`Failed to delete note: ${result.error}`);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleEditNote = async (note: SurveyNote) => {
    const newText = prompt('Edit note text:', note.note_text);
    if (newText === null || newText.trim() === '') return;

    try {
      const result = await updateNote(note.note_id, newText.trim());

      if (!result.success) {
        console.error('Error updating note:', result.error);
        alert(`Failed to update note: ${result.error}`);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Survey Notes ({notes.length})
          </h3>
        </div>
        {editable && (
          <button
            onClick={() => setIsAddingNote(true)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Note</span>
          </button>
        )}
      </div>

      {/* Add New Note Form */}
      {isAddingNote && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note Text
              </label>
              <textarea
                value={newNote.note_text}
                onChange={(e) => setNewNote({ ...newNote, note_text: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter note content..."
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={newNote.section}
                  onChange={(e) => setNewNote({ ...newNote, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="general">General</option>
                  <option value="q1_q2">Q1-Q2 Preferences</option>
                  <option value="q3">Q3 Opt-out</option>
                  <option value="q4">Q4 Issues</option>
                  <option value="q5_q6">Q5-Q6 Construction</option>
                  <option value="q7">Q7 Interests</option>
                  <option value="q8">Q8 Equipment</option>
                  <option value="q9">Q9 Dues</option>
                  <option value="q10">Q10 Concerns</option>
                  <option value="q11">Q11 Cost Ideas</option>
                  <option value="q12">Q12 Involvement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newNote.note_type}
                  onChange={(e) => setNewNote({ ...newNote, note_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="margin_note">Margin Note</option>
                  <option value="clarification">Clarification</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="concern">Concern</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newNote.priority}
                  onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newNote.requires_follow_up}
                    onChange={(e) => setNewNote({ ...newNote, requires_follow_up: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Requires Follow-up</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNote.note_text.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>No notes for this response</p>
            {editable && (
              <p className="text-sm mt-1">Add a note to track important information or follow-up items</p>
            )}
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.note_id}
              className={`p-4 rounded-lg border ${getPriorityColor(note.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getPriorityIcon(note.priority)}
                    <span className="text-sm font-medium capitalize">
                      {note.section.replace('_', ' ')} • {note.note_type.replace('_', ' ')}
                    </span>
                    {note.requires_follow_up && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Follow-up Required
                      </span>
                    )}
                    {note.resolved && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  
                  <p className="text-gray-900 mb-2">{note.note_text}</p>
                  
                  {note.admin_notes && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                      <strong>Admin Notes:</strong> {note.admin_notes}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      Created {formatDate(note.created_at)}
                      {note.updated_at !== note.created_at && (
                        <span> • Updated {formatDate(note.updated_at)}</span>
                      )}
                    </span>
                  </div>
                </div>
                
                {editable && (
                  <div className="flex items-center space-x-1 ml-4">
                    <button 
                      onClick={() => handleEditNote(note)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit note"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note.note_id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}