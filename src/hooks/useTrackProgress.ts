import { useState, useEffect, useRef } from 'react';
import type { CurrentlyPlaying } from '../types';

export const useTrackProgress = (currentTrack: CurrentlyPlaying | null, onTrackEnd?: () => void) => {
  const [progress, setProgress] = useState({
    position: 0,
    time: '0:00',
    isPlaying: false
  });
  
  const trackEndHandledRef = useRef(false);
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    if (!currentTrack) return;

    // Reset end track handling when track changes
    trackEndHandledRef.current = false;
    
    // Set initial progress
    const initialProgress = currentTrack.progress_ms / currentTrack.item.duration_ms;
    setProgress({
      position: initialProgress,
      time: formatTime(currentTrack.progress_ms),
      isPlaying: currentTrack.is_playing
    });

    // If not playing, don't animate progress
    if (!currentTrack.is_playing) return;

    const startTime = Date.now();
    const startProgress = currentTrack.progress_ms;
    const duration = currentTrack.item.duration_ms;
    const updateInterval = 100; // Update every 100ms for smooth animation

    // Animate progress until the end of the song
    const intervalId = setInterval(() => {
      setProgress(prev => {
        const elapsed = Date.now() - startTime;
        const currentProgress = startProgress + elapsed;
        const progressPosition = Math.min(currentProgress / duration, 1);
        
        // If we've reached or passed the end, clear the interval
        if (progressPosition >= 0.999 && !trackEndHandledRef.current) {
          trackEndHandledRef.current = true;
          clearInterval(intervalId);
          // Call the onTrackEnd callback if provided
          if (onTrackEnd) {
            onTrackEnd();
          }
          return { 
            ...prev, 
            position: 1, 
            time: formatTime(duration),
            isPlaying: false
          };
        }
        
        // Update progress based on actual elapsed time
        return {
          position: progressPosition,
          time: formatTime(currentProgress),
          isPlaying: true
        };
      });
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [currentTrack]);

  return progress;
};
