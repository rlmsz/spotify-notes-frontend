// src/services/api.ts
import axios from 'axios';
import type { CurrentlyPlaying } from '../types';

// Base URL for Spotify API
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create an axios instance for Spotify API
const spotifyApi = axios.create({
  baseURL: SPOTIFY_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create an axios instance for our backend API
export const backendApi = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include JWT token in requests
backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(`${BACKEND_BASE_URL}/api/spotify/refresh`, {
      refresh_token: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const { access_token, expires_in, token: newJwtToken, user } = response.data;
    
    if (!access_token) {
      throw new Error('No access token in refresh response');
    }
    
    // Update tokens in localStorage
    localStorage.setItem('spotify_access_token', access_token);
    localStorage.setItem('spotify_token_expiry', (Date.now() + expires_in * 1000).toString());
    
    if (newJwtToken) {
      localStorage.setItem('jwt_token', newJwtToken);
    }
    
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
    
    return { access_token, newJwtToken };
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Clear auth state and redirect to login
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('current_user');
    window.location.href = '/';
    return Promise.reject(error);
  }
};

// Add response interceptor to handle token refresh
backendApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { newJwtToken } = await refreshAccessToken();
        
        // Update the authorization header with the new JWT token
        if (newJwtToken) {
          originalRequest.headers.Authorization = `Bearer ${newJwtToken}`;
        }
        
        // Retry the original request with the new token
        return backendApi(originalRequest);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Add interceptor to include Spotify token in requests
spotifyApi.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('spotify_access_token');
  const tokenExpiry = localStorage.getItem('spotify_token_expiry');
  
  try {
    // If token is expired or about to expire soon (within 1 minute), refresh it
    if (tokenExpiry && (Date.now() > (parseInt(tokenExpiry) - 60000))) {
      try {
        const { access_token } = await refreshAccessToken();
        if (access_token) {
          config.headers.Authorization = `Bearer ${access_token}`;
        }
      } catch (error) {
        // Error is already handled in refreshAccessToken
        return Promise.reject(error);
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error in request interceptor:', error);
    // If refresh fails, clear auth data and redirect to login
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    window.location.href = '/';
    return Promise.reject(error);
  }
  
  return config;
});

// Response interceptor for Spotify API responses
spotifyApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { access_token } = await refreshAccessToken();
        
        // Set the new token in the header
        spotifyApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        
        // Retry the original request with the new token
        return spotifyApi(originalRequest);
      } catch (error) {
        // If refresh token fails, redirect to login
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expiry');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('current_user');
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const getCurrentlyPlaying = async (): Promise<CurrentlyPlaying | null> => {
  try {
    console.log('Fetching currently playing track from backend...');
    
    const spotifyToken = localStorage.getItem('spotify_access_token');
    if (!spotifyToken) {
      console.log('No Spotify access token found');
      return null;
    }
    
    const response = await backendApi.get('api/spotify/currently-playing', {
      headers: {
        'X-Spotify-Token': spotifyToken
      }
    });
    
    // If nothing is playing, our backend returns { data: null }
    if (!response.data?.data) {
      console.log('No track currently playing');
      return null;
    }
    
    const data = response.data.data;
    
    // Ensure the response matches our type
    if (data && data.item && data.item.id) {
      // Make sure duration_ms exists (needed for progress bar)
      if (!data.item.duration_ms) {
        console.warn('Missing duration_ms in track data, adding default');
        data.item.duration_ms = 30000; // default 30 seconds as fallback
      }
      return data;
    } else {
      console.error('Unexpected response format from backend:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching currently playing from backend:', error);
    return null;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await spotifyApi.get('/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Request interceptor for Spotify API requests
spotifyApi.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('spotify_access_token');
  const tokenExpiry = localStorage.getItem('spotify_token_expiry');
  
  try {
    // If token is expired or about to expire soon (within 1 minute), refresh it
    if (tokenExpiry && (Date.now() > (parseInt(tokenExpiry) - 60000))) {
      try {
        const { access_token } = await refreshAccessToken();
        if (access_token) {
          config.headers.Authorization = `Bearer ${access_token}`;
        }
      } catch (error) {
        // Error is already handled in refreshAccessToken
        return Promise.reject(error);
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error in request interceptor:', error);
    // If refresh fails, clear auth data and redirect to login
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    window.location.href = '/';
    return Promise.reject(error);
  }
  
  return config;
});