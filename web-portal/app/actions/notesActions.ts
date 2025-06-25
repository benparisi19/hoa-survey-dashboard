'use server';

import { createServiceClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

interface AddNoteData {
  response_id: string;
  section: string;
  question_context?: string | null;
  note_text: string;
  note_type: string;
  requires_follow_up: boolean;
  priority: string;
  resolved?: boolean;
}

export async function addNote(data: AddNoteData) {
  try {
    const supabaseService = createServiceClient();

    const { data: newNote, error } = await supabaseService
      .from('survey_notes')
      .insert({
        response_id: data.response_id,
        section: data.section,
        question_context: data.question_context || null,
        note_text: data.note_text,
        note_type: data.note_type,
        requires_follow_up: data.requires_follow_up,
        priority: data.priority,
        resolved: data.resolved || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding note:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    // Revalidate the response page to show the new note
    revalidatePath(`/responses/${data.response_id}`);

    return { 
      success: true, 
      data: newNote 
    };
  } catch (error) {
    console.error('Error adding note:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function updateNote(noteId: number, noteText: string) {
  try {
    const supabaseService = createServiceClient();

    const { error } = await supabaseService
      .from('survey_notes')
      .update({
        note_text: noteText,
        updated_at: new Date().toISOString()
      })
      .eq('note_id', noteId);

    if (error) {
      console.error('Error updating note:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    // Revalidate any page that might show this note
    revalidatePath('/responses');

    return { 
      success: true 
    };
  } catch (error) {
    console.error('Error updating note:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function deleteNote(noteId: number, responseId: string) {
  try {
    const supabaseService = createServiceClient();

    const { error } = await supabaseService
      .from('survey_notes')
      .delete()
      .eq('note_id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    // Revalidate the response page to remove the deleted note
    revalidatePath(`/responses/${responseId}`);

    return { 
      success: true 
    };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}