"use client"
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef, useCallback } from "react"
import { BsFillMicFill, BsXCircleFill, BsFilterLeft, BsArrowCounterclockwise } from "react-icons/bs"
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa"
import { BiMovie } from "react-icons/bi"
import { motion, AnimatePresence } from "framer-motion"
import MediaCard from "@/components/MediaCard"
import { FiImage } from "react-icons/fi"
import { FaStar } from "react-icons/fa"

const MoviesPage = () => {
    const [movies, setMovies] = useState([])
    const [additionalMovies, setAdditionalMovies] = useState([])
    const [searchTerm, setSearchTerm] = useState("") // This is for the input value
    const [activeSearchTerm, setActiveSearchTerm] = useState("") // This is for the actual search
    const [page, setPage] = useState(1)
    const [selectedGenre, setSelectedGenre] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(100)
    const [genres, setGenres] = useState([])
    const [isListening, setIsListening] = useState(false)
    const [voiceError, setVoiceError] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const searchInputRef = useRef(null)
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const searchContainerRef = useRef(null)
    const [selectedList, setSelectedList] = useState('')
    const [sortBy, setSortBy] = useState("popularity.desc")

    const searchKey = "movie_search_term"
    const selectedGenreKey = "movie_selected_genre"
    const SCROLL_POSITION_KEY = "movie_scroll_position"
    const api_key = process.env.NEXT_PUBLIC_TMDB_KEY

    // Add debounce function
    const debounce = (func, wait) => {
        let timeout
        return (...args) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => func.apply(this, args), wait)
        }
    }

    // Add fetchSuggestions function
    const fetchSuggestions = async (searchTerm) => {
        if (!searchTerm.trim()) {
            setSuggestions([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${encodeURIComponent(
                    searchTerm
                )}&page=1`
            )
            const data = await response.json()
            setSuggestions(data.results.slice(0, 5))
        } catch (error) {
            console.error("Error fetching suggestions:", error)
            setSuggestions([])
        } finally {
            setIsSearching(false)
        }
    }

    // Add debouncedFetchSuggestions
    const debouncedFetchSuggestions = useCallback(
        debounce((searchTerm) => fetchSuggestions(searchTerm), 300),
        []
    )

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`)
                if (!response.ok) throw new Error("Failed to fetch genres")
                const data = await response.json()
                setGenres(data.genres)
            } catch (error) {
                console.error("Error fetching genres:", error)
            }
        }

        fetchGenres()
    }, [api_key])

    useEffect(() => {
        const fetchMovies = async () => {
            setIsLoading(true);
            let url;

            if (activeSearchTerm) {
                url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${encodeURIComponent(
                    activeSearchTerm
                )}&page=${page}&per_page=20`;
            } else if (selectedList) {
                url = `https://api.themoviedb.org/3/movie/${selectedList}?api_key=${api_key}&page=${page}&per_page=20`;
            } else if (selectedGenre) {
                url = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&with_genres=${selectedGenre}&page=${page}&sort_by=${sortBy}&per_page=20`;
            } else {
                url = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&page=${page}&sort_by=${sortBy}&vote_count.gte=100&per_page=20`;
            }

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setMovies(data.results.slice(0, 20));
                // Calculate total pages based on 20 items per page
                setTotalPages(Math.min(Math.ceil(data.total_results / 20), 500));
            } catch (error) {
                console.error("Error fetching movies:", error);
                setMovies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, [activeSearchTerm, page, selectedGenre, api_key, selectedList, sortBy]);

    const handleGenreChange = (genreId) => {
        setSelectedGenre(genreId === selectedGenre ? "" : genreId)
        setPage(1)
        localStorage.setItem(selectedGenreKey, genreId === selectedGenre ? "" : genreId)
    }

    const clearFilters = () => {
        setSelectedGenre("");
        setSelectedList("");
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setPage(newPage);
        localStorage.setItem("movie_page", newPage.toString());
    }

    const handleSearchChange = (e) => {
        const searchTermValue = e.target.value
        setSearchTerm(searchTermValue)
        setShowSuggestions(true)
        debouncedFetchSuggestions(searchTermValue)
    }

    const handleSearchSubmit = (value) => {
        setActiveSearchTerm(value)
        setShowSuggestions(false)
        setPage(1)
        localStorage.setItem(searchKey, value)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(searchTerm)
        }
    }

    const handleSuggestionClick = (movie) => {
        setSearchTerm(movie.title)
        handleSearchSubmit(movie.title)
    }

    const clearSearch = () => {
        setSearchTerm("")
        setActiveSearchTerm("")
        localStorage.setItem(searchKey, "")
        searchInputRef.current?.focus()
    }

    const handleVoiceSearch = () => {
        if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
            setVoiceError("Voice recognition not supported in your browser")
            setTimeout(() => setVoiceError(""), 3000)
            return
        }

        setVoiceError("")
        setIsListening(true)

        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
        recognition.lang = "en-US"
        recognition.start()

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setSearchTerm(transcript)
            setPage(1)
            localStorage.setItem(searchKey, transcript)
            setIsListening(false)
        }

        recognition.onerror = (event) => {
            console.error("Error occurred in recognition: ", event.error)
            setVoiceError(`Error: ${event.error}`)
            setTimeout(() => setVoiceError(""), 3000)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }
    }

    const saveScrollPosition = () => {
        sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString())
    }

    const getBadge = (year) => {
        const currentYear = new Date().getFullYear()
        if (year === currentYear) return "New"
        if (year === currentYear - 1) return "Recent"
        if (year >= 2015) return "2015+"
        if (year >= 2000) return "2000s"
        if (year >= 1990) return "90s"
        if (year >= 1980) return "80s"
        if (year >= 1970) return "70s"
        if (year >= 1960) return "60s"
        if (year >= 1950) return "50s"
        if (year < 1950) return "Classic"
        return null
    }

    const displayMovies = [...movies, ...additionalMovies].slice(0, 24)

    const renderPagination = () => {
        const getPageNumbers = () => {
            const pageNumbers = []
            const maxPagesToShow = 5

            if (totalPages <= maxPagesToShow) {
                for (let i = 1; i <= totalPages; i++) {
                    pageNumbers.push(i)
                }
            } else {
                let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2))
                let endPage = startPage + maxPagesToShow - 1

                if (endPage > totalPages) {
                    endPage = totalPages
                    startPage = Math.max(1, endPage - maxPagesToShow + 1)
                }

                for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i)
                }
            }

            return pageNumbers
        }

        return (
            <div className="flex items-center justify-center space-x-2 mt-10">
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    className="flex items-center justify-center w-10 h-10 rounded-md bg-base-300 hover:bg-primary hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="First page"
                >
                    <FaAngleDoubleLeft className="text-sm" />
                </button>

                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center justify-center w-10 h-10 rounded-md bg-base-300 hover:bg-primary hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Previous page"
                >
                    <FaChevronLeft className="text-sm" />
                </button>

                {getPageNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-300 ${pageNum === page ? "bg-primary text-white" : "bg-base-300 hover:bg-primary/70 hover:text-white"
                            }`}
                    >
                        {pageNum}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center justify-center w-10 h-10 rounded-md bg-base-300 hover:bg-primary hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Next page"
                >
                    <FaChevronRight className="text-sm" />
                </button>

                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages}
                    className="flex items-center justify-center w-10 h-10 rounded-md bg-base-300 hover:bg-primary hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Last page"
                >
                    <FaAngleDoubleRight className="text-sm" />
                </button>
            </div>
        )
    }

    const MovieSkeleton = () => (
        <div className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg animate-pulse bg-base-100 border border-base-300">
            <div className="relative aspect-[2/3] bg-base-300"></div>
            <div className="p-4 space-y-3">
                <div className="h-5 rounded bg-base-300 w-3/4"></div>
                <div className="flex justify-between">
                    <div className="h-4 rounded bg-base-300 w-1/4"></div>
                    <div className="h-4 rounded bg-base-300 w-1/4"></div>
                </div>
            </div>
        </div>
    )

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleListChange = (list) => {
        setSelectedList(list);
        setPage(1);
        setSelectedGenre(''); // Clear genre when changing list
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        setPage(1);
    };

    useEffect(() => {
        // Clean up URL parameters on component mount
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.search) {  // If there are any search parameters
                window.history.replaceState({}, '', url.pathname);
            }
        }
    }, []);

    return (
        <div className="min-h-screen text-base-content bg-gradient-to-br from-base-300 to-base-200">
            <div className="container px-4 py-8 mx-auto">
                <div className="flex flex-col items-center justify-between mb-8 sm:flex-row">
                    <h1 className="mb-4 text-3xl font-bold sm:mb-0">Movies</h1>

                    <div className="flex flex-col w-full gap-4 sm:w-auto sm:flex-row">
                        <div className="relative flex-grow sm:min-w-[400px] md:min-w-[500px]" ref={searchContainerRef}>
                            <div className="relative flex gap-2">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="Search movies..."
                                        className="w-full px-4 py-3 pr-10 text-base transition-colors border rounded-lg input input-bordered focus:border-primary"
                                        ref={searchInputRef}
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute p-1 -translate-y-1/2 rounded-full right-3 top-1/2 text-base-content/50 hover:text-base-content"
                                            aria-label="Clear search"
                                        >
                                            <BsXCircleFill size={16} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleSearchSubmit(searchTerm)}
                                    className="btn btn-primary"
                                    disabled={!searchTerm?.trim() || isLoading}
                                >
                                    Search
                                </button>
                            </div>

                            <AnimatePresence>
                                {showSuggestions && (searchTerm.trim() || isSearching) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute z-50 w-full mt-2 overflow-hidden bg-base-100 border rounded-lg shadow-xl border-base-content/10"
                                    >
                                        {isSearching ? (
                                            <div className="flex items-center justify-center p-4">
                                                <div className="loading loading-spinner loading-md"></div>
                                            </div>
                                        ) : suggestions.length > 0 ? (
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {suggestions.map((movie) => (
                                                    <div
                                                        key={movie.id}
                                                        onClick={() => handleSuggestionClick(movie)}
                                                        className="flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-base-200"
                                                    >
                                                        {movie.poster_path ? (
                                                            <img
                                                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                                alt={movie.title}
                                                                className="w-12 h-18 object-cover rounded-md"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-12 h-18 bg-base-200 rounded-md">
                                                                <FiImage className="text-base-content/30" size={20} />
                                                            </div>
                                                        )}
                                                        <div className="flex-grow">
                                                            <div className="font-medium line-clamp-1">{movie.title}</div>
                                                            <div className="flex items-center gap-2 mt-1 text-sm text-base-content/70">
                                                                <span>{movie.release_date?.split("-")[0] || "TBA"}</span>
                                                                {movie.vote_average > 0 && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <div className="flex items-center">
                                                                            <FaStar className="text-yellow-400 mr-1" size={12} />
                                                                            {movie.vote_average.toFixed(1)}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : searchTerm.trim() ? (
                                            <div className="p-4 text-center text-base-content/70">
                                                No movies found
                                            </div>
                                        ) : null}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={handleVoiceSearch}
                            className={`btn ${isListening ? "btn-error" : "btn-primary"}`}
                            disabled={isLoading}
                            aria-label="Voice search"
                        >
                            <BsFillMicFill size={18} />
                            {isListening && <span>Listening...</span>}
                        </button>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn ${showFilters ? "btn-secondary" : "btn-outline"}`}
                            aria-label="Toggle filters"
                        >
                            <BsFilterLeft size={18} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Genre filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 mb-6 rounded-lg bg-base-100">
                                {/* Movie Lists Section */}
                                <div className="mb-6">
                                    <h2 className="mb-3 text-lg font-semibold">Movie Lists</h2>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleListChange('now_playing')}
                                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedList === 'now_playing'
                                                    ? "bg-primary text-primary-content"
                                                    : "bg-base-300 hover:bg-base-200 text-base-content"
                                                }`}
                                        >
                                            Now Playing
                                        </button>
                                        <button
                                            onClick={() => handleListChange('popular')}
                                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedList === 'popular'
                                                    ? "bg-primary text-primary-content"
                                                    : "bg-base-300 hover:bg-base-200 text-base-content"
                                                }`}
                                        >
                                            Popular
                                        </button>
                                        <button
                                            onClick={() => handleListChange('top_rated')}
                                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedList === 'top_rated'
                                                    ? "bg-primary text-primary-content"
                                                    : "bg-base-300 hover:bg-base-200 text-base-content"
                                                }`}
                                        >
                                            Top Rated
                                        </button>
                                        <button
                                            onClick={() => handleListChange('upcoming')}
                                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedList === 'upcoming'
                                                    ? "bg-primary text-primary-content"
                                                    : "bg-base-300 hover:bg-base-200 text-base-content"
                                                }`}
                                        >
                                            Upcoming
                                        </button>
                                    </div>
                                    {selectedList && (
                                        <button
                                            onClick={() => handleListChange('')}
                                            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors"
                                        >
                                            <BsXCircleFill size={14} />
                                            <span>Clear list filter</span>
                                        </button>
                                    )}
                                </div>

                                {/* Genre Section - Disabled when list is selected */}
                                <div className={`${selectedList ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
                                        Genre
                                        {selectedList && (
                                            <span className="text-sm font-normal text-base-content/70">
                                                (Disabled while list filter is active)
                                            </span>
                                        )}
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {genres.map((genre) => (
                                            <button
                                                key={genre.id}
                                                onClick={() => handleGenreChange(genre.id.toString())}
                                                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedGenre === genre.id.toString()
                                                        ? "bg-primary text-primary-content"
                                                        : "bg-base-300 hover:bg-base-200 text-base-content"
                                                    }`}
                                                disabled={selectedList}
                                            >
                                                {genre.name}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedGenre && !selectedList && (
                                        <button
                                            onClick={clearFilters}
                                            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors"
                                        >
                                            <BsXCircleFill size={14} />
                                            <span>Clear genre filter</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Movie grid or loading skeletons */}
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {[...Array(20)].map((_, index) => (
                            <MovieSkeleton key={index} />
                        ))}
                    </div>
                ) : movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <BiMovie className="text-6xl text-base-content/30 mb-4" />
                        <h3 className="text-2xl font-bold text-base-content/50">No Movies Found</h3>
                        <p className="text-base-content/60 mt-2 text-center">
                            {activeSearchTerm
                                ? `No results found for "${activeSearchTerm}"`
                                : selectedGenre
                                    ? "No movies found for selected genre"
                                    : "No movies available"}
                        </p>
                        {(activeSearchTerm || selectedGenre) && (
                            <button
                                onClick={() => {
                                    clearSearch();
                                    clearFilters();
                                }}
                                className="mt-6 px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl 
                                    transition-colors duration-300 flex items-center gap-2"
                            >
                                <BsArrowCounterclockwise className="w-4 h-4" />
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {movies.slice(0, 20).map((movie) => (
                            <MediaCard key={movie.id} item={movie} type="movie" onClick={saveScrollPosition} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && movies.length > 0 && renderPagination()}

                {/* Voice search error message */}
                {voiceError && (
                    <div className="fixed bottom-4 right-4 bg-error text-error-content px-4 py-2 rounded-md shadow-lg">
                        {voiceError}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MoviesPage

