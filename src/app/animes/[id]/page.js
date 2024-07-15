// pages/AnimeDetailsPage.jsx
"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { MdClose } from 'react-icons/md';
import { BsFillPlayFill } from 'react-icons/bs';
import { CiBookmarkPlus } from 'react-icons/ci';
import axios from 'axios';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const AnimeDetailsPage = () => {
    const [anime, setAnime] = useState(null);
    const [id, setId] = useState(null);
    const [trailer, setTrailer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [similarAnime, setSimilarAnime] = useState([]);
    const [cast, setCast] = useState([]);
    const [playingAnime, setPlayingAnime] = useState(false);
    const [animeEmbedUrl, setAnimeEmbedUrl] = useState('');
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [watchlistLoading, setWatchlistLoading] = useState(true);
    const [animeLoading, setAnimeLoading] = useState(true);

    useEffect(() => {
        const pathParts = window.location.pathname.split('/');
        const animeId = pathParts[pathParts.length - 1];
        setId(animeId);
        window.scrollTo(0, 0);

        const fetchAnimeDetails = async () => {
            try {
                if (!id) return;

                // Fetch anime details from TMDB using the anime ID
                const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
                const [animeResponse, trailerResponse, similarResponse, castResponse] = await Promise.all([
                    fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${tmdbApiKey}`),
                    fetch(`${TMDB_BASE_URL}/tv/${id}/videos?api_key=${tmdbApiKey}`),
                    fetch(`${TMDB_BASE_URL}/tv/${id}/similar?api_key=${tmdbApiKey}`),
                    fetch(`${TMDB_BASE_URL}/tv/${id}/credits?api_key=${tmdbApiKey}`)
                ]);

                const [animeData, trailerData, similarData, castData] = await Promise.all([
                    animeResponse.json(),
                    trailerResponse.json(),
                    similarResponse.json(),
                    castResponse.json()
                ]);

                setAnime(animeData);
                setTrailer(trailerData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube'));
                setSimilarAnime(similarData.results);
                setCast(castData.cast);
            } catch (error) {
                console.error('Error fetching anime details:', error);
            } finally {
                setTimeout(() => setLoading(false), 1500); // Show loader for 5 seconds
                setAnimeLoading(false);
            }
        };

        const fetchWatchlists = async () => {
            try {
                const res = await fetch('/api/currentUser');
                const user = await res.json();
                const userId = user._id;
                const authToken = localStorage.getItem('authToken');
                const response = await axios.get(`/api/users/${userId}/watchlist`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                setWatchlist(response.data);

                const isInList = response.data.some(item => item.animeIds.includes(id));
                setIsInWatchlist(isInList);
            } catch (error) {
                console.error('Error fetching watchlists:', error);
            } finally {
                setWatchlistLoading(false);
            }
        };

        fetchAnimeDetails();
        fetchWatchlists();
    }, [id]);

    const addToWatchlist = async () => {
        try {
            setWatchlistLoading(true);
            const authToken = localStorage.getItem('authToken');
            const response = await axios.post('/api/watchlist', { animeIds: [id] }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            setIsInWatchlist(true);
            console.log('Added to watchlist:', response.data);
        } catch (error) {
            console.error('Error adding to watchlist:', error);
        } finally {
            setWatchlistLoading(false);
        }
    };

    const removeFromWatchlist = async () => {
        try {
            setWatchlistLoading(true);
            const authToken = localStorage.getItem('authToken');
            const watchlistItem = watchlist.find(item => item.animeIds.includes(id));
            if (!watchlistItem) {
                setWatchlistLoading(false);
                return;
            }

            const response = await axios.delete(`/api/watchlist/${watchlistItem._id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            setIsInWatchlist(false);
            console.log('Removed from watchlist:', response.data);
        } catch (error) {
            console.error('Error removing from watchlist:', error);
        } finally {
            setWatchlistLoading(false);
        }
    };

    const handleWatchlistToggle = () => {
        if (isInWatchlist) {
            removeFromWatchlist();
        } else {
            addToWatchlist();
        }
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const handleWatchNow = () => {
        if (selectedSeason && selectedEpisode) {
            setPlayingAnime(true);
            setAnimeEmbedUrl(`https://vidsrc.pro/embed/tv/${id}/${selectedSeason}/${selectedEpisode}`);
        } else {
            alert('Please select a season and episode to watch.');
        }
    };

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
            { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
        ],
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white bg-base-200">
                <span className="loading loading-ring loading-lg"></span>
            </div>
        );
    }

    if (!anime && !animeLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white bg-base-200">
                <p>Anime not found</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col items-center justify-start min-h-screen py-8 bg-base-200">
                <div className="container px-4 mx-auto">
                    <div className="grid gap-8 lg:grid-cols-6">
                        <div className="lg:col-span-2">
                            <img
                                src={anime.poster_path ? `https://image.tmdb.org/t/p/w500${anime.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image+Available'}
                                alt={anime.name}
                                className="w-full h-auto rounded-md shadow-lg"
                            />
                        </div>
                        <div className="lg:col-span-4">
                            <h1 className="mb-4 text-4xl font-bold">{anime.name}</h1>
                            <div className="flex flex-wrap items-center mb-4 text-gray-400">
                                <span className="mr-4 text-base-content">First Air Date: {anime.first_air_date}</span>
                                <span className="mr-4 text-base-content">Rating: {anime.vote_average}</span>
                                <span className="text-base-content">Number of Seasons: {anime.number_of_seasons}</span>
                            </div>
                            <div className="mb-4 text-base-content">
                                Genres: {anime.genres.map(genre => genre.name).join(', ')}
                            </div>
                            <div className="mb-4 text-base-content">
                                Production Companies: {anime.production_companies.map(company => company.name).join(', ')}
                            </div>
                            <p className="mb-4 text-base-content">{anime.overview}</p>
                            {trailer && (
                                <div className="flex flex-col mt-4 mb-8">
                                    <h2 className="mb-2 text-lg font-semibold text-base-content">Actions</h2>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <button
                                            onClick={openModal}
                                            className="flex items-center justify-center px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                        >
                                            <BsFillPlayFill className="w-5 h-5 mr-2" />
                                            <span>Watch Trailer</span>
                                        </button>
                                        <button
                                            onClick={handleWatchlistToggle}
                                            className={`flex items-center justify-center px-6 py-2 text-white rounded-md ${isInWatchlist ? 'bg-error hover:bg-error/90' : 'bg-indigo-600'}`}
                                        >
                                            <>
                                                <CiBookmarkPlus className="w-5 h-5 mr-2" />
                                                <span>{isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
                                            </>
                                        </button>
                                        <button
                                            onClick={handleWatchNow}
                                            className="flex items-center justify-center px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                        >
                                            <BsFillPlayFill className="w-5 h-5 mr-2" />
                                            <span>Watch Now</span>
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block mb-2 text-base-content">Select Season:</label>
                                        <select
                                            value={selectedSeason}
                                            onChange={(e) => setSelectedSeason(e.target.value)}
                                            className="w-full p-2 mb-4 rounded-md text-base-content bg-base-300"
                                        >
                                            <option value="">Select Season</option>
                                            {Array.from({ length: anime.number_of_seasons }, (_, i) => i + 1).map(season => (
                                                <option key={season} value={season}>Season {season}</option>
                                            ))}
                                        </select>
                                        {selectedSeason && (
                                            <>
                                                <label className="block mb-2 text-base-content">Select Episode:</label>
                                                <select
                                                    value={selectedEpisode}
                                                    onChange={(e) => setSelectedEpisode(e.target.value)}
                                                    className="w-full p-2 rounded-md text-base-content bg-base-300"
                                                >
                                                    <option value="">Select Episode</option>
                                                    {anime.seasons.find(season => season.season_number === parseInt(selectedSeason)).episode_count &&
                                                        Array.from({ length: anime.seasons.find(season => season.season_number === parseInt(selectedSeason)).episode_count }, (_, i) => i + 1).map(episode => (
                                                            <option key={episode} value={episode}>Episode {episode}</option>
                                                        ))}
                                                </select>
                                            </>
                                        )}
                                    </div>
                                    {showModal && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                            <div className="absolute inset-0 bg-black opacity-75"></div>
                                            <div className="relative z-10 w-[90%] h-[90%] bg-gray-900 rounded-md shadow-lg">
                                                <button
                                                    onClick={closeModal}
                                                    className="absolute text-white top-4 right-4 hover:text-gray-400"
                                                >
                                                    <MdClose size={24} />
                                                </button>
                                                <div className='w-full h-full'>
                                                    <iframe
                                                        className="w-full h-full lg:h-120"
                                                        src={`https://www.youtube.com/embed/${trailer.key}`}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media"
                                                        allowFullScreen
                                                        title={anime.name}
                                                    ></iframe>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-12 lg:grid lg:gap-10 lg:grid-cols-4 sm:flex sm:flex-col">
                        <div className="col-span-1 p-4 rounded-md bg-base-300">
                            <h2 className="mb-4 text-xl font-semibold text-base-content">Cast</h2>
                            <ul className="space-y-2">
                                {cast.slice(0, 5).map((actor, index) => (
                                    <li key={index} className="flex items-center">
                                        <img
                                            src={actor.profile_path ? `https://image.tmdb.org/t/p/w45${actor.profile_path}` : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                                            alt={actor.name}
                                            className="object-cover w-10 h-10 mr-3 rounded-full"
                                        />
                                        <span className="text-base-content">{actor.name}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href={`/anime/${id}/cast`} className="block mt-4 text-indigo-400 hover:underline">View Full Cast</Link>
                        </div>
                        {similarAnime.length > 0 && (
                            <div className="col-span-3 mt-4 sm:mt-10 md:mt-10 lg:mt-0">
                                <h2 className="mb-5 text-lg font-semibold text-base-content">Similar Anime</h2>
                                <Slider {...sliderSettings}>
                                    {similarAnime.map(similar => (
                                        <Link key={similar.id} href={`/animes/${similar.id}`}>
                                            <div className="cursor-pointer">
                                                {similar.poster_path ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w300${similar.poster_path}`}
                                                        alt={similar.name}
                                                        className="w-48 h-auto mx-auto rounded-md"
                                                    />
                                                ) : (
                                                    <img
                                                        src="https://eticketsolutions.com/demo/themes/e-ticket/img/movie.jpg"
                                                        alt="No Poster Available"
                                                        className="w-48 h-auto mx-auto rounded-md"
                                                    />
                                                )}
                                                <p className="mt-2 text-sm text-center text-gray-400">{similar.name}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </Slider>
                            </div>
                        )}
                    </div>
                    {playingAnime && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
                            <div className="relative z-10 w-full h-full max-w-screen-full">
                                <button
                                    onClick={() => setPlayingAnime(false)}
                                    className="absolute text-white top-4 right-4 hover:text-gray-400"
                                >
                                    <MdClose size={24} />
                                </button>
                                <iframe
                                    className="w-full h-full"
                                    src={animeEmbedUrl}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={anime.name}
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnimeDetailsPage;
