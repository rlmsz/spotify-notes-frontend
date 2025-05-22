// src/components/Callback.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);
  const cleanupDone = useRef(false);

  // Clean up function to prevent memory leaks
  const cleanup = () => {
    if (cleanupDone.current) return;
    cleanupDone.current = true;
    // Any cleanup code if needed
  };

  useEffect(() => {
    // This will only run once when the component mounts
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const storedState = localStorage.getItem('spotify_auth_state');
        const errorParam = urlParams.get('error');

        console.log("Auth flow started with:", { code, state, storedState, errorParam });

        // Handle errors first
        if (errorParam) {
          throw new Error(`Spotify authentication error: ${errorParam}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Spotify');
        }

        // State validation (only if we have a stored state)
        if (storedState && state !== storedState) {
          throw new Error('State mismatch. Please try logging in again.');
        }

        // Clear the auth state now that we've validated it
        if (storedState) {
          localStorage.removeItem('spotify_auth_state');
        }

        // Exchange code for tokens
        console.log("Exchanging code for tokens...");
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/spotify/token`, { code });
        
        const { 
          access_token, 
          expires_in, 
          refresh_token, 
          token, // JWT token
          user // User data
        } = response.data;
        
        // Store tokens and user data
        console.log("Storing tokens and user data...");
        localStorage.setItem('spotify_access_token', access_token);
        localStorage.setItem('spotify_refresh_token', refresh_token);
        localStorage.setItem('spotify_token_expiry', (Date.now() + expires_in * 1000).toString());
        localStorage.setItem('spotify_authenticated', 'true');
        
        if (token) {
          localStorage.setItem('jwt_token', token);
        }
        
        if (user) {
          localStorage.setItem('current_user', JSON.stringify(user));
        }
        
        console.log("Authentication successful, redirecting to dashboard...");
        
        // Use a short timeout to ensure state updates are processed
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
        
      } catch (err: any) {
        console.error('Authentication error:', err);
        setError(err.message || 'Failed to complete authentication. Please try again.');
        setIsLoading(false);
        cleanup();
      }
    };

    processAuth();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, []); // Empty dependency array means this runs once on mount

  // Loading state (shows spinner and potential errors)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-xl">Processing authentication...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we log you in</p>
          </>
        ) : (
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
            <p className="text-gray-300 mb-6 max-w-md">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h2>
        <p className="mb-6 text-center max-w-md">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-green-500 text-4xl mb-4">✓</div>
      <p className="text-xl">Authentication successful!</p>
      <p className="text-gray-400 mt-2">Redirecting to dashboard...</p>
    </div>
  );
};

export default Callback;