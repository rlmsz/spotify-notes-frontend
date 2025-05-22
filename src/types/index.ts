// src/types/index.ts

export interface User {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

// src/types/index.ts
export interface NotePosition {
  x: number ;
  y: number ;
  rotation: number;
  color: string;
}

// Note data
export interface NoteType {
  id: string;
  trackId: string;
  content: string;
  formattedDate:string;
  location:{
    city:string
    country:string
  }
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  position?: NotePosition;
}

// Album information
export interface Album {
  id: string;
  name: string;
  images: {
    url: string;
    height?: number;
    width?: number;
  }[];
}

// Artist information
export interface Artist {
  id: string;
  name: string;
}

// Track information
export interface Track {
  id: string;
  name: string;
  duration_ms: number;
  artists: Artist[];
  album: Album;
}

// Currently playing track information
export interface CurrentlyPlaying {
  is_playing: boolean;
  progress_ms: number;
  item: Track;
}