import React, { useState } from 'react';
import { z } from 'zod';
import { useNotes } from '../../hooks/useNotes';
import type { CurrentlyPlaying } from '../../types';

// Define validation schema for note input
const noteSchema = z.object({
  content: z.string()
    .min(1, 'Note cannot be empty')
    .max(500, 'Note cannot exceed 500 characters')
    .refine(val => val.trim().length > 0, {
      message: 'Note cannot be just whitespace'
    })
});

interface FooterProps {
  currentTrack: CurrentlyPlaying | null;
}

const Footer: React.FC<FooterProps> = ({
  currentTrack,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { createNote, isCreating: isCreatingNote } = useNotes(currentTrack?.item?.id);

  const handleNoteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteInput(e.target.value);
    // Clear validation error when user types
    if (validationError) setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input using Zod schema
    const validation = noteSchema.safeParse({ content: noteInput });
    
    if (!validation.success) {
      // Set the first validation error message
      setValidationError(validation.error.errors[0].message);
      return;
    }
    
    if (currentTrack?.item?.id) {
      createNote({
        content: validation.data.content.trim(),
        trackId: currentTrack.item.id,
        spotifyId: currentTrack.item.id,
        songName: currentTrack.item.name,
        artist: currentTrack.item.artists.map(a => a.name).join(', '),
        album: currentTrack.item.album.name,
      }).then(() => {
        setNoteInput('');
        setValidationError(null);
      }).catch((error) => {
        console.error('Error creating note:', error);
        setValidationError('Failed to save note. Please try again.');
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 z-50">
      <div className="max-w-3xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <div className="flex space-x-2">
              <input
                type="text"
                className={`flex-grow bg-gray-700 text-white rounded-md px-3 py-2 ${
                  validationError ? 'outline outline-2 outline-red-500 outline-offset-[-1px]' : ''
                }`}
                placeholder={currentTrack ? "Add your note about this track..." : "No track playing"}
                value={noteInput}
                onChange={handleNoteInputChange}
                disabled={!currentTrack || isCreatingNote}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? 'note-error' : undefined}
              />
              <button
                type="submit"
                className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${
                  !noteInput.trim() || !currentTrack || isCreatingNote || validationError
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                disabled={!noteInput.trim() || !currentTrack || isCreatingNote || !!validationError}
              >
                {isCreatingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
            <div className={`h-5 mt-1 transition-opacity duration-200 ${
              validationError ? 'opacity-100' : 'opacity-0 h-0 mt-0'
            }`}>
              {validationError && (
                <p id="note-error" className="text-red-500 text-sm" role="alert">
                  {validationError}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Footer;
