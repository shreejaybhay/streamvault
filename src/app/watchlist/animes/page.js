"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const AnimeWatchlist = () => {
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

  const fetchAnimeDetails = async (animeIds) => {
    const animeDetails = [];

    for (const animeId of animeIds) {
      try {
        const response = await axios.get(`${TMDB_BASE_URL}/tv/${animeId}?api_key=${TMDB_API_KEY}`);
        animeDetails.push(response.data);
      } catch (error) {
        console.error(`Error fetching anime details for ID ${animeId}:`, error);
      }
    }

    return animeDetails;
  };

  useEffect(() => {
    const fetchAnimeData = async () => {
      if (watchlists.length > 0) {
        const updatedWatchlists = await Promise.all(
          watchlists.map(async (watchlist) => {
            const animeDetails = await fetchAnimeDetails(watchlist.animeIds);
            return { ...watchlist, animeDetails };
          })
        );
        setWatchlists(updatedWatchlists);
      }
    };

    fetchAnimeData();
  }, [watchlists]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-base-200">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-base-content bg-base-200">
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold">Your Anime Watchlist</h1>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {watchlists.map((watchlist) =>
            watchlist.animeDetails && watchlist.animeDetails.map((anime) => (
              <Link key={anime.id} href={`/animes/${anime.id}`}>
                <div className="block h-full overflow-hidden transition-transform duration-200 transform rounded-md shadow-md bg-base-300 hover:scale-105">
                  <img
                    src={anime.poster_path ? `https://image.tmdb.org/t/p/w500${anime.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image+Available'}
                    alt={anime.name}
                    className="object-cover w-full"
                  />
                  <div className="p-4">
                    <h2 className="mb-2 text-xl font-bold">{anime.name}</h2>
                    <p className="text-sm text-base-content line-clamp-3">{anime.overview}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-400">Rating: {anime.vote_average}</span>
                      <span className="text-sm text-gray-400">Anime</span>
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

export default AnimeWatchlist;
