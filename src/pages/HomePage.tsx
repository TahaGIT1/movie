import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import type { HeroConfig, MediaItem } from '../types';
import { TrailerModal } from '../components/TrailerModal';
import { NowShowingGrid } from '../components/NowShowingGrid';
import { TheatresSection } from '../components/TheatresSection';
import { movieService, errorMessage } from '../services/api';

export const HomePage: React.FC = () => {
  const [trailerItem, setTrailerItem] = useState<MediaItem | null>(null);
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();
  useEffect(() => { movieService.list().then(setMovies).catch((error) => setLoadError(errorMessage(error))); }, []);

  // Exact Figma Hero Reference configuration
  const heroConfig: HeroConfig = {
    pageType: 'movies',
    statusLabelLeft: 'Belagavi, India',
    statusSubLeft: 'Current local movie listings',
    genres: ['Action', 'Drama', 'Sci-Fi'],
    statusToggle: {
      activeOption: 'Now Showing',
      secondaryOption: 'Coming Soon',
    },
    items: movies.slice(0, 4),
  };

  return (
    <main className="w-full">
      {/* 1. PRIMARY FIGMA REFERENCE HERO SECTION */}
      {loadError && <p className="max-w-6xl mx-auto px-4 py-6 text-sm text-red-300" role="alert">{loadError}</p>}
      <HeroSection config={heroConfig} onOpenBooking={(item) => navigate(`/book/${item.id}`)} />

      {/* 2. NOW SHOWING CATALOG GRID */}
      <NowShowingGrid
        items={movies}
        onBook={(item) => navigate(`/book/${item.id}`)}
        onWatchTrailer={setTrailerItem}
        title="Now Showing in Belagavi"
        subtitle="Listings checked 8 October 2026. Choose demo seats and try Razorpay checkout; confirm live showtimes with the cinema."
      />

      {/* Local cinema directory */}
      <TheatresSection />

      {/* Interactive Cinema Seat Booking Modal */}
      {/* Cinematic Trailer Modal */}
      {trailerItem && (
        <TrailerModal
          item={trailerItem}
          isOpen={!!trailerItem}
          onClose={() => setTrailerItem(null)}
          onOpenBooking={(item) => {
            setTrailerItem(null);
            navigate(`/book/${item.id}`);
          }}
        />
      )}
    </main>
  );
};
