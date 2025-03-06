"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import { BiMovie } from 'react-icons/bi';
import { CiBookmarkRemove } from 'react-icons/ci';
import MediaCard from '@/components/MediaCard';

const Watchlist = () => {
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');

  // Remove genre-related states and useEffect
  useEffect(() => {
    const fetchWatchlistAndMovies = async () => {
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
            const movieDetails = await Promise.all(
              watchlist.movieIds.map(async (movieId) => {
                try {
                  const response = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`
                  );
                  return response.data;
                } catch (error) {
                  console.error(`Error fetching movie ${movieId}:`, error);
                  return null;
                }
              })
            );
            return {
              ...watchlist,
              movieDetails: movieDetails.filter(movie => movie !== null)
            };
          })
        );

        setWatchlistData(watchlistsWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchWatchlistAndMovies();
  }, []);

  const handleRemoveFromWatchlist = async (movieId, watchlistId) => {
    try {
      // Optimistically update UI first
      setWatchlistData(prevData => 
        prevData.map(watchlist => {
          if (watchlist._id === watchlistId) {
            const updatedMovies = watchlist.movieDetails.filter(movie => movie.id !== movieId);
            return {
              ...watchlist,
              movieDetails: updatedMovies
            };
          }
          return watchlist;
        }).filter(watchlist => watchlist.movieDetails.length > 0)
      );

      // Then make API call
      const authToken = localStorage.getItem('authToken');
      await axios.delete(`/api/watchlist/${watchlistId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      console.error('Error removing movie:', error);
      // Optionally revert the UI if the API call fails
    }
  };

  // Update the getFilteredAndSortedMovies function to only handle sorting
  const getFilteredAndSortedMovies = (watchlists) => {
    let allMovies = [];
    
    watchlists.forEach(watchlist => {
      if (watchlist.movieDetails) {
        allMovies = [...allMovies, ...watchlist.movieDetails];
      }
    });

    // Apply sorting
    return allMovies.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.release_date) - new Date(a.release_date);
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const MovieCardSkeleton = () => (
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
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-base-content">Your Movies Watchlist</h1>
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
          {watchlistData.some(watchlist => watchlist.movieDetails?.length > 0) ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6">
              {getFilteredAndSortedMovies(watchlistData).map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="relative group"
                >
                  <MediaCard
                    item={movie}
                    type="movie"
                  />
                  <button
                    onClick={() => handleRemoveFromWatchlist(movie.id, 
                      watchlistData.find(w => 
                        w.movieDetails.some(m => m.id === movie.id)
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
                Start adding movies to your watchlist!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Watchlist;
