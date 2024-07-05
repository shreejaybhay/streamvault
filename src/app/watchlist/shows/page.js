"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const ShowsWatchlist = () => {
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

  const fetchShowDetails = async (showIds) => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
    const showDetails = [];

    for (const showId of showIds) {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${showId}?api_key=${apiKey}`);
        showDetails.push(response.data);
      } catch (error) {
        console.error(`Error fetching show details for ID ${showId}:`, error);
      }
    }

    return showDetails;
  };

  useEffect(() => {
    const fetchShowData = async () => {
      if (watchlists.length > 0) {
        const updatedWatchlists = await Promise.all(
          watchlists.map(async (watchlist) => {
            const showDetails = await fetchShowDetails(watchlist.tvShowIds);
            return { ...watchlist, showDetails };
          })
        );
        setWatchlists(updatedWatchlists);
      }
    };

    fetchShowData();
  }, [watchlists]);

  const getBadge = (releaseYear) => {
    const currentYear = new Date().getFullYear();
    if (releaseYear === currentYear) {
      return "Presently";
    } else if (releaseYear === currentYear - 1) {
      return "NEW";
    } else {
      return "Older";
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while fetching data
  }

  return (
    <div className="min-h-screen text-base-content bg-base-200">
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold">Your Shows Watchlist</h1>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {watchlists.map((watchlist) => (
            watchlist.showDetails && watchlist.showDetails.map((show) => (
              <Link key={show.id} href={`/shows/${show.id}`}>
                <div className="block h-full overflow-hidden transition-transform duration-200 transform rounded-md shadow-md bg-base-300 hover:scale-105">
                  <img
                    src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image+Available'}
                    alt={show.name}
                    className="object-cover w-full"
                  />
                  <div className="p-4">
                    <h2 className="mb-2 text-xl font-bold">
                      {show.name} ({new Date(show.first_air_date).getFullYear()})
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getBadge(new Date(show.first_air_date).getFullYear()) === "NEW" ? 'bg-green-600' : getBadge(new Date(show.first_air_date).getFullYear()) === "Presently" ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                        {getBadge(new Date(show.first_air_date).getFullYear())}
                      </span>
                    </h2>
                    <p className="text-sm text-base-content line-clamp-3">{show.overview}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-400">Rating: {show.vote_average}</span>
                      <span className="text-sm text-gray-400">TV Show</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowsWatchlist;
