"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { BsFillPlayFill } from "react-icons/bs"
import { MdClose } from "react-icons/md"
import { AiOutlineDownload } from "react-icons/ai"
import { CiBookmarkPlus } from "react-icons/ci"
import axios from "axios"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { FiFilm, FiPlay, FiImage, FiCalendar, FiTag, FiArrowRight } from "react-icons/fi"
import { FaStar } from "react-icons/fa"
import Slider from "@/components/Slider"
import { useWatchlistStatus } from '@/hooks/useWatchlistStatus';

const MovieCard = ({ movie, genreMap }) => {
    return (
        <Link href={`/movies/${movie.id}`}>
            <div
                className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-base-100/70 hover:bg-base-100 border border-base-content/5 hover:border-primary/20 h-full flex flex-col"
            >
                <div className="relative">
                    {movie.poster_path ? (
                        <div className="relative aspect-[2/3] overflow-hidden">
                            <img
                                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <div className="aspect-[2/3] bg-gradient-to-br from-base-300 to-base-200 flex items-center justify-center">
                            <FiImage className="text-base-content/50 text-3xl" />
                        </div>
                    )}
                    {movie.vote_average > 0 && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center shadow-md">
                            <FaStar className="text-yellow-400 mr-1.5" />
                            {movie.vote_average.toFixed(1)}
                        </div>
                    )}
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors duration-300 text-sm sm:text-base">
                        {movie.title}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-base-content/5">
                        <div className="flex items-center text-xs text-base-content/70">
                            <FiCalendar className="mr-1 sm:mr-1.5 text-primary/70" />
                            {movie.release_date?.split("-")[0] || "TBA"}
                        </div>
                        {movie.genre_ids && movie.genre_ids[0] && genreMap ? (
                            <div className="text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-primary/15 text-primary font-medium rounded-full flex items-center shadow-sm">
                                <FiTag className="mr-1 sm:mr-1.5 hidden xs:inline-block" />
                                {genreMap[movie.genre_ids[0]]}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    )
}

const MovieDetailsPage = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [trailer, setTrailer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [downloadLinks, setDownloadLinks] = useState([]);
    const [playingMovie, setPlayingMovie] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [watchlist, setWatchlist] = useState([]);
    const [genres, setGenres] = useState([]);
    const [genreMap, setGenreMap] = useState({});
    const [torrentLinks, setTorrentLinks] = useState([]);

    const movieEmbedUrl = `https://vidsrc.pro/embed/movie/${id}`;

    const fetchTorrentLinks = async (movieTitle, year) => {
        try {
            const response = await fetch(
                `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(movieTitle)}`
            );
            const data = await response.json();
            
            if (data.data?.movies && data.data.movies.length > 0) {
                // Find the movie that best matches our title and year
                const movie = data.data.movies.find(m => 
                    m.title.toLowerCase() === movieTitle.toLowerCase() && 
                    m.year === year
                ) || data.data.movies[0];

                return movie.torrents.map(torrent => ({
                    quality: torrent.quality,
                    size: torrent.size,
                    hash: torrent.hash,
                    seeds: torrent.seeds,
                    peers: torrent.peers
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching torrent links:", error);
            return [];
        }
    };

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setIsLoading(true);
                const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;

                // Fetch genres first to build the genre map
                const genresResponse = await fetch(
                    `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`
                );
                const genresData = await genresResponse.json();
                setGenres(genresData.genres || []);

                // Create a map of genre IDs to genre names
                const genreMapping = {};
                genresData.genres?.forEach(genre => {
                    genreMapping[genre.id] = genre.name;
                });
                setGenreMap(genreMapping);

                // Fetch movie details
                const movieResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`
                );
                const movieData = await movieResponse.json();
                setMovie(movieData);

                // Fetch cast
                const creditsResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`
                );
                const creditsData = await creditsResponse.json();
                setCast(creditsData.cast || []);

                // Fetch similar movies
                const similarResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}&language=en-US&page=1`
                );
                const similarData = await similarResponse.json();
                setSimilarMovies(similarData.results || []);

                // Fetch videos (trailers)
                const videosResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=en-US`
                );
                const videosData = await videosResponse.json();
                const trailers = videosData.results?.filter(
                    video => video.type === "Trailer" && video.site === "YouTube"
                );
                setTrailer(trailers && trailers.length > 0 ? trailers[0] : null);

                // Generate download links based on movie data
                const generateDownloadLinks = (movieData) => {
                    const title = movieData.title.replace(/[^a-zA-Z0-9]/g, '');
                    const year = new Date(movieData.release_date).getFullYear();
                    
                    return [
                        {
                            quality: "1080p",
                            size: "2.1 GB",
                            url: `magnet:?xt=urn:btih:&dn=${title}.${year}.1080p`,
                            type: "magnet"
                        },
                        {
                            quality: "720p",
                            size: "1.4 GB",
                            url: `magnet:?xt=urn:btih:&dn=${title}.${year}.720p`,
                            type: "torrent"
                        },
                        {
                            quality: "480p",
                            size: "800 MB",
                            url: `magnet:?xt=urn:btih:&dn=${title}.${year}.480p`,
                            type: "direct"
                        }
                    ];
                };

                // Set download links based on movie data
                setDownloadLinks(generateDownloadLinks(movieData));

                // Fetch torrent links
                if (movieData.title && movieData.release_date) {
                    const year = new Date(movieData.release_date).getFullYear();
                    const torrents = await fetchTorrentLinks(movieData.title, year);
                    setTorrentLinks(torrents);
                }

                setIsLoading(false);

            } catch (error) {
                console.error("Error fetching movie details:", error);
                setIsLoading(false);
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

                // Check if the current movie ID is in the watchlist
                const isInList = response.data.some(item => item.movieIds.includes(id));
                setIsInWatchlist(isInList);
            } catch (error) {
                console.error('Error fetching watchlists:', error);
            }
        };

        fetchMovieDetails();
        fetchWatchlists();
    }, [id]);

    // Function to add movie to watchlist
    const addToWatchlist = async () => {
        try {
            const authToken = localStorage.getItem('authToken'); // Assuming you store authToken in localStorage after login
            const response = await axios.post('/api/watchlist', {
                movieIds: [id] // Add current movie ID to watchlist
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            console.log('Added to watchlist:', response.data);
            setIsInWatchlist(true);
            // Optionally update UI or show a success message to the user

        } catch (error) {
            console.error('Error adding to watchlist:', error);
            // Handle error scenario - e.g., show error message to the user
        }
    };

    // Function to remove movie from watchlist
    const removeFromWatchlist = async () => {
        try {
            const authToken = localStorage.getItem('authToken'); // Assuming you store authToken in localStorage after login
            const watchlistItem = watchlist.find(item => item.movieIds.includes(id));
            if (!watchlistItem) return;

            const response = await axios.delete(`/api/watchlist/${watchlistItem._id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            console.log('Removed from watchlist:', response.data);
            setIsInWatchlist(false);
            // Optionally update UI or show a success message to the user

        } catch (error) {
            console.error('Error removing from watchlist:', error);
            // Handle error scenario - e.g., show error message to the user
        }
    };

    // Toggle function for watchlist
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
        setPlayingMovie(true);
    };

    const sliderSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    // Format runtime to hours and minutes
    const formatRuntime = (minutes) => {
        if (!minutes) return "N/A";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Format budget/revenue to readable format
    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return "N/A";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleDownload = (torrent) => {
        if (!torrent.hash) {
            console.error("No hash available for this torrent");
            return;
        }

        const formattedTitle = movie.title
            .replace(/[^a-zA-Z0-9]/g, '.')
            .replace(/\.+/g, '.')
            .toLowerCase();
        
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
        const fileName = `${formattedTitle}.${year}.${torrent.quality}.x264-YTS`;

        const trackers = [
            'udp://tracker.opentrackr.org:1337/announce',
            'udp://open.tracker.cl:1337/announce',
            'udp://9.rarbg.com:2810/announce',
            'udp://tracker.openbittorrent.com:6969/announce',
            'http://tracker.openbittorrent.com:80/announce',
            'udp://opentracker.i2p.rocks:6969/announce',
            'https://opentracker.i2p.rocks:443/announce',
            'udp://tracker.torrent.eu.org:451/announce',
            'udp://tracker.tiny-vps.com:6969/announce',
            'udp://tracker.dler.org:6969/announce',
            'udp://open.stealth.si:80/announce',
            'udp://exodus.desync.com:6969/announce'
        ];

        const magnetUri = [
            'magnet:?xt=urn:btih:' + torrent.hash,
            'dn=' + encodeURIComponent(fileName),
            ...trackers.map(t => 'tr=' + encodeURIComponent(t))
        ].join('&');

        // Create a clickable link
        const link = document.createElement('a');
        link.href = magnetUri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 text-base-content">
            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="space-y-8">
                        {/* Hero Section Skeleton */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[70vh] w-full overflow-hidden rounded-xl bg-base-300 animate-pulse">
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

                                {/* Content container skeleton */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12 z-20">
                                    <div className="flex flex-col md:flex-row items-start md:items-end gap-4 sm:gap-6 md:gap-8">
                                        {/* Poster skeleton - hidden on mobile */}
                                        <div className="hidden md:block w-52 h-80 rounded-xl bg-base-200 animate-pulse shadow-xl"></div>

                                        {/* Movie info skeleton */}
                                        <div className="flex-1 space-y-4 sm:space-y-6">
                                            {/* Title skeleton */}
                                            <div className="h-7 sm:h-8 md:h-12 w-3/4 bg-base-200 rounded-lg animate-pulse"></div>

                                            {/* Metadata skeleton */}
                                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                                <div className="h-6 w-20 sm:w-24 bg-white/10 rounded-full animate-pulse"></div>
                                                <div className="h-6 w-16 sm:w-20 bg-white/10 rounded-full animate-pulse"></div>
                                                <div className="h-6 w-24 sm:w-32 bg-white/10 rounded-full animate-pulse"></div>
                                            </div>

                                            {/* Genres skeleton */}
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="h-6 sm:h-7 w-16 sm:w-24 bg-primary/30 rounded-full animate-pulse"></div>
                                                ))}
                                            </div>

                                            {/* Overview skeleton */}
                                            <div className="space-y-1.5 sm:space-y-2">
                                                <div className="h-3 sm:h-4 w-full bg-white/10 rounded animate-pulse"></div>
                                                <div className="h-3 sm:h-4 w-5/6 bg-white/10 rounded animate-pulse hidden sm:block"></div>
                                                <div className="h-3 sm:h-4 w-4/6 bg-white/10 rounded animate-pulse hidden md:block"></div>
                                            </div>

                                            {/* Buttons skeleton */}
                                            <div className="flex flex-wrap gap-2 sm:gap-4">
                                                <div className="w-12 h-12 xs:h-10 xs:w-36 sm:h-12 sm:w-36 bg-primary/30 rounded-full animate-pulse"></div>
                                                <div className="w-12 h-12 xs:h-10 xs:w-48 sm:h-12 sm:w-48 bg-secondary/30 rounded-full animate-pulse"></div>
                                                <div className="w-12 h-12 xs:h-10 xs:w-36 sm:h-12 sm:w-36 bg-accent/30 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Movie Details Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                            {/* Left Column - Movie Info */}
                            <div className="md:col-span-2 space-y-4 sm:space-y-6">
                                {/* Cast Section */}
                                <div className="bg-base-200/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-base-content/5">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <div className="h-6 sm:h-8 w-24 sm:w-32 bg-base-300 rounded animate-pulse"></div>
                                    </div>

                                    {/* Cast grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="flex items-center gap-2 sm:gap-3 p-2">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-base-300 animate-pulse"></div>
                                                <div className="flex-1 space-y-1.5 sm:space-y-2">
                                                    <div className="h-3 sm:h-4 w-20 sm:w-24 bg-base-300 rounded animate-pulse"></div>
                                                    <div className="h-2.5 sm:h-3 w-16 sm:w-20 bg-base-300 rounded animate-pulse"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Download Links Section */}
                                <div className="bg-base-200/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-base-content/5">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <div className="h-6 sm:h-8 w-32 sm:w-48 bg-base-300 rounded animate-pulse"></div>
                                    </div>

                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-12 sm:h-14 bg-base-300 rounded-xl animate-pulse"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Additional Info */}
                            <div className="space-y-4 sm:space-y-6">
                                <div className="bg-base-200/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-base-content/5 space-y-3 sm:space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="space-y-1.5 sm:space-y-2">
                                            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-base-300 rounded animate-pulse"></div>
                                            <div className="h-4 sm:h-6 w-32 sm:w-48 bg-base-300 rounded animate-pulse"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : movie ? (
                    <div className="space-y-8">
                        {/* Movie Header with Backdrop */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            {movie.backdrop_path ? (
                                <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[70vh] w-full overflow-hidden rounded-xl">
                                    {/* Gradient overlay with improved opacity transitions */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>

                                    {/* Backdrop image with subtle animation */}
                                    <img
                                        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                                        alt={movie.title}
                                        className="w-full h-full object-cover transform scale-105 animate-subtle-zoom"
                                        style={{
                                            objectPosition: "center 20%",
                                            filter: "brightness(0.9)"
                                        }}
                                    />

                                    {/* Content container with better spacing */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12 z-20">
                                        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 sm:gap-6 md:gap-8">
                                            {/* Poster with improved shadow and border */}
                                            <div className="hidden md:block w-52 h-80 rounded-xl overflow-hidden shadow-2xl transform -translate-y-8 transition-transform hover:scale-105 duration-300 border-2 border-white/10 group">
                                                {movie.poster_path ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                                        <span className="text-base-content/50">No Poster</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Movie details with improved typography and spacing */}
                                            <div className="flex-1 text-white">
                                                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 leading-normal pb-1">
                                                    {movie.title}
                                                    {movie.release_date && (
                                                        <span className="text-white/70 ml-2 text-xl sm:text-2xl font-normal">
                                                            ({movie.release_date.split("-")[0]})
                                                        </span>
                                                    )}
                                                </h1>

                                                {/* Movie metadata with improved badges */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-5 text-sm md:text-base">
                                                    {movie.release_date && (
                                                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                                                            {formatDate(movie.release_date)}
                                                        </span>
                                                    )}
                                                    {movie.runtime && (
                                                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                                                            {formatRuntime(movie.runtime)}
                                                        </span>
                                                    )}
                                                    {movie.vote_average > 0 && (
                                                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg flex items-center gap-2">
                                                            <FaStar className="text-yellow-400" />
                                                            <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Genres with improved styling */}
                                                {movie.genres && movie.genres.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-5">
                                                        {movie.genres.map((genre) => (
                                                            <span
                                                                key={genre.id}
                                                                className="px-4 py-1.5 bg-primary/30 backdrop-blur-md rounded-full text-sm font-medium border border-primary/20 shadow-lg hover:bg-primary/40 transition-colors duration-300 cursor-pointer"
                                                            >
                                                                {genre.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Overview with improved readability */}
                                                <p className="text-white/90 mb-4 sm:mb-7 line-clamp-3 md:line-clamp-none text-sm md:text-base max-w-3xl leading-relaxed">
                                                    {movie.overview}
                                                </p>

                                                {/* Action buttons with improved styling and hover effects */}
                                                <div className="flex flex-wrap gap-2 sm:gap-4">
                                                    {trailer && (
                                                        <button
                                                            onClick={openModal}
                                                            className="flex items-center justify-center sm:px-6 sm:py-3 text-white bg-primary rounded-full hover:bg-primary-focus transition-all duration-300 shadow-lg hover:shadow-primary/30 hover:-translate-y-1 font-medium
                                                            xs:w-auto w-12 h-12 xs:h-auto xs:px-4 xs:py-2.5"
                                                        >
                                                            <FiPlay className="w-5 h-5 xs:mr-2" />
                                                            <span className="hidden xs:inline">Watch Trailer</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleWatchlistToggle}
                                                        className={`flex items-center justify-center sm:px-6 sm:py-3 text-white rounded-full transition-all duration-300 shadow-lg hover:-translate-y-1 font-medium
                                                        xs:w-auto w-12 h-12 xs:h-auto xs:px-4 xs:py-2.5 ${
                                                            isInWatchlist
                                                                ? "bg-error hover:bg-error-focus hover:shadow-error/30"
                                                                : "bg-secondary hover:bg-secondary-focus hover:shadow-secondary/30"
                                                        }`}
                                                    >
                                                        <CiBookmarkPlus className="w-5 h-5 xs:mr-2" />
                                                        <span className="hidden xs:inline">
                                                            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={handleWatchNow}
                                                        className="flex items-center justify-center sm:px-6 sm:py-3 text-white bg-accent rounded-full hover:bg-accent-focus transition-all duration-300 shadow-lg hover:shadow-accent/30 hover:-translate-y-1 font-medium
                                                        xs:w-auto w-12 h-12 xs:h-auto xs:px-4 xs:py-2.5"
                                                    >
                                                        <BsFillPlayFill className="w-5 h-5 xs:mr-2" />
                                                        <span className="hidden xs:inline">Watch Now</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-base-300 to-base-200 p-4 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-base-content/5">
                                    <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                                        {/* Poster with enhanced styling */}
                                        <div className="w-48 h-72 md:w-56 md:h-80 rounded-xl overflow-hidden shadow-xl bg-base-200 border border-base-content/10 group transition-transform duration-300 hover:scale-[1.02]">
                                            {movie.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-base-300 to-base-200 flex items-center justify-center">
                                                    <span className="text-base-content/50 font-medium">No Poster Available</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Movie details with improved typography and spacing */}
                                        <div className="flex-1 space-y-5">
                                            <div>
                                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 tracking-tight">
                                                    {movie.title}
                                                    {movie.release_date && (
                                                        <span className="text-base-content/70 ml-2 text-2xl font-normal">
                                                            ({movie.release_date.split('-')[0]})
                                                        </span>
                                                    )}
                                                </h1>

                                                {/* Movie metadata with improved badges */}
                                                <div className="flex flex-wrap items-center gap-3 mb-5 text-sm md:text-base">
                                                    {movie.release_date && (
                                                        <span className="px-4 py-1.5 bg-base-content/10 backdrop-blur-sm rounded-full border border-base-content/5 shadow-md flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {formatDate(movie.release_date)}
                                                        </span>
                                                    )}
                                                    {movie.runtime > 0 && (
                                                        <span className="px-4 py-1.5 bg-base-content/10 backdrop-blur-sm rounded-full border border-base-content/5 shadow-md flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {formatRuntime(movie.runtime)}
                                                        </span>
                                                    )}
                                                    {movie.vote_average > 0 && (
                                                        <span className="px-4 py-1.5 bg-base-content/10 backdrop-blur-sm rounded-full border border-base-content/5 shadow-md flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5 text-yellow-400">
                                                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Genres with improved styling */}
                                            {movie.genres && movie.genres.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-1">
                                                    {movie.genres.map(genre => (
                                                        <span
                                                            key={genre.id}
                                                            className="px-4 py-1.5 bg-primary/20 text-primary-content/90 backdrop-blur-sm rounded-full text-sm font-medium border border-primary/10 shadow-md hover:bg-primary/30 transition-colors duration-300 cursor-pointer"
                                                        >
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Overview with improved readability */}
                                            <div className="bg-base-100/50 backdrop-blur-sm p-4 rounded-xl border border-base-content/5 shadow-inner">
                                                <p className="text-base-content/90 text-sm md:text-base leading-relaxed">
                                                    {movie.overview}
                                                </p>
                                            </div>

                                            {/* Action buttons with improved styling and hover effects */}
                                            <div className="flex flex-wrap gap-4 pt-2">
                                                {trailer && (
                                                    <button
                                                        onClick={openModal}
                                                        className="flex items-center justify-center sm:px-6 sm:py-3 bg-primary text-primary-content rounded-full hover:bg-primary-focus transition-all duration-300 shadow-lg hover:shadow-primary/30 hover:-translate-y-1 font-medium
                                                        xs:w-auto w-12 h-12 xs:h-auto xs:px-4 xs:py-2.5"
                                                    >
                                                        <FiPlay className="w-5 h-5 xs:mr-2" />
                                                        <span className="hidden xs:inline">Watch Trailer</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleWatchlistToggle}
                                                    className={`flex items-center justify-center sm:px-6 sm:py-3 rounded-full transition-all duration-300 shadow-lg hover:-translate-y-1 font-medium
                                                    xs:w-auto w-12 h-12 xs:h-auto xs:px-4 xs:py-2.5 ${
                                                        isInWatchlist
                                                            ? "bg-error text-error-content hover:bg-error-focus hover:shadow-error/30"
                                                            : "bg-secondary text-secondary-content hover:bg-secondary-focus hover:shadow-secondary/30"
                                                    }`}
                                                >
                                                    <CiBookmarkPlus className="w-5 h-5 xs:mr-2" />
                                                    <span>{isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
                                                </button>
                                                <button
                                                    onClick={handleWatchNow}
                                                    className="flex items-center justify-center sm:px-6 sm:py-3 bg-accent text-accent-content rounded-full hover:bg-accent-focus transition-all duration-300 shadow-lg hover:shadow-accent/30 hover:-translate-y-1 font-medium
                                                    xs:w-auto w-12 h-12 xs:h-auto xs:px-4 xs:py-2.5"
                                                >
                                                    <BsFillPlayFill className="w-5 h-5 xs:mr-2" />
                                                    <span>Watch Now</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md transition-all duration-300 animate-in fade-in">
                                    <div
                                        className="relative z-10 w-[98%] sm:w-[95%] max-w-5xl aspect-video bg-base-300 rounded-xl shadow-2xl overflow-hidden border border-white/10 transition-all duration-300 animate-in zoom-in-95"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/70 to-transparent z-20 pointer-events-none"></div>

                                        <button
                                            onClick={closeModal}
                                            className="absolute top-2 sm:top-3 right-2 sm:right-3 text-white bg-black/50 hover:bg-black/70 p-2 sm:p-2.5 rounded-full transition-all duration-300 z-30 shadow-xl hover:scale-110 active:scale-95 group"
                                            aria-label="Close trailer"
                                        >
                                            <MdClose size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                        </button>

                                        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-black/70 to-transparent z-20 flex items-center px-3 sm:px-4 pointer-events-none">
                                            <h3 className="text-white text-sm sm:text-base font-medium truncate text-shadow-sm">
                                                {movie.title} - Official Trailer
                                            </h3>
                                        </div>

                                        <div className='w-full h-full bg-black'>
                                            <iframe
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title={`${movie.title} - Official Trailer`}
                                            ></iframe>
                                        </div>
                                    </div>

                                    <div
                                        className="absolute inset-0 bg-transparent cursor-pointer"
                                        onClick={closeModal}
                                        aria-label="Close modal overlay"
                                    ></div>
                                </div>
                            )}
                        </div>

                        {/* Movie Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column - Movie Info */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Movie Facts */}
                                <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-base-content/5 transition-all duration-300 hover:shadow-xl">
                                    <h2 className="text-xl font-semibold mb-5 border-b border-base-content/10 pb-3 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-primary">
                                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                        </svg>
                                        Movie Facts
                                    </h2>
                                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                        <div className="bg-base-100/50 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                                            <h3 className="text-xs sm:text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">Status</h3>
                                            <p className="text-sm sm:text-base text-base-content font-semibold">{movie.status || "N/A"}</p>
                                        </div>
                                        <div className="bg-base-100/50 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                                            <h3 className="text-xs sm:text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">Release Date</h3>
                                            <p className="text-sm sm:text-base text-base-content font-semibold">{formatDate(movie.release_date)}</p>
                                        </div>
                                        <div className="bg-base-100/50 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                                            <h3 className="text-xs sm:text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">Runtime</h3>
                                            <p className="text-sm sm:text-base text-base-content font-semibold">{formatRuntime(movie.runtime)}</p>
                                        </div>
                                        <div className="bg-base-100/50 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                                            <h3 className="text-xs sm:text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">Budget</h3>
                                            <p className="text-sm sm:text-base text-base-content font-semibold">{formatCurrency(movie.budget)}</p>
                                        </div>
                                        <div className="bg-base-100/50 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                                            <h3 className="text-xs sm:text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">Revenue</h3>
                                            <p className="text-sm sm:text-base text-base-content font-semibold">{formatCurrency(movie.revenue)}</p>
                                        </div>
                                        <div className="bg-base-100/50 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                                            <h3 className="text-xs sm:text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">Original Language</h3>
                                            <p className="text-sm sm:text-base text-base-content font-semibold">{movie.original_language?.toUpperCase() || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Download Links */}
                                {torrentLinks.length > 0 && (
                                    <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-base-content/5">
                                        <h2 className="text-xl font-semibold mb-5 border-b border-base-content/10 pb-3 flex items-center">
                                            <AiOutlineDownload className="w-5 h-5 mr-2 text-primary" />
                                            Download Options
                                        </h2>
                                        <div className="space-y-3">
                                            {torrentLinks.map((torrent, index) => (
                                                <div key={index} 
                                                    className="flex items-center justify-between p-4 rounded-xl bg-base-100/70 hover:bg-base-100 transition-all duration-300 border border-base-content/5"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="bg-primary/10 p-2 rounded-lg">
                                                            <FiFilm className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <span className="font-medium block">
                                                                {torrent.quality} Quality
                                                            </span>
                                                            <span className="text-sm text-base-content/70">
                                                                Size: {torrent.size}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownload(torrent)}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-focus transition-all duration-300 flex items-center space-x-2"
                                                    >
                                                        <AiOutlineDownload className="w-4 h-4" />
                                                        <span>Download</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 text-sm text-base-content/70 text-center">
                                            Note: This is a demo project. Please use official sources for actual content.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Cast */}
                            <div className="md:col-span-1">
                                <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-base-content/5 transition-all duration-300 hover:shadow-xl h-full">
                                    <h2 className="text-xl font-semibold mb-5 border-b border-base-content/10 pb-3 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-primary">
                                            <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                                            <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                                        </svg>
                                        Cast Members
                                    </h2>
                                    <div className="space-y-2 sm:space-y-3">
                                        {cast.slice(0, 6).map((actor, index) => (
                                            <div key={index} className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-base-100/50 hover:bg-base-100 transition-all duration-300 hover:shadow-md border border-base-content/5">
                                                <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-sm">
                                                    <img
                                                        src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                                                        alt={actor.name}
                                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm sm:text-base text-base-content group-hover:text-primary transition-colors duration-300">{actor.name}</p>
                                                    <p className="text-xs sm:text-sm text-base-content/70">{actor.character}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Link
                                        href={`/movies/${id}/cast`}
                                        className="mt-5 w-full flex items-center justify-center gap-2 bg-base-100 hover:bg-base-100/80 text-primary font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-md group border border-primary/10 hover:border-primary/30"
                                    >
                                        <span>View Full Cast</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1">
                                            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Similar Movies Section */}
                        {similarMovies.length > 0 && (
                            <div className="mt-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold relative">
                                        <span className="relative z-10 flex items-center gap-2">
                                            <FiFilm className="text-primary" />
                                            Similar Movies
                                        </span>
                                    </h2>
                                    <Link
                                        href="/movies"
                                        className="group text-sm font-medium text-primary hover:text-primary transition-all duration-300 flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/20"
                                    >
                                        <span className="relative">
                                            View all
                                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                                        </span>
                                        <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                                <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-base-content/5 hover:shadow-xl transition-all duration-300">
                                    {/* Desktop/Tablet Grid View */}
                                    <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                        {similarMovies.slice(0, 10).map(similarMovie => (
                                            <MovieCard key={similarMovie.id} movie={similarMovie} genreMap={genreMap} />
                                        ))}
                                    </div>

                                    {/* Mobile Grid View - Changed from 2 columns to better fit small screens */}
                                    <div className="sm:hidden grid grid-cols-1 xs:grid-cols-2 gap-3">
                                        {similarMovies.slice(0, 6).map(similarMovie => (
                                            <MovieCard
                                                key={similarMovie.id}
                                                movie={similarMovie}
                                                genreMap={genreMap}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile View All Button */}
                                <div className="md:hidden mt-4 text-center">
                                    <Link
                                        href="/movies"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-content rounded-xl hover:bg-primary/20 transition shadow-md"
                                    >
                                        <span>View More Similar Movies</span>
                                        <FiArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[70vh]">
                        <div className="text-4xl font-bold text-base-content/30 mb-4">Movie Not Found</div>
                        <p className="text-base-content/70 mb-8">The movie you're looking for doesn't exist or has been removed.</p>
                        <Link href="/movies" className="px-6 py-3 bg-primary text-primary-content rounded-full hover:bg-primary/90 transition shadow-md">
                            Back to Movies
                        </Link>
                    </div>
                )}

                {/* Movie Player Modal */}
                {playingMovie && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm">
                        <div className="relative z-10 w-full h-full max-w-screen-full rounded-lg sm:rounded-xl overflow-hidden shadow-2xl">
                            <button
                                onClick={() => setPlayingMovie(false)}
                                className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors z-20"
                            >
                                <MdClose size={24} />
                            </button>
                            <div className="w-full h-full">
                                <iframe
                                    className="w-full h-full"
                                    src={movieEmbedUrl}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={movie.title}
                                ></iframe>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetailsPage;
