# Spotify Notes

A modern web application that integrates with Spotify to help you take notes about your favorite tracks, albums, and playlists. Built with React, TypeScript, and Vite.

## ✨ Features

- 🔐 Secure Spotify OAuth2 authentication
- 📝 Add and manage notes for your favorite tracks
- 🎵 View your Spotify library and recently played tracks
- 🎨 Modern, responsive UI built with Tailwind CSS
- ⚡ Fast and efficient state management with React Query
- 🔄 Real-time data synchronization
- 🛠 Type-safe codebase with TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Spotify Developer Account (for API credentials)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/spotify-notes.git
   cd spotify-notes
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Spotify API credentials:
     ```
     VITE_SPOTIFY_CLIENT_ID=your_client_id
     VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
     ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠 Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **HTTP Client**: Axios

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # API clients and utilities
├── pages/         # Page components
├── styles/        # Global styles and Tailwind config
└── types/         # TypeScript type definitions
```



