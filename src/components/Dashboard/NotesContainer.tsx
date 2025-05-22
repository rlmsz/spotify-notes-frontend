import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { Note } from './Note';
import { useDraggableNotes } from './hooks/useDraggableNotes';
import { useNotes } from '../../hooks/useNotes';
import { noteColors } from '../../constants/noteColors';
import type { CurrentlyPlaying, NoteType } from '../../types';

type Position = {
  x: number;
  y: number;
  rotation: number;
  color: string;
};

type NoteWithPosition = NoteType & { position: Position };

interface NotesContainerProps {
  currentTrack: CurrentlyPlaying;
}

// Memoize the loading component to prevent recreation
const LoadingState = memo(() => (
  <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black z-0 flex items-center justify-center">
    <div className="text-center text-white">Loading notes...</div>
  </div>
));

// Memoize the empty state component
const EmptyState = memo(() => (
  <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black z-0">
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">No notes yet. Be the first to add one!</p>
    </div>
  </div>
));

// Memoize the note list to prevent unnecessary re-renders
const NoteList = memo(({ notes, isNoteDragging, dragId, onMouseDown, onMouseUp }: {
  notes: NoteWithPosition[];
  isNoteDragging: boolean;
  dragId: string | null;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, id: string, element: HTMLElement) => void;
  onMouseUp: () => void;
}) => (
  <>
    {notes.map((note, index) => (
      <Note
        key={note.id}
        note={note}
        isDragging={isNoteDragging}
        dragId={dragId}
        index={index}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      />
    ))}
  </>
));

export const NotesContainer = memo(({ currentTrack }: NotesContainerProps) => {
  const [notesWithPosition, setNotesWithPosition] = useState<NoteWithPosition[]>([]);
  const trackId = currentTrack?.item?.id;
  
  // Memoize notes fetching to prevent unnecessary refetches
  const { notes = [], isLoading } = useNotes(trackId);
  
  const { 
    isDragging, 
    dragId, 
    handleMouseDown, 
    handleMouseUp, 
    handleMouseMove 
  } = useDraggableNotes();
  
  const isNoteDragging = Boolean(isDragging);

  // Memoize the handleUpdatePosition function with useCallback
  const handleUpdatePosition = useCallback((id: string, x: number, y: number) => {
    setNotesWithPosition(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, position: { ...note.position, x, y } } : note
      )
    );
  }, []);

  // Generate random positions for notes only when notes or trackId changes
  useEffect(() => {
    if (notes.length === 0) {
      setNotesWithPosition([]);
      return;
    }

    // Only update positions if we have new notes or track changed
    const newNotes = notes.filter(note => 
      !notesWithPosition.some(existing => existing.id === note.id)
    );

    if (newNotes.length === 0 && notes.length === notesWithPosition.length) {
      return;
    }

    const positionedNotes = notes.map(note => {
      const existing = notesWithPosition.find(n => n.id === note.id);
      
      // Reuse existing position if it exists
      if (existing) {
        return existing;
      }
      
      // Create new position for new notes
      return {
        ...note,
        position: {
          x: 10 + Math.random() * 80, // 10-90% of container width
          y: 10 + Math.random() * 80, // 10-90% of container height
          rotation: -15 + Math.random() * 30, // -15° to 15° rotation
          color: noteColors[Math.floor(Math.random() * noteColors.length)]
        }
      };
    });

    setNotesWithPosition(positionedNotes);
  }, [notes, trackId]); // Only run when notes or trackId changes

  // Memoize the mouse move handler
  const handleMove = useCallback((e: MouseEvent) => {
    handleMouseMove(e, handleUpdatePosition);
  }, [handleMouseMove, handleUpdatePosition]);

  // Setup and cleanup mouse move event listener for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMove);
    };
  }, [isDragging, handleMove]);

  // Memoize wind keyframes to prevent recreation on every render
  const windKeyframes = useMemo(() => `
    @keyframes windEffect {
      0% {
        transform: rotate(${isNoteDragging ? '0deg' : '0'});
        filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.2));
      }
      100% {
        transform: rotate(${isNoteDragging ? '2deg' : '0'});
        filter: drop-shadow(5px 10px 8px rgba(0, 0, 0, 0.3));
      }
    }
  `, [isNoteDragging]);

  // Memoize the container style to prevent recreation
  const containerStyle = useMemo(() => ({
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    background: 'linear-gradient(to bottom, #1a202c, #000000)'
  }), []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (notesWithPosition.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={containerStyle}>
      <style>{windKeyframes}</style>
      <NoteList 
        notes={notesWithPosition}
        isNoteDragging={isNoteDragging}
        dragId={dragId}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
});

// Add display name for better dev tools experience
NotesContainer.displayName = 'NotesContainer';


