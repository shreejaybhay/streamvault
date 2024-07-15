// pages/AnimePage.jsx
"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BsFillMicFill } from "react-icons/bs";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const ANIME_GENRE_ID = 16; // Animation genre ID

const AnimePage = () => {
    const [animes, setAnimes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [genres, setGenres] = useState([]);


    const searchKey = 'search_term_anime'; // Key for storing search term in local storage


    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`);
                if (!response.ok) {
                    throw new Error('Failed to fetch genres');
                }
                const data = await response.json();
                setGenres(data.genres);
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        };

        const savedPage = parseInt(localStorage.getItem('page_anime'), 10) || 1;
        setPage(savedPage);
        const savedSearchTerm = localStorage.getItem(searchKey) || '';
        setSearchTerm(savedSearchTerm);

        fetchGenres();
    }, []);

    useEffect(() => {
        const fetchAnimes = async () => {
            setIsLoading(true);
            let url = '';

            if (searchTerm) {
                url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&page=${page}&with_genres=${ANIME_GENRE_ID}`;
            } else {
                url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${ANIME_GENRE_ID}&page=${page}`;
            }

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch animes');
                }
                const data = await response.json();
                setAnimes(data.results);
            } catch (error) {
                console.error('Error fetching animes:', error);
            } finally {
                setIsLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        fetchAnimes();
    }, [searchTerm, page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        localStorage.setItem('page_anime', newPage.toString());
    };

    const handleSearchChange = (e) => {
        const searchTermValue = e.target.value;
        setSearchTerm(searchTermValue);
        setPage(1); // Reset page to 1 when search term changes
        localStorage.setItem(searchKey, searchTermValue); // Store search term in local storage
    };

    const handleVoiceSearch = () => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            console.error('Speech Recognition API not supported in this browser.');
            return;
        }
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchTerm(transcript);
            setPage(1);
            localStorage.setItem(searchKey, transcript); // Store search term in local storage
        };

        recognition.onerror = (event) => {
            console.error('Error occurred in recognition: ', event.error);
        };
    };

    const renderPagination = () => {
        const totalPages = 100;

        return (
            <div className="join">
                <button
                    className="join-item btn"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                >
                    «
                </button>
                <button className="join-item btn" onClick={() => handlePageChange(page)}>
                    Page {page}
                </button>
                <button
                    className="join-item btn"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                >
                    »
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen text-base-content bg-base-200">
            <div className="container px-4 py-8 mx-auto">
                <div className="flex flex-col items-center justify-between mb-8 sm:flex-row">
                    <h1 className="mb-4 text-3xl font-bold sm:mb-0">Anime</h1>
                    <div className="flex flex-col sm:flex-row sm:space-x-4">
                        <label className="flex items-center gap-2 input input-primary">
                            <input
                                className="grow"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
                        </label>
                        <button
                            className="px-4 py-2 mt-2 text-white rounded-md bg-primary sm:mt-0"
                            onClick={handleVoiceSearch}
                        >
                            <BsFillMicFill />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center min-h-screen text-white bg-base-200">
                        <span className="loading loading-ring loading-lg"></span>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {animes.map(anime => (
                                <Link key={anime.id} href={`/animes/${anime.id}`}>
                                    <div className="block h-full overflow-hidden transition-transform duration-200 transform rounded-md shadow-md bg-base-300 hover:scale-105">
                                        <img src={`https://image.tmdb.org/t/p/w500${anime.poster_path}`} alt={anime.name} className="object-cover w-full" />
                                        <div className="p-4">
                                            <h2 className="mb-2 text-xl font-bold">
                                                {anime.name} ({new Date(anime.first_air_date).getFullYear()})
                                            </h2>
                                            <p className="text-sm text-base-content line-clamp-3">{anime.overview}</p>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-sm text-gray-400">Rating: {anime.vote_average}</span>
                                                <span className="text-sm text-gray-400">Anime</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="flex justify-center gap-5 mt-8">
                            {renderPagination()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AnimePage;
