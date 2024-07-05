"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MdKeyboardBackspace } from 'react-icons/md';

const ShowCastPage = () => {
    const [cast, setCast] = useState([]);
    const [showId, setShowId] = useState(null);

    useEffect(() => {
        // Extract the show ID from the URL path
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[2]; // Assuming the URL is like /shows/[showId]/cast
        setShowId(id);

        const fetchCast = async () => {
            try {
                if (!id) return;
                // Fetch cast data from the API
                const response = await fetch(
                    `https://api.themoviedb.org/3/tv/${id}/credits?api_key=97c1ec10f492d5880ccb5f65506d37e0`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch cast data');
                }
                const data = await response.json();
                setCast(data.cast);
            } catch (error) {
                console.error('Error fetching cast data:', error);
            }
        };

        fetchCast();
    }, []);

    return (
        <div>
            <div className="min-h-screen text-white bg-base-300">
                <div className="container px-4 py-8 mx-auto">
                    <div className="flex items-center mb-6">
                        <Link href={`/shows/${showId}`}>
                            <p className="flex items-center text-primary hover:text-primary/70">
                                <MdKeyboardBackspace className="mr-2" /> Back to Shows
                            </p>
                        </Link>
                    </div>
                    <h1 className="mb-8 text-3xl font-bold text-base-content">Cast</h1>
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {cast.map(actor => (
                            <div key={actor.id} className="flex flex-col items-center text-center transition transform hover:scale-[1.02]">
                                <img
                                    src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                                    alt={actor.name}
                                    className="object-cover w-32 h-32 mb-2 rounded-full shadow-lg"
                                />
                                <h2 className="text-lg font-semibold text-base-content">{actor.name}</h2>
                                <p className="text-sm text-gray-400">{actor.character}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowCastPage;
