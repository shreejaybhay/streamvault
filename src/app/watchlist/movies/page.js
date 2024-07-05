"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const Watchlist = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlists = async () => {
      try {
        const res = await fetch('/api/currentUser');
        const user = await res.json();
        console.log(user); // Log user details to check the structure
        const userId = user._id;
        console.log(`User ID: ${userId}`); // Log user ID
        const response = await fetch(`/api/users/${userId}/watchlist`);
        if (!response.ok) {
          throw new Error('Failed to fetch watchlists');
        }
        const data = await response.json();
        setWatchlists(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching watchlists:', error);
        setLoading(false);
      }
    };

    fetchWatchlists();
  }, []);

  const fetchMovieDetails = async (movieIds) => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
    const movieDetails = [];

    for (const movieId of movieIds) {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
        movieDetails.push(response.data);
      } catch (error) {
        console.error(`Error fetching movie details for ID ${movieId}:`, error);
      }
    }

    return movieDetails;
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      if (watchlists.length > 0) {
        const updatedWatchlists = await Promise.all(
          watchlists.map(async (watchlist) => {
            const movieDetails = await fetchMovieDetails(watchlist.movieIds);
            return { ...watchlist, movieDetails };
          })
        );
        setWatchlists(updatedWatchlists);
      }
    };

    fetchMovieData();
  }, [watchlists]);

  const getBadge = (releaseYear) => {
    const currentYear = new Date().getFullYear();
    if (releaseYear === currentYear) {
      return 'Presently';
    } else if (releaseYear === currentYear - 1) {
      return 'NEW';
    } else {
      return 'Older';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen text-base-content bg-base-200">
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold">Your Movies Watchlist</h1>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {watchlists.map((watchlist) =>
            watchlist.movieDetails && watchlist.movieDetails.map((movie) => (
              <Link key={movie.id} href={`/movies/${movie.id}`}>
                <div className="block h-full overflow-hidden transition-transform duration-200 transform rounded-md shadow-md bg-base-300 hover:scale-105">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://eticketsolutions.com/demo/themes/e-ticket/img/movie.jpg'}
                    alt={movie.title}
                    className="object-cover w-full"
                  />
                  <div className="p-4">
                    <h2 className="mb-2 text-xl font-bold">
                      {movie.title} ({new Date(movie.release_date).getFullYear()})
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getBadge(new Date(movie.release_date).getFullYear()) === 'NEW' ? 'bg-green-600' : getBadge(new Date(movie.release_date).getFullYear()) === 'Presently' ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                        {getBadge(new Date(movie.release_date).getFullYear())}
                      </span>
                    </h2>
                    <p className="text-sm text-base-content line-clamp-3">{movie.overview}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-400">Rating: {movie.vote_average}</span>
                      <span className="text-sm text-gray-400">Movie</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Watchlist;
