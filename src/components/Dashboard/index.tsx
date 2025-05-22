import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentlyPlaying } from '../../services/api';
import type { CurrentlyPlaying } from '../../types';
import { NoTrack } from './NoTrack';
import Header from '../Header';
import Footer from '../Footer';
import { NotesContainer } from './NotesContainer';
import { useTrackProgress } from '../../hooks/useTrackProgress';
import Player from '../Player';

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const queryClient = useQueryClient();
  
  const { data: currentTrack } = useQuery<CurrentlyPlaying | null>({
    queryKey: ['currentlyPlaying'],
    queryFn: async (): Promise<CurrentlyPlaying | null> => {
      try {
        return await getCurrentlyPlaying();
      } catch (error) {
        console.error('Error fetching currently playing:', error);
        return null;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Refetch when track ends
  // Handle track end by invalidating the query to force a refetch
  useTrackProgress(currentTrack || null, () => {
    queryClient.invalidateQueries({ queryKey: ['currentlyPlaying'] });
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <Header />
      
      <main className="container mx-auto mt-8">
        {currentTrack ? (
          <>
            <Player 
              currentTrack={currentTrack} 
            />
            <NotesContainer
              currentTrack={currentTrack} 
            />
          </>
        ) : (
          <NoTrack />
        )}
      </main>

      <Footer
        currentTrack={currentTrack || null}
      />
    </div>
  );
};

export default Dashboard;
