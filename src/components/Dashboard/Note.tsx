import { memo, useMemo, useCallback } from 'react';
import type { MouseEvent } from 'react';
import type { NoteType } from '../../types';

interface NoteProps {
  note: NoteType & { position: { x: number; y: number; rotation: number; color: string } };
  isDragging: boolean;
  onMouseDown: (e: MouseEvent<HTMLDivElement>, id: string, element: HTMLElement) => void;
  onMouseUp: () => void;
  dragId: string | null;
  index: number;
}

// Custom comparison function for React.memo
const areEqual = (prevProps: NoteProps, nextProps: NoteProps) => {
  const { note: prevNote, dragId: prevDragId, index: prevIndex, isDragging: prevIsDragging } = prevProps;
  const { note: nextNote, dragId: nextDragId, index: nextIndex, isDragging: nextIsDragging } = nextProps;
  
  // Only re-render if these specific props change
  return (
    prevNote.id === nextNote.id &&
    prevNote.position.x === nextNote.position.x &&
    prevNote.position.y === nextNote.position.y &&
    prevNote.position.rotation === nextNote.position.rotation &&
    prevNote.position.color === nextNote.position.color &&
    prevNote.createdBy?.name === nextNote.createdBy?.name &&
    prevNote.content === nextNote.content &&
    prevNote.location?.city === nextNote.location?.city &&
    prevNote.location?.country === nextNote.location?.country &&
    prevNote.formattedDate === nextNote.formattedDate &&
    prevNote.createdAt === nextNote.createdAt &&
    prevDragId === nextDragId &&
    prevIndex === nextIndex &&
    prevIsDragging === nextIsDragging
  );
};

const NoteComponent = ({
  note,
  onMouseDown,
  onMouseUp,
  dragId,
  index
}: NoteProps) => {
  const isDraggingThisNote = dragId === note.id;
  
  // Memoize the mouse down handler
  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    onMouseDown(e, note.id, e.currentTarget);
  }, [note.id, onMouseDown]);

  // Memoize styles to prevent recreation on every render
  const noteStyles = useMemo(() => ({
    left: `${note.position.x}%`,
    top: `${note.position.y}%`,
    transform: `rotate(${note.position.rotation}deg)`,
    zIndex: 10 + index,
    cursor: isDraggingThisNote ? 'grabbing' : 'grab',
    transition: isDraggingThisNote ? 'none' : 'left 0.1s ease-out, top 0.1s ease-out',
    backgroundColor: note.position.color || '#fef08a',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
    touchAction: 'none' as const,
    willChange: 'transform, filter' as const,
    transformOrigin: 'center center' as const,
    backfaceVisibility: 'hidden' as const
  }), [note.position, index, isDraggingThisNote]);

  // Memoize the note content to prevent recalculation
  const noteContent = useMemo(() => ({
    author: note.createdBy?.name || 'Anonymous',
    location: note.location ? `${note.location.city}, ${note.location.country}` : null,
    date: note.formattedDate || new Date(note.createdAt).toLocaleDateString()
  }), [note.createdBy?.name, note.location, note.formattedDate, note.createdAt]);

  return (
    <div
      data-note-id={note.id}
      className={`absolute shadow-lg p-4 w-48 h-48 ${note.position.color} text-gray-800 rounded`}
      style={noteStyles}
      onMouseDown={handleMouseDown}
      onMouseUp={onMouseUp}
    >
      <div className="overflow-auto h-full">
        <p className="font-medium mb-2 text-sm">
          {noteContent.author}
        </p>
        <p className="text-sm mb-2 break-words">{note.content}</p>
        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-gray-500">
          {noteContent.location && (
            <span>{noteContent.location}</span>
          )}
          <span>{noteContent.date}</span>
        </div>
      </div>
    </div>
  );
};

export const Note = memo(NoteComponent, areEqual);
