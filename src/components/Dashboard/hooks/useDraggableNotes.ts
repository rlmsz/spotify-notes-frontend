import { useState, useCallback, useEffect } from 'react';

export const useDraggableNotes = () => {
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, noteId: string, noteElement: HTMLElement) => {
    e.preventDefault();
    setIsDragging(noteId);
    
    // Calculate the offset between mouse position and note's top-left corner
    const rect = noteElement.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width;
    const offsetY = (e.clientY - rect.top) / rect.height;
    
    // Add wind animation class
    noteElement.style.animation = 'windEffect 0.5s ease-in-out infinite alternate';
    
    setDragOffset({ x: offsetX, y: offsetY });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent, updatePosition: (id: string, x: number, y: number) => void) => {
    if (!isDragging) return;
    
    // Calculate note dimensions in viewport percentage
    const noteWidthPercent = (192 / window.innerWidth) * 100;
    const noteHeightPercent = (192 / window.innerHeight) * 100;
    
    // Calculate new position based on mouse position and initial offset
    let x = (e.clientX / window.innerWidth) * 100 - (dragOffset.x * noteWidthPercent);
    let y = (e.clientY / window.innerHeight) * 100 - (dragOffset.y * noteHeightPercent);
    
    // Keep note within viewport bounds
    x = Math.max(0, Math.min(100 - noteWidthPercent, x));
    y = Math.max(0, Math.min(100 - noteHeightPercent, y));
    
    updatePosition(isDragging, x, y);
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      // Remove wind animation
      const activeNote = document.querySelector(`[data-note-id="${isDragging}"]`) as HTMLElement;
      if (activeNote) {
        activeNote.style.animation = 'none';
      }
    }
    setIsDragging(null);
  }, [isDragging]);

  // Add/remove event listeners for mouse move and up
  useEffect(() => {
    const handleMove = (e: MouseEvent) => handleMouseMove(e, () => {});
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    isDragging,
    dragId: isDragging,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
  };
};
