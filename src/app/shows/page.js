"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { BsFillMicFill, BsXCircleFill, BsFilterLeft, BsExclamationCircleFill } from "react-icons/bs"
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa"
import { BiMovie } from "react-icons/bi"
import { motion, AnimatePresence } from "framer-motion"
import MediaCard from "@/components/MediaCard"
import { FiImage } from "react-icons/fi"
import { FaStar } from "react-icons/fa"

const ShowsPage = () => {
  const [shows, setShows] = useState([])
  const [additionalShows, setAdditionalShows] = useState([])
  const [searchTerm, setSearchTerm] = useState("") // This is for the input value
  const [activeSearchTerm, setActiveSearchTerm] = useState("") // This is for the actual search
  const [page, setPage] = useState(1)
  const [selectedGenre, setSelectedGenre] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [suggestions, setSuggestions] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState("")
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("popularity.desc")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [genres, setGenres] = useState([]) // Add this line
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)

  const api_key = process.env.NEXT_PUBLIC_TMDB_KEY
  const genreKey = "tv_selected_genre"
  const searchKey = "tv_search_term"
  const SCROLL_POSITION_KEY = "tv_scroll_position"

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
        `https://api.themoviedb.org/3/search/tv?api_key=${api_key}&query=${encodeURIComponent(
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

  useEffect(() => {
    const fetchShows = async () => {
      setIsLoading(true)
      let url

      if (activeSearchTerm) {
        url = `https://api.themoviedb.org/3/search/tv?api_key=${api_key}&query=${encodeURIComponent(
          activeSearchTerm
        )}&page=${page}`
      } else {
        const baseUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${api_key}&page=${page}`
        const genreParam = selectedGenre ? `&with_genres=${selectedGenre}` : ''
        const sortParam = `&sort_by=${sortBy}`
        const airDateParam = `&first_air_date.lte=${new Date().toISOString().split('T')[0]}`
        const languageParam = '&with_original_language=en'
        const voteCountParam = '&vote_count.gte=50'
        
        url = `${baseUrl}${genreParam}${sortParam}${airDateParam}${languageParam}${voteCountParam}`
      }

      try {
        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(`Failed to fetch shows: ${data.status_message}`)
        }

        setShows(data.results)
        setAdditionalShows([])
        setTotalPages(Math.min(data.total_pages, 500))
      } catch (error) {
        console.error("Error fetching TV shows:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShows()
  }, [activeSearchTerm, page, selectedGenre, api_key, sortBy])

  const handleSearchChange = (e) => {
    const searchTermValue = e.target.value
    setSearchTerm(searchTermValue)
    setShowSuggestions(true)
    debouncedFetchSuggestions(searchTermValue)
  }

  const handleSearchSubmit = (value = searchTerm) => {
    setActiveSearchTerm(value)
    setShowSuggestions(false)
    setPage(1)
  }

  const handleSuggestionClick = (show) => {
    setSearchTerm(show.name)
    handleSearchSubmit(show.name)
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
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const handlePageChange = (newPage) => {
    window.scrollTo({ top: 0, behavior: "smooth" })

    setPage(newPage)
    localStorage.setItem("tv_page", newPage.toString())

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

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleVoiceSearch = async () => {
    if (!("webkitSpeechRecognition" in window)) {
      setVoiceError("Voice recognition is not supported in your browser.")
      setTimeout(() => setVoiceError(""), 3000)
      return
    }

    try {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
        setVoiceError("")
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setSearchTerm(transcript)
        handleSearchSubmit(transcript)
        setIsListening(false)
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        if (event.error === 'not-allowed') {
          const errorMessage = isMobile()
            ? "Please go to your browser settings to allow microphone access. Check your browser's site settings or permissions."
            : "Please check the microphone icon in your browser's address bar to allow access";
          
          setVoiceError(
            <div className="flex items-center gap-2">
              <span>{errorMessage}</span>
            </div>
          )
        } else {
          setVoiceError(`Error: ${event.error}`)
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()

    } catch (error) {
      console.error("Voice search error:", error)
      setVoiceError("Failed to start voice search")
      setTimeout(() => setVoiceError(""), 5000)
      setIsListening(false)
    }
  }

  const saveScrollPosition = () => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString())
  }

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

  const ShowSkeleton = () => (
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

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy)
    setPage(1)
    localStorage.setItem("tv_sort_by", newSortBy)
    
    if (typeof window !== "undefined") {
      const url = new URL(window.location)
      url.searchParams.set("page", "1")
      window.history.pushState({}, "", url)
    }
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

  // Add this useEffect for fetching genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/tv/list?api_key=${api_key}`
        )
        if (!response.ok) throw new Error("Failed to fetch genres")
        const data = await response.json()
        setGenres(data.genres)
      } catch (error) {
        console.error("Error fetching genres:", error)
        setGenres([])
      }
    }

    fetchGenres()
  }, [api_key])

  return (
    <div className="min-h-screen text-base-content bg-gradient-to-br from-base-300 to-base-200">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-between mb-8 sm:flex-row">
          <h1 className="mb-4 text-3xl font-bold sm:mb-0">TV Shows</h1>

          <div className="flex flex-col w-full gap-4 sm:w-auto sm:flex-row">
            <div className="relative flex-grow sm:min-w-[400px] md:min-w-[500px]" ref={searchContainerRef}>
              <div className="relative flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search TV shows..."
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
                  onClick={handleSearchSubmit}
                  className="btn btn-primary"
                  disabled={!searchTerm.trim() || isLoading}
                >
                  Search
                </button>
              </div>

              {/* Suggestions dropdown */}
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
                      {suggestions.map((show) => (
                        <div
                          key={show.id}
                          onClick={() => handleSuggestionClick(show)}
                          className="flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-base-200"
                        >
                          {show.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                              alt={show.name}
                              className="w-12 h-18 object-cover rounded-md"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-12 h-18 bg-base-200 rounded-md">
                              <FiImage className="text-base-content/30" size={20} />
                            </div>
                          )}
                          <div className="flex-grow">
                            <div className="font-medium line-clamp-1">{show.name}</div>
                            <div className="text-sm text-base-content/70">
                              {show.first_air_date?.split("-")[0] || "TBA"}
                            </div>
                          </div>
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
              disabled={isLoading || isListening}
              aria-label="Voice search"
            >
              <BsFillMicFill size={18} />
              {isListening ? "Listening..." : ""}
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
                <div className="mb-6">
                  <h2 className="mb-3 text-lg font-semibold">Sort By</h2>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option value="first_air_date.desc">Latest Releases</option>
                    <option value="popularity.desc">Most Popular</option>
                    <option value="vote_average.desc">Highest Rated</option>
                    <option value="vote_count.desc">Most Voted</option>
                    <option value="first_air_date.asc">Oldest First</option>
                  </select>
                </div>

                <h2 className="mb-3 text-lg font-semibold">Genre</h2>
                <div className="flex flex-wrap gap-2">
                  {genres?.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreChange(genre.id.toString())}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        selectedGenre === genre.id.toString()
                          ? "bg-primary text-primary-content"
                          : "bg-base-300 hover:bg-base-200 text-base-content"
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
                
                {/* Clear filter button */}
                {selectedGenre && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors"
                  >
                    <BsXCircleFill size={14} />
                    <span>Clear genre filter</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[...Array(18)].map((_, index) => (
              <ShowSkeleton key={index} />
            ))}
          </div>
        ) : shows.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {shows.map((show) => (
              <MediaCard key={show.id} item={show} type="show" onClick={saveScrollPosition} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xl font-semibold">No TV shows found</p>
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

        {!isLoading && shows.length > 0 && renderPagination()}

        {voiceError && (
          <div className="fixed bottom-4 right-4 max-w-md bg-error/90 text-error-content px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in">
            <div className="flex items-center gap-3">
              <BsExclamationCircleFill className="flex-shrink-0" />
              <p>{voiceError}</p>
            </div>
          </div>
        )}
        {showPermissionGuide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Enable Microphone Access</h3>
              <div className="space-y-4">
                <p className="text-base-content/80">To use voice search, please enable microphone access:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Look for the camera/microphone icon in your address bar</li>
                  <li>Click the icon and select "Allow" for the microphone</li>
                  <li>If you don't see the icon, click the lock/info icon next to the URL</li>
                  <li>Find "Microphone" in the site settings and change it to "Allow"</li>
                  <li>Refresh the page after enabling access</li>
                </ol>
                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn btn-primary"
                  >
                    Refresh Page
                  </button>
                  <button 
                    onClick={() => setShowPermissionGuide(false)} 
                    className="btn btn-ghost"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShowsPage

