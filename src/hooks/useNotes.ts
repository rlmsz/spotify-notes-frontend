import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Note } from '../types';
import { backendApi } from '../services/api';

export const useNotes = (trackId?: string) => {
  const queryClient = useQueryClient();

  // Fetch notes for the current track
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes', trackId],
    queryFn: async () => {
      if (!trackId) return [];
      const { data } = await backendApi.get(`/api/notes/song/${trackId}`);
      return data;
    },
    enabled: !!trackId,
  });

  // Create a new note
  const createNote = useMutation({
    mutationFn: async (noteData: { 
      content: string; 
      trackId: string;
      spotifyId: string;
      songName: string;
      artist: string;
      album: string;
      position?: { x: number; y: number; rotation: number; color: string } 
    }) => {
      const { position, ...noteDataWithoutPosition } = noteData;
      const { data } = await backendApi.post('/api/notes', {
        content: noteDataWithoutPosition.content,
        trackId: noteDataWithoutPosition.trackId,
        spotifyId: noteDataWithoutPosition.spotifyId,
        songName: noteDataWithoutPosition.songName,
        artist: noteDataWithoutPosition.artist,
        album: noteDataWithoutPosition.album
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // Delete a note
  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      await backendApi.delete(`/api/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    notes,
    isLoading,
    createNote: createNote.mutateAsync,
    deleteNote: deleteNote.mutateAsync,
    isCreating: createNote.isPending,
    isDeleting: deleteNote.isPending,
  };
};
