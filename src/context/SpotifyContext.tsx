// src/context/SpotifyContext.tsx

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CurrentlyPlaying, User } from "../types";
import { getAuthUrl, hasValidToken } from "../utils/spotifyAuth";
import { getCurrentlyPlaying, getUserProfile } from "../services/api";

interface SpotifyContextType {
  user: User | null;
  isAuthenticated: boolean;
  currentlyPlaying: CurrentlyPlaying | null;
  login: () => void;
  logout: () => void;
  refreshCurrentlyPlaying: () => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwt_token');
    const userData = localStorage.getItem('current_user');
    
    if (jwtToken && userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else if (hasValidToken()) {
      // Fallback to old token check for backward compatibility
      setIsAuthenticated(true);
      fetchUserProfile();
    }
  }, []);

  // Periodically refresh currently playing
  useEffect(() => {
    if (isAuthenticated) {
      refreshCurrentlyPlaying();
      const interval = setInterval(refreshCurrentlyPlaying, 10000); // Check every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    }
  };

  const refreshCurrentlyPlaying = async () => {
    const data = await getCurrentlyPlaying();
    if (data) {
      setCurrentlyPlaying(data);
    }
  };

  const login = () => {
    // Redirect to Spotify authorization using our utility
    window.location.href = getAuthUrl();
  };

  const logout = () => {
    // Clear all auth related data
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('spotify_authenticated');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    setCurrentlyPlaying(null);
    
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <SpotifyContext.Provider
      value={{
        user,
        isAuthenticated,
        currentlyPlaying,
        login,
        logout,
        refreshCurrentlyPlaying
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};