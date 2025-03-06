"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BiMovie } from 'react-icons/bi';
import { CiBookmarkRemove } from 'react-icons/ci';
import MediaCard from '@/components/MediaCard';

const ShowsWatchlist = () => {
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');

  const isAnime = (show) => {
    // Check if the show has the animation genre (16)
    // and is from Japan (original language is Japanese)
    return show.genres?.some(genre => genre.id === 16) && show.original_language === 'ja';
  };

  useEffect(() => {
    const fetchWatchlistAndShows = async () => {
      try {
        const res = await fetch('/api/currentUser');
        const user = await res.json();
        const userId = user._id;
        const response = await fetch(`/api/users/${userId}/watchlist`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch watchlists');
        }
        
        const watchlists = await response.json();
        
        const watchlistsWithDetails = await Promise.all(
          watchlists.map(async (watchlist) => {
            const showDetails = await Promise.all(
              watchlist.tvShowIds.map(async (showId) => {
                try {
                  const response = await axios.get(
                    `https://api.themoviedb.org/3/tv/${showId}?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&append_to_response=keywords`
                  );
                  
                  // Return null if it's an anime
                  if (isAnime(response.data)) {
                    return null;
                  }
                  
                  return response.data;
                } catch (error) {
                  console.error(`Error fetching show ${showId}:`, error);
                  return null;
                }
              })
            );
            return {
              ...watchlist,
              showDetails: showDetails.filter(show => show !== null)
            };
          })
        );

        // Filter out watchlists with no shows
        const showsWatchlists = watchlistsWithDetails.filter(
          watchlist => watchlist.showDetails.length > 0
        );

        setWatchlistData(showsWatchlists);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchWatchlistAndShows();
  }, []);

  const handleRemoveFromWatchlist = async (showId, watchlistId) => {
    try {
      // Optimistically update UI
      setWatchlistData(prevWatchlists => 
        prevWatchlists.map(watchlist => {
          if (watchlist._id === watchlistId) {
            return {
              ...watchlist,
              showDetails: watchlist.showDetails.filter(show => show.id !== showId),
              tvShowIds: watchlist.tvShowIds.filter(id => id !== showId.toString())
            };
          }
          return watchlist;
        }).filter(watchlist => watchlist.showDetails.length > 0)
      );

      // Make API call
      const authToken = localStorage.getItem('authToken');
      await axios.delete(`/api/watchlist/${watchlistId}/show/${showId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      console.error('Error removing show:', error);
      fetchWatchlistAndShows();
    }
  };

  const getFilteredAndSortedShows = () => {
    let allShows = [];
    
    watchlistData.forEach(watchlist => {
      if (watchlist.showDetails) {
        allShows = [...allShows, ...watchlist.showDetails];
      }
    });

    // Apply sorting
    return allShows.sort((a, b) => {
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

  const ShowCardSkeleton = () => (
    <div className="animate-pulse bg-base-300 rounded-lg shadow-lg border border-base-300">
      <div className="aspect-[2/3] bg-base-200 rounded-t-lg" />
      <div className="p-3">
        <div className="h-4 bg-base-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-base-200 rounded w-1/2" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-base-content">Your TV Shows Watchlist</h1>
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
          {watchlistData.some(watchlist => watchlist.showDetails?.length > 0) ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6">
              {getFilteredAndSortedShows().map((show) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="relative group"
                >
                  <MediaCard
                    item={show}
                    type="show"
                  />
                  <button
                    onClick={() => handleRemoveFromWatchlist(show.id, 
                      watchlistData.find(w => 
                        w.showDetails.some(s => s.id === show.id)
                      )?._id
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
                Your watchlist is empty
              </h3>
              <p className="text-base-content/60 mt-2">
                Start adding TV shows to your watchlist!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShowsWatchlist;
