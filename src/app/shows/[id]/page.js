"use client"
import { useState, useContext, useEffect, useRef } from 'react'
import { AuthContext } from '@/components/AuthContext'
import { useWatchlistStatus } from '@/hooks/useWatchlistStatus'
import Link from "next/link"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { MdClose } from "react-icons/md"
import { BsFillPlayFill } from "react-icons/bs"
import { CiBookmarkPlus } from "react-icons/ci"
import axios from "axios"
import { FiTv, FiPlay, FiImage, FiCalendar, FiTag, FiChevronLeft, FiChevronRight, FiChevronDown, FiArrowRight } from "react-icons/fi"
import { FaStar } from "react-icons/fa"
import Slider from "react-slick"

const animateSubtleZoom = {
  "@keyframes subtle-zoom": {
    "0%": { transform: "scale(1)" },
    "100%": { transform: "scale(1.05)" },
  },
  ".animate-subtle-zoom": {
    animation: "subtle-zoom 20s ease-in-out infinite alternate",
  },
}

const ShowCard = ({ show, genreMap }) => {
  return (
    <Link href={`/shows/${show.id}`}>
      <div
        className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-base-100/70 hover:bg-base-100 border border-base-content/5 hover:border-primary/20 h-full flex flex-col"
        title={show.name}
      >
        <div className="relative">
          {show.poster_path ? (
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                alt={show.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="aspect-[2/3] bg-gradient-to-br from-base-300 to-base-200 flex items-center justify-center">
              <FiImage className="text-base-content/50 text-3xl" />
            </div>
          )}
          {show.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center shadow-md">
              <FaStar className="text-yellow-400 mr-1.5" />
              {show.vote_average.toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {show.name}
          </p>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-base-content/5">
            <div className="flex items-center text-xs text-base-content/70">
              <FiCalendar className="mr-1.5 text-primary/70" />
              {show.first_air_date?.split("-")[0] || "TBA"}
            </div>
            {show.genre_ids && show.genre_ids[0] && genreMap ? (
              <div className="text-xs px-2.5 py-1 bg-primary/15 text-primary font-medium rounded-full flex items-center shadow-sm">
                <FiTag className="mr-1.5" />
                {genreMap[show.genre_ids[0]]}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}

const ShowDetail = ({ params: { id } }) => {
  const { user } = useContext(AuthContext)
  const [show, setShow] = useState(null)
  const [trailer, setTrailer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [similarShows, setSimilarShows] = useState([])
  const [cast, setCast] = useState([])
  const [playingShow, setPlayingShow] = useState(false)
  const [showEmbedUrl, setShowEmbedUrl] = useState("")
  const [selectedSeason, setSelectedSeason] = useState(null)
  const [selectedEpisode, setSelectedEpisode] = useState(null)
  const [watchlist, setWatchlist] = useState([])
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [genres, setGenres] = useState([])
  const [genreMap, setGenreMap] = useState({})
  const [currentEpisodePage, setCurrentEpisodePage] = useState(1)
  const episodesPerPage = 18
  const seasonScrollRef = useRef(null)

  // Function to handle season scrolling
  const scrollSeasons = (direction) => {
    if (seasonScrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280 // Adjust based on card width + gap
      seasonScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Set the embed URL for the show
  useEffect(() => {
    if (id && selectedSeason && selectedEpisode) {
      setShowEmbedUrl(`https://vidsrc-embed.ru/embed/tv/${id}/${selectedSeason}/${selectedEpisode}`)
    }
  }, [id, selectedSeason, selectedEpisode])

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY

        // Fetch genres first to build the genre map
        const genresResponse = await fetch(
          `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`,
        )
        const genresData = await genresResponse.json()
        setGenres(genresData.genres || [])

        // Create a map of genre IDs to genre names
        const genreMapping = {}
        genresData.genres?.forEach((genre) => {
          genreMapping[genre.id] = genre.name
        })
        setGenreMap(genreMapping)

        // Fetch show details
        const showResponse = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`)
        const showData = await showResponse.json()
        setShow(showData)

        // Set default season and episode if available
        if (showData.seasons && showData.seasons.length > 0) {
          const firstSeason = showData.seasons.find((season) => season.season_number > 0)
          if (firstSeason) {
            setSelectedSeason(firstSeason.season_number)
            setSelectedEpisode(1) // Default to first episode
          }
        }

        // Fetch cast
        const creditsResponse = await fetch(`https://api.themoviedb.org/3/tv/${id}/credits?api_key=${apiKey}`)
        const creditsData = await creditsResponse.json()
        setCast(creditsData.cast || [])

        // Fetch similar shows
        const similarResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/similar?api_key=${apiKey}&language=en-US&page=1`,
        )
        const similarData = await similarResponse.json()
        setSimilarShows(similarData.results || [])

        // Fetch videos (trailers)
        const videosResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${apiKey}&language=en-US`,
        )
        const videosData = await videosResponse.json()
        const trailers = videosData.results?.filter((video) => video.type === "Trailer" && video.site === "YouTube")
        setTrailer(trailers && trailers.length > 0 ? trailers[0] : null)
      } catch (error) {
        console.error("Error fetching show details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchWatchlists = async () => {
      try {
        const res = await fetch("/api/currentUser")
        const user = await res.json()
        const userId = user._id
        const authToken = localStorage.getItem("authToken")
        const response = await axios.get(`/api/users/${userId}/watchlist`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        setWatchlist(response.data)

        // Check if the current show ID is in the watchlist
        const isInList = response.data.some((item) => item.tvShowIds && item.tvShowIds.includes(id))
        setIsInWatchlist(isInList)
      } catch (error) {
        console.error("Error fetching watchlists:", error)
      }
    }

    fetchShowDetails()
    fetchWatchlists()
  }, [id])

  // Function to add show to watchlist
  const addToWatchlist = async () => {
    try {
      const authToken = localStorage.getItem("authToken")
      const response = await axios.post(
        "/api/watchlist",
        {
          tvShowIds: [id], // Add current show ID to watchlist
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      )

      console.log("Added to watchlist:", response.data)
      setIsInWatchlist(true)
      // Optionally update UI or show a success message to the user
    } catch (error) {
      console.error("Error adding to watchlist:", error)
      // Handle error scenario - e.g., show error message to the user
    }
  }

  // Function to remove show from watchlist
  const removeFromWatchlist = async () => {
    try {
      const authToken = localStorage.getItem("authToken")
      const watchlistItem = watchlist.find((item) => item.tvShowIds && item.tvShowIds.includes(id))
      if (!watchlistItem) return

      // Optimistically update UI
      setIsInWatchlist(false)
      
      const response = await axios.delete(`/api/watchlist/${watchlistItem._id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      // Update local watchlist state
      setWatchlist(prevWatchlist => prevWatchlist.filter(item => item._id !== watchlistItem._id))
      
    } catch (error) {
      // Revert UI if request fails
      setIsInWatchlist(true)
      console.error("Error removing from watchlist:", error)
    }
  }

  // Toggle function for watchlist
  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist()
    } else {
      addToWatchlist()
    }
  }

  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)

  const handleWatchNow = () => {
    setPlayingShow(true)
  }

  const seasonsSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
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
  }

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 text-base-content">
        <div className="container mx-auto px-4 py-8">
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

                    {/* Show info skeleton */}
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

            {/* Show Details Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              {/* Left Column - Show Info */}
              <div className="md:col-span-2 space-y-4 sm:space-y-6">
                {/* Seasons & Episodes Section */}
                <div className="bg-base-200/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-base-content/5">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="h-6 sm:h-8 w-32 sm:w-48 bg-base-300 rounded animate-pulse"></div>
                  </div>

                  {/* Seasons carousel skeleton */}
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-[2/3] bg-base-300 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                </div>

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
        </div>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-base-200">
        <p>Show not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 text-base-content">
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium">Loading show details...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Section with Backdrop */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {show?.backdrop_path ? (
                <div className="relative h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[70vh] w-full overflow-hidden rounded-xl">
                  {/* Gradient overlay with improved opacity transitions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>

                  {/* Backdrop image with subtle animation */}
                  <img
                    src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
                    alt={show.name}
                    className="w-full h-full object-cover transform scale-105 animate-subtle-zoom"
                    style={{
                      objectPosition: "center 20%",
                      filter: "brightness(0.9)",
                    }}
                  />

                  {/* Content container with better spacing */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12 z-20">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-4 sm:gap-6 md:gap-8">
                      {/* Poster with improved shadow and border */}
                      <div className="hidden md:block w-52 h-80 rounded-xl overflow-hidden shadow-2xl transform -translate-y-8 transition-transform hover:scale-105 duration-300 border-2 border-white/10 group">
                        {show.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                            alt={show.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-base-300 flex items-center justify-center">
                            <span className="text-base-content/50">No Poster</span>
                          </div>
                        )}
                      </div>

                      {/* Show details with improved typography and spacing */}
                      <div className="flex-1 text-white">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 leading-normal pb-1">
                          {show.name}
                          {show.first_air_date && (
                            <span className="text-white/70 ml-2 text-xl sm:text-2xl font-normal">
                              ({show.first_air_date.split("-")[0]})
                            </span>
                          )}
                        </h1>

                        {/* Show metadata with improved badges */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-5 text-sm md:text-base">
                          {show.first_air_date && (
                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                              {formatDate(show.first_air_date)}
                            </span>
                          )}
                          {show.status && (
                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                              {show.status}
                            </span>
                          )}
                          {show.vote_average > 0 && (
                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg flex items-center gap-2">
                              <FaStar className="text-yellow-400" />
                              <span className="font-semibold">{show.vote_average.toFixed(1)}</span>
                            </span>
                          )}
                        </div>

                        {/* Genres with improved styling */}
                        {show.genres && show.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-5">
                            {show.genres.map((genre) => (
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
                          {show.overview}
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
                          {user && isInWatchlist !== null && !isLoading && (
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
                          )}
                          {user && isLoading && (
                            <div className="w-[120px] h-[40px] animate-pulse bg-base-300 rounded-full"></div>
                          )}
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
                  {/* Fallback content for when there's no backdrop */}
                  {/* ... Same structure as above but with adjusted styling for no-backdrop state ... */}
                </div>
              )}
            </div>
            {/* Show Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {/* Left Column - Show Info */}
              <div className="md:col-span-2 space-y-6">
                {/* Show Facts */}
                <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-base-content/5 transition-all duration-300 hover:shadow-xl">
                  <h2 className="text-xl font-semibold mb-5 border-b border-base-content/10 pb-3 flex items-center">
                    <FiTv className="w-5 h-5 mr-2 text-primary" />
                    Show Facts
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-base-100/50 p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                      <h3 className="text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">
                        Status
                      </h3>
                      <p className="text-base-content font-semibold">{show.status || "N/A"}</p>
                    </div>
                    <div className="bg-base-100/50 p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                      <h3 className="text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">
                        First Air Date
                      </h3>
                      <p className="text-base-content font-semibold">{formatDate(show.first_air_date)}</p>
                    </div>
                    <div className="bg-base-100/50 p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                      <h3 className="text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">
                        Episodes
                      </h3>
                      <p className="text-base-content font-semibold">{show.number_of_episodes || "N/A"}</p>
                    </div>
                    <div className="bg-base-100/50 p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                      <h3 className="text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">
                        Seasons
                      </h3>
                      <p className="text-base-content font-semibold">{show.number_of_seasons || "N/A"}</p>
                    </div>
                    <div className="bg-base-100/50 p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                      <h3 className="text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">
                        Network
                      </h3>
                      <p className="text-base-content font-semibold">{show.networks?.[0]?.name || "N/A"}</p>
                    </div>
                    <div className="bg-base-100/50 p-4 rounded-xl transition-all duration-300 hover:bg-base-100 hover:shadow-md group">
                      <h3 className="text-sm font-medium text-base-content/60 mb-1 group-hover:text-primary transition-colors">
                        Original Language
                      </h3>
                      <p className="text-base-content font-semibold">
                        {show.original_language?.toUpperCase() || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Season Selection - Improved with functional scroll buttons and fixed border cutoff */}
                {show?.seasons && show.seasons.length > 0 && (
                  <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-base-content/5 transition-all duration-300 hover:shadow-xl mt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold relative">
                        <span className="relative z-10 flex items-center gap-2">
                          <FiTv className="text-primary" />
                          Seasons & Episodes
                          {show.number_of_seasons && (
                            <span className="px-2.5 py-1 bg-primary/20 text-primary text-sm rounded-full ml-2">
                              {show.number_of_seasons} Seasons
                            </span>
                          )}
                        </span>
                        <span className="absolute bottom-0 left-0 w-1/2 h-2 bg-primary/20 -z-0"></span>
                      </h2>
                    </div>

                    {/* Seasons Carousel with Functional Pagination for Many Seasons */}
                    <div className="mb-6 relative">
                      {/* Add visible navigation buttons with higher z-index */}
                      <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-base-100/90 hover:bg-primary/90 text-base-content hover:text-primary-content p-2 rounded-full shadow-lg transition-all duration-300 -ml-3"
                        onClick={() => document.querySelector('.seasons-slider .slick-prev').click()}
                        aria-label="Previous seasons"
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-base-100/90 hover:bg-primary/90 text-base-content hover:text-primary-content p-2 rounded-full shadow-lg transition-all duration-300 -mr-3"
                        onClick={() => document.querySelector('.seasons-slider .slick-next').click()}
                        aria-label="Next seasons"
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </button>

                      <Slider {...seasonsSliderSettings} className="seasons-slider">
                        {show.seasons &&
                          show.seasons
                            .filter((season) => season.season_number > 0)
                            .map((season) => (
                              <div key={season.id}>
                                <div className="p-1">
                                  <button
                                    onClick={() => {
                                      setSelectedSeason(season.season_number)
                                      setSelectedEpisode(1)
                                      setCurrentEpisodePage(1) // Reset page when changing season
                                    }}
                                    className={`relative group overflow-hidden rounded-xl transition-all duration-300 w-full ${selectedSeason === season.season_number
                                      ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100"
                                      : "hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 hover:ring-offset-base-100"
                                      }`}
                                    style={{
                                      transform: "translateZ(0)",
                                      willChange: "transform",
                                      isolation: "isolate",
                                    }}
                                  >
                                    <div className="aspect-[2/3] relative overflow-hidden">
                                      {season.poster_path ? (
                                        <img
                                          src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                                          alt={`Season ${season.season_number}`}
                                          className={`w-full h-full object-cover transition-transform duration-500 ${selectedSeason === season.season_number
                                            ? "scale-105"
                                            : "group-hover:scale-105"
                                            }`}
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                          <FiTv className="w-8 h-8 text-base-content/30" />
                                        </div>
                                      )}
                                      <div
                                        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${selectedSeason === season.season_number
                                          ? "opacity-100"
                                          : "opacity-0 group-hover:opacity-100"
                                          }`}
                                      />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                      <p className="text-sm font-medium">Season {season.season_number}</p>
                                      <p className="text-xs text-white/70">{season.episode_count} Episodes</p>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            ))}
                      </Slider>
                      <style jsx global>{`
                        .seasons-slider .slick-track {
                          margin-left: 0;
                        }
                        .seasons-slider .slick-list {
                          overflow: hidden;
                          margin: 0 -4px;
                        }
                        .seasons-slider .slick-slide {
                          padding: 4px;
                          z-index: 10;
                        }
                        .seasons-slider .slick-prev, 
                        .seasons-slider .slick-next {
                          z-index: 10;
                          opacity: 0;
                          pointer-events: none;
                        }
                        .seasons-slider .slick-prev {
                          left: 10px;
                        }
                        .seasons-slider .slick-next {
                          right: 10px;
                        }
                        .seasons-slider .slick-prev:before, 
                        .seasons-slider .slick-next:before {
                          color: var(--p);
                        }
                      `}</style>
                    </div>

                    {/* Episodes Grid with Pagination */}
                    {selectedSeason && (
                      <div className="space-y-4">
                        <div className="sticky top-4 z-40 bg-base-100/95 backdrop-blur-sm rounded-xl shadow-lg p-3 mb-6 border border-base-content/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium">Season {selectedSeason}</h3>
                              <span className="px-2 py-0.5 bg-base-300 text-base-content/70 text-xs rounded-md">
                                {show.seasons.find((s) => s.season_number === selectedSeason)?.episode_count || 0}{" "}
                                Episodes
                              </span>
                            </div>

                            <button
                              onClick={handleWatchNow}
                              className="flex items-center justify-center px-4 py-2 text-white bg-accent rounded-lg hover:bg-accent-focus transition-all duration-300 shadow-md hover:shadow-accent/30 hover:-translate-y-0.5 font-medium"
                            >
                              <BsFillPlayFill className="w-4 h-4 mr-1.5" />
                              <span>
                                Watch S{selectedSeason}:E{selectedEpisode}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Calculate total pages and episodes */}
                        {(() => {
                          const totalEpisodes =
                            show.seasons.find((s) => s.season_number === selectedSeason)?.episode_count || 0
                          const totalPages = Math.ceil(totalEpisodes / episodesPerPage)

                          // Calculate which episodes to show based on current page
                          const startEpisode = (currentEpisodePage - 1) * episodesPerPage + 1
                          const endEpisode = Math.min(currentEpisodePage * episodesPerPage, totalEpisodes)

                          return (
                            <>
                              {/* Pagination controls for many episodes */}
                              {totalEpisodes > episodesPerPage && (
                                <div className="flex justify-between items-center mb-4">
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => setCurrentEpisodePage((prev) => Math.max(prev - 1, 1))}
                                      disabled={currentEpisodePage === 1}
                                      className={`px-3 py-1 rounded-md transition-colors ${currentEpisodePage === 1
                                        ? "bg-base-300/50 text-base-content/50 cursor-not-allowed"
                                        : "bg-base-300 hover:bg-base-100"
                                        }`}
                                    >
                                      <FiChevronLeft className="w-4 h-4" />
                                    </button>

                                    {/* Page number buttons */}
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                      // Logic to show current page and nearby pages
                                      let pageNum
                                      if (totalPages <= 5) {
                                        pageNum = i + 1
                                      } else if (currentEpisodePage <= 3) {
                                        pageNum = i + 1
                                      } else if (currentEpisodePage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                      } else {
                                        pageNum = currentEpisodePage - 2 + i
                                      }

                                      return (
                                        <button
                                          key={pageNum}
                                          onClick={() => setCurrentEpisodePage(pageNum)}
                                          className={`px-3 py-1 rounded-md transition-colors ${currentEpisodePage === pageNum
                                            ? "bg-accent text-accent-content"
                                            : "bg-base-300 hover:bg-base-100"
                                            }`}
                                        >
                                          {pageNum}
                                        </button>
                                      )
                                    })}

                                    {totalPages > 5 && currentEpisodePage < totalPages - 2 && (
                                      <>
                                        <span className="px-3 py-1">...</span>
                                        <button
                                          onClick={() => setCurrentEpisodePage(totalPages)}
                                          className="px-3 py-1 rounded-md bg-base-300 hover:bg-base-100 transition-colors"
                                        >
                                          {totalPages}
                                        </button>
                                      </>
                                    )}

                                    <button
                                      onClick={() => setCurrentEpisodePage((prev) => Math.min(prev + 1, totalPages))}
                                      disabled={currentEpisodePage === totalPages}
                                      className={`px-3 py-1 rounded-md transition-colors ${currentEpisodePage === totalPages
                                        ? "bg-base-300/50 text-base-content/50 cursor-not-allowed"
                                        : "bg-base-300 hover:bg-base-100"
                                        }`}
                                    >
                                      <FiChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-base-content/70">Jump to:</span>
                                    <div className="relative">
                                      <select
                                        value={selectedEpisode}
                                        onChange={(e) => {
                                          const episode = Number.parseInt(e.target.value)
                                          setSelectedEpisode(episode)

                                          // Calculate which page this episode is on
                                          const page = Math.ceil(episode / episodesPerPage)
                                          setCurrentEpisodePage(page)

                                          // Scroll to the selected episode after a short delay
                                          setTimeout(() => {
                                            const element = document.getElementById(`episode-${episode}`)
                                            if (element) {
                                              const container = element.closest(".episode-grid")
                                              if (container) {
                                                container.scrollTo({
                                                  top: element.offsetTop - container.offsetTop - 16,
                                                  behavior: "smooth",
                                                })
                                              }
                                            }
                                          }, 50)
                                        }}
                                        className="appearance-none bg-base-300 text-base-content rounded-lg pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-base-200 transition-colors"
                                        style={{
                                          scrollbarWidth: "none",
                                          msOverflowStyle: "none",
                                        }}
                                      >
                                        {Array.from(
                                          {
                                            length:
                                              show.seasons.find((s) => s.season_number === selectedSeason)
                                                ?.episode_count || 0,
                                          },
                                          (_, i) => i + 1,
                                        ).map((episode) => (
                                          <option key={episode} value={episode}>
                                            Episode {episode}
                                          </option>
                                        ))}
                                      </select>
                                      <style jsx>{`
                                        select::-webkit-scrollbar {
                                          display: none;
                                        }
                                        select {
                                          scrollbar-width: none;
                                        }
                                        select option {
                                          background-color: var(--b1);
                                          color: var(--bc);
                                          padding: 8px;
                                        }
                                      `}</style>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-base-content/70">
                                        <FiChevronDown className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {Array.from(
                                  {
                                    length:
                                      totalEpisodes > episodesPerPage ? endEpisode - startEpisode + 1 : totalEpisodes,
                                  },
                                  (_, i) => startEpisode + i,
                                ).map((episodeNum) => (
                                  <button
                                    key={episodeNum}
                                    onClick={() => setSelectedEpisode(episodeNum)}
                                    className={`relative group p-4 rounded-xl transition-all duration-300 overflow-hidden ${selectedEpisode === episodeNum
                                      ? "bg-accent text-accent-content shadow-lg shadow-accent/20"
                                      : "bg-base-300/50 hover:bg-base-300 hover:shadow-md text-base-content"
                                      }`}
                                    style={{
                                      transform: "translateZ(0)",
                                      willChange: "transform",
                                      isolation: "isolate",
                                    }}
                                  >
                                    <div className="flex flex-col items-center text-center space-y-2">
                                      <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedEpisode === episodeNum
                                          ? "bg-accent-content/20"
                                          : "bg-base-content/10 group-hover:bg-base-content/20"
                                          }`}
                                      >
                                        <span className="font-medium">{episodeNum}</span>
                                      </div>
                                      <span className="text-xs">Episode {episodeNum}</span>
                                    </div>
                                    {selectedEpisode === episodeNum && (
                                      <div className="absolute inset-0 bg-accent opacity-20 rounded-xl" />
                                    )}
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-accent group-hover:w-1/2 transition-all duration-300 rounded-full opacity-0 group-hover:opacity-100"></div>
                                  </button>
                                ))}
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Cast */}
              <div className="md:col-span-1">
                <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-base-content/5 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                  <h2 className="text-xl font-semibold mb-5 border-b border-base-content/10 pb-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 mr-2 text-primary"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                          clipRule="evenodd"
                        />
                        <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                      </svg>
                      Cast Members
                    </div>
                  </h2>

                  {/* Cast list layout showing cast members to fill the fixed height */}
                  <div className="space-y-2 mb-4 overflow-y-auto flex-grow">
                    {cast.slice(0, 11).map((actor, index) => (
                      <div
                        key={index}
                        className="group relative p-3 rounded-xl bg-base-100/50 hover:bg-base-100 transition-all duration-300 hover:shadow-md border border-base-content/5 flex items-center"
                        style={{
                          transform: "translateZ(0)",
                          willChange: "transform",
                          isolation: "isolate",
                        }}
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-sm mr-3 flex-shrink-0">
                          <img
                            src={
                              actor.profile_path
                                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                : "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                            }
                            alt={actor.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-base-content group-hover:text-primary transition-colors duration-300 text-sm truncate">
                            {actor.name}
                          </p>
                          <p className="text-xs text-base-content/70 truncate">{actor.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/shows/${id}/cast`}
                    className="w-full flex items-center justify-center gap-2 bg-base-100 hover:bg-base-100/80 text-primary font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-md group border border-primary/10 hover:border-primary/30 mt-auto"
                  >
                    <span>View Full Cast</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            {playingShow && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
                <div className="relative z-10 w-full h-full max-w-screen-full">
                  <button
                    onClick={() => setPlayingShow(false)}
                    className="absolute text-white top-4 right-4 hover:text-gray-400"
                  >
                    <MdClose size={24} />
                  </button>
                  <iframe
                    className="w-full h-full"
                    src={showEmbedUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={show.name}
                  ></iframe>
                </div>
              </div>
            )}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-300 animate-in fade-in">
                <div
                  className="relative z-10 w-[95%] max-w-5xl aspect-video bg-base-300 rounded-xl shadow-2xl overflow-hidden border border-white/10 transition-all duration-300 animate-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/70 to-transparent z-20 pointer-events-none"></div>

                  <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 p-2.5 rounded-full transition-all duration-300 z-30 shadow-xl hover:scale-110 active:scale-95 group"
                    aria-label="Close trailer"
                  >
                    <MdClose size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent z-20 flex items-center px-4 pointer-events-none">
                    <h3 className="text-white font-medium truncate text-shadow-sm">{show.name} - Official Trailer</h3>
                  </div>

                  <div className="w-full h-full bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${show.name} - Official Trailer`}
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
        )}
        {/* Similar Shows Section */}
        {similarShows.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold relative">
                <span className="relative z-10 flex items-center gap-2">
                  <FiTv className="text-primary" />
                  Similar Shows
                </span>
              </h2>
              <Link
                href="/shows"
                className="group text-sm font-medium text-primary hover:text-primary transition-all duration-300 flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/20"
              >
                <span className="relative">
                  View all
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </span>
                <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="bg-base-200/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-base-content/5 hover:shadow-xl transition-all duration-300">
              {/* Desktop/Tablet Grid View */}
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {similarShows.slice(0, 10).map(similarShow => (
                  <ShowCard key={similarShow.id} show={similarShow} genreMap={genreMap} />
                ))}
              </div>

              {/* Mobile Grid View */}
              <div className="sm:hidden grid grid-cols-1 xs:grid-cols-2 gap-3">
                {similarShows.slice(0, 6).map(similarShow => (
                  <ShowCard key={similarShow.id} show={similarShow} genreMap={genreMap} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default ShowDetail
