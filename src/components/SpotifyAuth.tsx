// src/components/SpotifyAuth.tsx
import React from 'react';

// src/components/SpotifyAuth.tsx (add this at the top of the component)
import { useEffect } from 'react';



const SpotifyAuth: React.FC = () => {

    useEffect(() => {
    // Check and log authentication state on component mount
    const isAuth = localStorage.getItem('spotify_authenticated') === 'true';
    console.log("Auth page - Current auth status:", isAuth);
  }, []);

  const handleLogin = () => {
    // Get client ID from environment variables
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    
    // Must match exactly what's in your Spotify Dashboard
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    
    if (!redirectUri) {
      console.error('VITE_SPOTIFY_REDIRECT_URI is not set in environment variables');
      return;
    }
    
    // Generate random state
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (let i = 0; i < 16; i++) {
      state += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Save state to verify later
    localStorage.setItem('spotify_auth_state', state);
    
    // Define scopes - specify exactly what your app needs
    const scope = 'user-read-private user-read-email user-read-currently-playing user-read-playback-state';
    
    // Create authentication URL with properly encoded parameters
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    
    // Add parameters using URLSearchParams for proper encoding
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code'); // Use authorization code flow instead of implicit
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', scope);
    
    // Redirect to Spotify auth page
    console.log("Redirecting to:", authUrl.toString());
    window.location.href = authUrl.toString();
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Spotify Notes App</h1>
      <p className="text-lg mb-8">Connect with Spotify to see what you're playing and share notes</p>
      <button 
        onClick={handleLogin}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-full font-bold transition-colors"
      >
        Connect to Spotify
      </button>
    </div>
  );
};

export default SpotifyAuth;