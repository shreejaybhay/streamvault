"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BsFilterLeft, BsFillMicFill, BsXCircleFill } from "react-icons/bs"
import { FaStar, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa"
import { FiImage } from "react-icons/fi"
import MediaCard from "@/components/MediaCard"

const ShowsPage = () => {
    const [animes, setAnimes] = useState([])
    const [page, setPage] = useState(() => {
        if (typeof window !== "undefined") {
            return parseInt(localStorage.getItem("anime_page")) || 1
        }
        return 1
    })
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("anime_search_term") || ""
        }
        return ""
    })
    const [activeSearchTerm, setActiveSearchTerm] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("anime_search_term") || ""
        }
        return ""
    })
    const [selectedGenre, setSelectedGenre] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("anime_selected_genre") || ""
        }
        return ""
    })
    const [suggestions, setSuggestions] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [voiceError, setVoiceError] = useState("")
    const [totalPages, setTotalPages] = useState(1)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    const searchContainerRef = useRef(null)
    const searchInputRef = useRef(null)

    const api_key = process.env.NEXT_PUBLIC_TMDB_KEY
    const genreKey = "anime_selected_genre"
    const searchKey = "anime_search_term"
    const SCROLL_POSITION_KEY = "anime_scroll_position"

    const fetchSuggestions = async (searchTerm) => {
        if (!searchTerm.trim()) {
            setSuggestions([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/tv?api_key=${api_key}&query=${encodeURIComponent(
                    searchTerm
                )}&with_genres=16&page=1`
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

    const debounce = (func, wait) => {
        let timeout
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }

    const debouncedFetchSuggestions = useCallback(
        debounce((searchTerm) => fetchSuggestions(searchTerm), 300),
        []
    )

    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        setShowSuggestions(true)
        debouncedFetchSuggestions(value)
    }

    const handleSearchSubmit = (value = searchTerm) => {
        const trimmedValue = value.trim()
        if (!trimmedValue) return
        
        setActiveSearchTerm(trimmedValue)
        setShowSuggestions(false)
        setPage(1)
        localStorage.setItem(searchKey, trimmedValue)
    }

    const handleSuggestionClick = (anime) => {
        setSearchTerm(anime.name)
        handleSearchSubmit(anime.name)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit()
        }
    }

    const clearSearch = () => {
        setSearchTerm("")
        setActiveSearchTerm("")
        setSuggestions([])
        setShowSuggestions(false)
        setPage(1)
        localStorage.removeItem(searchKey)
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }

    useEffect(() => {
        const fetchAnimes = async () => {
            setIsLoading(true)
            let url

            if (activeSearchTerm) {
                url = `https://api.themoviedb.org/3/search/tv?api_key=${api_key}&query=${encodeURIComponent(
                    activeSearchTerm
                )}&with_genres=16&page=${page}`
            } else if (selectedGenre) {
                url = `https://api.themoviedb.org/3/discover/tv?api_key=${api_key}&with_genres=16,${selectedGenre}&page=${page}`
            } else {
                url = `https://api.themoviedb.org/3/discover/tv?api_key=${api_key}&with_genres=16&page=${page}`
            }

            try {
                const response = await fetch(url)
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                const data = await response.json()
                setAnimes(data.results)
                setTotalPages(Math.min(data.total_pages, 500))
            } catch (error) {
                console.error("Error fetching animes:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAnimes()
    }, [activeSearchTerm, page, selectedGenre, api_key])

    const handlePageChange = (newPage) => {
        window.scrollTo({ top: 0, behavior: "smooth" })
        setPage(newPage)
        localStorage.setItem("anime_page", newPage.toString())

        if (typeof window !== "undefined") {
            const url = new URL(window.location)
            url.searchParams.set("page", newPage.toString())
            window.history.pushState({}, "", url)
        }
    }

    const handleGenreChange = (genreId) => {
        setSelectedGenre(genreId === selectedGenre ? "" : genreId)
        setPage(1)
        localStorage.setItem(genreKey, genreId === selectedGenre ? "" : genreId)
    }

    const clearFilters = () => {
        setSelectedGenre("")
        setPage(1)
        localStorage.setItem(genreKey, "")
    }

    const handleVoiceSearch = () => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setVoiceError("Voice recognition is not supported in your browser.")
            setTimeout(() => setVoiceError(""), 3000)
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.lang = "en-US"
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
            setIsListening(true)
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setSearchTerm(transcript)
            handleSearchSubmit(transcript)
        }

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error)
            setVoiceError(`Error: ${event.error}`)
            setTimeout(() => setVoiceError(""), 3000)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.start()
    }

    const saveScrollPosition = () => {
        sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString())
    }

    const AnimeSkeleton = () => (
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
            <div className="flex flex-col items-center mt-10 space-y-2">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={page === 1}
                        className="p-2 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-base-300"
                        aria-label="First page"
                    >
                        <FaAngleDoubleLeft />
                    </button>

                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-base-300"
                        aria-label="Previous page"
                    >
                        <FaChevronLeft />
                    </button>

                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((num) => (
                            <button
                                key={num}
                                onClick={() => handlePageChange(num)}
                                className={`w-10 h-10 rounded-md transition-colors ${
                                    page === num ? "bg-primary text-primary-content" : "hover:bg-base-300"
                                }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="p-2 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-base-300"
                        aria-label="Next page"
                    >
                        <FaChevronRight />
                    </button>

                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={page === totalPages}
                        className="p-2 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-base-300"
                        aria-label="Last page"
                    >
                        <FaAngleDoubleRight />
                    </button>
                </div>

                <div className="text-sm text-base-content/70">
                    Showing page {page} of {totalPages}
                </div>
            </div>
        )
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="min-h-screen text-base-content bg-gradient-to-br from-base-300 to-base-200">
            <div className="container px-4 py-8 mx-auto">
                <div className="flex flex-col items-center justify-between mb-8 sm:flex-row">
                    <h1 className="mb-4 text-3xl font-bold sm:mb-0">Anime</h1>

                    <div className="flex flex-col w-full gap-4 sm:w-auto sm:flex-row">
                        <div className="relative flex-grow sm:min-w-[400px] md:min-w-[500px]" ref={searchContainerRef}>
                            <div className="relative flex gap-2">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Search anime..."
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
                                    onClick={() => handleSearchSubmit()}
                                    className="btn btn-primary"
                                    disabled={!searchTerm.trim() || isLoading}
                                >
                                    Search
                                </button>
                            </div>

                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute z-50 w-full mt-2 overflow-hidden bg-base-100 border rounded-lg shadow-xl border-base-content/10"
                                    >
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {suggestions.map((anime) => (
                                                <div
                                                    key={anime.id}
                                                    onClick={() => handleSuggestionClick(anime)}
                                                    className="flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-base-200"
                                                >
                                                    {anime.poster_path ? (
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/w92${anime.poster_path}`}
                                                            alt={anime.name}
                                                            className="object-cover w-12 h-16 rounded"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-12 h-16 bg-base-200 rounded">
                                                            <FiImage size={20} className="text-base-content/50" />
                                                        </div>
                                                    )}
                                                    <div className="flex-grow">
                                                        <div className="font-medium">{anime.name}</div>
                                                        <div className="text-sm text-base-content/70">
                                                            {anime.first_air_date?.split("-")[0] || "N/A"}
                                                        </div>
                                                    </div>
                                                    {anime.vote_average > 0 && (
                                                        <div className="flex items-center gap-1 px-2 py-1 text-sm rounded bg-base-200">
                                                            <FaStar className="text-yellow-500" />
                                                            {anime.vote_average.toFixed(1)}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
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

                {!isLoading && animes.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <p className="text-xl font-semibold">No anime found</p>
                        <p className="mt-2 text-base-content/70">Try adjusting your search or filters</p>
                        {(searchTerm || selectedGenre) && (
                            <button
                                onClick={() => {
                                    clearSearch()
                                    clearFilters()
                                }}
                                className="mt-4 btn btn-primary btn-sm"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {[...Array(18)].map((_, index) => (
                            <AnimeSkeleton key={index} />
                        ))}
                    </div>
                ) : animes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {animes.map((anime) => (
                            <MediaCard key={anime.id} item={anime} type="anime" onClick={saveScrollPosition} />
                        ))}
                    </div>
                ) : null}

                {!isLoading && animes.length > 0 && renderPagination()}

                {voiceError && (
                    <div className="fixed bottom-4 right-4 bg-error text-error-content px-4 py-2 rounded-md shadow-lg">
                        {voiceError}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ShowsPage


