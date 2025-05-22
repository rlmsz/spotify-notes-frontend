import React, { useCallback } from 'react';

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = () => {

  const handleLogout = useCallback(() => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_authenticated');
    localStorage.removeItem('spotify_user_id');
    localStorage.removeItem('spotify_user_name');
    window.location.href = '/';
  }, []);
  
  return (
    <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-50 bg-gray-900 bg-opacity-80">
      <h1 className="text-2xl font-bold">Spotify Notes</h1>
      <button
        onClick={handleLogout}
        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
