// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SpotifyAuth from './components/SpotifyAuth';
import Callback from './components/Callback';
import Dashboard from './components/Dashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize state from localStorage on component mount
    const token = localStorage.getItem('spotify_access_token');
    const tokenExpiry = localStorage.getItem('spotify_token_expiry');
    return !!(token && tokenExpiry && parseInt(tokenExpiry) > Date.now());
  });
  
  console.log('App auth state:', isAuthenticated);
  
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('spotify_access_token');
      const tokenExpiry = localStorage.getItem('spotify_token_expiry');
      
      if (token && tokenExpiry) {
        const isValid = parseInt(tokenExpiry) > Date.now();
        setIsAuthenticated(isValid);
        
        if (!isValid) {
          localStorage.removeItem('spotify_authenticated');
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    
    // Check immediately
    checkAuth();
    
    // Listen for storage events
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SpotifyAuth />} />
          <Route path="/callback" element={<Callback />} />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} 
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;