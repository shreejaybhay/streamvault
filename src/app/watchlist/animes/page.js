"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BiMovie } from 'react-icons/bi';
import { CiBookmarkRemove } from 'react-icons/ci';
import MediaCard from '@/components/MediaCard';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;

const AnimeWatchlist = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');

  const isAnime = (show) => {
    // Check if the show has the animation genre (16)
    // and is from Japan (original language is Japanese)
    return show.genre_ids?.includes(16) && show.original_language === 'ja';
  };

  useEffect(() => {
    const fetchWatchlistsAndAnimeDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const userRes = await fetch('/api/currentUser');
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        const user = await userRes.json();

        const watchlistRes = await fetch(`/api/users/${user._id}/watchlist`);
        if (!watchlistRes.ok) throw new Error('Failed to fetch watchlists');
        const watchlistsData = await watchlistRes.json();

        const watchlistsWithDetails = await Promise.all(
          watchlistsData.map(async (watchlist) => {
            const animeDetails = await Promise.all(
              (watchlist.tvShowIds || []).map(async (showId) => {
                try {
                  // First, get the show details
                  const showResponse = await axios.get(
                    `${TMDB_BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&append_to_response=keywords`
                  );
                  
                  // Get genre information
                  const genreResponse = await axios.get(
                    `${TMDB_BASE_URL}/tv/${showId}/keywords?api_key=${TMDB_API_KEY}`
                  );

                  const show = {
                    ...showResponse.data,
                    keywords: genreResponse.data.results
                  };

                  // Only return the show if it's an anime
                  if (show.genres?.some(genre => genre.id === 16) && show.original_language === 'ja') {
                    return show;
                  }
                  return null;
                } catch (error) {
                  console.error(`Error fetching anime ${showId}:`, error);
                  return null;
                }
              })
            );

            return {
              ...watchlist,
              animeDetails: animeDetails.filter(anime => anime !== null)
            };
          })
        );

        // Filter out watchlists with no anime
        const animeWatchlists = watchlistsWithDetails.filter(
          watchlist => watchlist.animeDetails.length > 0
        );

        setWatchlists(animeWatchlists);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistsAndAnimeDetails();
  }, []);

  const handleRemoveFromWatchlist = async (animeId, watchlistId) => {
    try {
      // Optimistically update UI
      setWatchlists(prevWatchlists => 
        prevWatchlists.map(watchlist => {
          if (watchlist._id === watchlistId) {
            return {
              ...watchlist,
              animeDetails: watchlist.animeDetails.filter(anime => anime.id !== animeId),
              tvShowIds: watchlist.tvShowIds.filter(id => id !== animeId.toString())
            };
          }
          return watchlist;
        }).filter(watchlist => watchlist.animeDetails.length > 0)
      );

      // Make API call
      const authToken = localStorage.getItem('authToken');
      await axios.delete(`/api/watchlist/${watchlistId}/anime/${animeId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      console.error('Error removing anime:', error);
      const fetchWatchlistsAndAnimeDetails = async () => {
        // ... existing fetch function ...
      };
      fetchWatchlistsAndAnimeDetails();
    }
  };

  const getFilteredAndSortedAnimes = () => {
    const allAnimes = watchlists.flatMap(watchlist => watchlist.animeDetails || []);

    return allAnimes.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.first_air_date || '0') - new Date(a.first_air_date || '0');
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'title':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
        <div className="text-error text-xl">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse bg-base-300 rounded-lg shadow-lg border border-base-300">
              <div className="aspect-[2/3] bg-base-200 rounded-t-lg" />
              <div className="p-3">
                <div className="h-4 bg-base-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-base-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sortedAnimes = getFilteredAndSortedAnimes();

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-base-content">Your Anime Collection</h1>
          <select
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        <AnimatePresence mode="popLayout">
          {sortedAnimes.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6">
              {sortedAnimes.map((anime) => (
                <motion.div
                  key={anime.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="relative group"
                >
                  <MediaCard
                    item={anime}
                    type="anime"
                  />
                  <button
                    onClick={() => handleRemoveFromWatchlist(
                      anime.id,
                      watchlists.find(w => w.animeDetails.some(a => a.id === anime.id))?._id
                    )}
                    className="absolute top-2 right-2 p-2 rounded-full bg-error/90 text-error-content hover:bg-error z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                  >
                    <CiBookmarkRemove className="w-6 h-6" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <BiMovie className="text-6xl text-base-content/30 mb-4" />
              <h3 className="text-2xl font-bold text-base-content/50">
                No Anime in Your Collection Yet
              </h3>
              <p className="text-base-content/60 mt-2">
                Discover and add your favorite anime series to build your collection!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimeWatchlist;
