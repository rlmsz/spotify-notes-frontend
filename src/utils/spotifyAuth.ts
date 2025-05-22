// src/utils/spotifyAuth.ts

/**
 * Generate a random string for the state parameter
 */
export const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
};

/**
 * Get the URL for Spotify authorization
 */
export const getAuthUrl = (): string => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const state = generateRandomString(16);
  
  // Store state in localStorage to verify callback
  localStorage.setItem('spotify_auth_state', state);
  
  const scope = 'user-read-private user-read-email user-read-currently-playing';
  
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
    redirect_uri: redirectUri,
    state: state,
    scope: scope,
    show_dialog: 'true'
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

/**
 * Extract token from URL hash after successful authentication
 */
export const getTokenFromUrl = (): { token: string | null, error: string | null } => {
  if (!window.location.hash) {
    return { token: null, error: 'No hash fragment in URL' };
  }
  
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  // Verify state to prevent CSRF attacks
  const state = params.get('state');
  const storedState = localStorage.getItem('spotify_auth_state');
  
  if (!state || state !== storedState) {
    return { token: null, error: 'State mismatch' };
  }
  
  // Clear state from localStorage
  localStorage.removeItem('spotify_auth_state');
  
  const token = params.get('access_token');
  const error = params.get('error');
  
  return { token, error };
};

/**
 * Check if a token exists and has not expired
 */
export const hasValidToken = (): boolean => {
  const token = localStorage.getItem('spotify_access_token');
  const tokenExpiry = localStorage.getItem('spotify_token_expiry');
  
  if (!token || !tokenExpiry) {
    return false;
  }
  
  // Check if token has expired
  return Date.now() < parseInt(tokenExpiry);
};