import React from 'react';
import { useTrackProgress } from '../../hooks/useTrackProgress';
import { formatTime } from '../../utils/time';
import type { CurrentlyPlaying } from '../../types';



interface PlayerProps {
  currentTrack: CurrentlyPlaying
}

const Player: React.FC<PlayerProps> = ({ currentTrack }) => {

  const progress = useTrackProgress(currentTrack);
  const isPlaying = currentTrack.is_playing;
  return (
    <div className="absolute left-1/2 top-2/5 transform -translate-x-1/2 -translate-y-1/2 z-40">
      <div className="relative">
        <img
          src={currentTrack.item.album.images[0]?.url || ""}
          alt={currentTrack.item.album.name}
          className="rounded-md shadow-xl w-48 h-48 sm:w-64 sm:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md">
          <div className="text-center p-4">
            <h2 className="text-xl font-bold mb-1">
              {currentTrack.item.name}
            </h2>
            <p className="text-gray-300 text-sm mb-2">
              {currentTrack.item.artists
                .map((artist) => artist.name)
                .join(", ")}
            </p>
            <p className="text-gray-400 text-xs">
              {currentTrack.item.album.name}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 mx-auto w-48 sm:w-64">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{formatTime(progress.position * (currentTrack.item.duration_ms || 0))}</span>
          <span>{formatTime(currentTrack.item.duration_ms || 0)}</span>
        </div>
        <div className="w-full bg-gray-700 h-1 mt-4 rounded-full overflow-hidden">
          <div 
            id="progress-bar"
            className={`h-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'} transition-all duration-1000 ${isPlaying ? 'ease-linear' : 'ease-out'}`} 
            style={{ 
              width: `${progress.position * 100}%`,
              transitionDuration: isPlaying ? '1s' : '0.3s'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
