"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Info, Play, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Add this helper function at the top of your component
const getContentRoute = (item) => {
  if (item.first_air_date && !item.isAnime) return 'shows'
  if (item.isAnime) return 'animes'
  return 'movies'
}

// Enhanced Skeleton Loader component with improved animations
const SliderSkeleton = () => {
  return (
    <div className="relative w-full lg:h-[calc(100vh-68px)] h-[500px] overflow-hidden">
      {/* Improved gradient overlays for better visual hierarchy */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent"></div>
      </div>

      {/* Background skeleton with optimized shimmer effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-shimmer"></div>

      {/* Content skeleton with staggered animations */}
      <div className="absolute z-20 md:w-[50%] w-[85%] xl:bottom-28 left-8 md:left-16 bottom-12">
        {/* Title skeleton with dynamic width */}
        <div className="w-3/4 h-12 mb-6 rounded-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer"></div>

        {/* Overview skeleton - multiple lines with staggered animations */}
        <div className="space-y-4 mb-8">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={`h-4 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer`}
              style={{
                width: `${100 - index * 15}%`,
                animationDelay: `${0.2 + index * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Action buttons skeleton - matching the actual buttons */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Watch Now button skeleton */}
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary/30 animate-pulse">
            <div className="w-4 h-4 rounded-full bg-white/20"></div>
            <div className="w-24 h-5 rounded bg-white/20"></div>
          </div>

          {/* More Info button skeleton */}
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 animate-pulse backdrop-blur-sm">
            <div className="w-5 h-5 rounded-full bg-white/20"></div>
            <div className="w-24 h-5 rounded bg-white/20"></div>
          </div>
        </div>
      </div>

      {/* Enhanced slide indicators skeleton */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 rounded-full animate-pulse transition-all duration-300",
              i === 0 ? "w-12 bg-primary/50" : "w-2 bg-gray-600/50",
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function HeroSlider() {
  const [movies, setMovies] = useState([])
  const [currentSlide, setCurrentSlide] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const sliderRef = useRef(null)
  const autoplayTimerRef = useRef(null)
  const progressTimerRef = useRef(null)
  const [progress, setProgress] = useState(0)

  // Preload next image for smoother transitions
  const preloadNextImage = useCallback(
    (nextIndex) => {
      if (movies.length === 0) return

      const nextMovie = movies[nextIndex % movies.length]
      if (!nextMovie?.backdrop_path) return

      // Use the browser's built-in Image constructor
      const img = new window.Image()
      img.src = `https://image.tmdb.org/t/p/original${nextMovie.backdrop_path}`
      img.crossOrigin = "anonymous"
    },
    [movies],
  )

  useEffect(() => {
    const TMDBKEY = process.env.NEXT_PUBLIC_TMDB_KEY
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDBKEY}&page=1`)

        // Process the results
        const results = response.data.results.slice(0, 10).map((item) => ({
          ...item,
          title: item.title || item.name, // TV shows use 'name' instead of 'title'
          isShow: item.media_type === "tv",
          isMovie: item.media_type === "movie",
          isAnime: item.media_type === "tv" && item.genre_ids?.includes(16),
        }))

        setMovies(results)
        setLoading(false)

        // Preload the first few images
        for (let i = 0; i < Math.min(3, results.length); i++) {
          const img = new Image()
          img.src = `https://image.tmdb.org/t/p/original${results[i].backdrop_path}`
          img.crossOrigin = "anonymous"
        }
      } catch (error) {
        console.error("Error fetching movies:", error)
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Autoplay with progress tracking
  useEffect(() => {
    if (loading || movies.length === 0) return

    const startAutoplay = () => {
      // Clear any existing timers
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current)
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)

      // Reset progress
      setProgress(0)

      // Start progress timer (updates every 80ms for smooth animation)
      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100
          return prev + 100 / (8000 / 80) // 8000ms total time
        })
      }, 80)

      // Set timer for next slide
      autoplayTimerRef.current = setTimeout(() => {
        handleNextSlide()
      }, 8000)
    }

    startAutoplay()

    // Preload next image
    const nextIndex = currentSlide % movies.length
    preloadNextImage(nextIndex)

    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current)
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [currentSlide, loading, movies.length, preloadNextImage])

  // Keyboard navigation with improved accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isTransitioning) return

      if (e.key === "ArrowLeft") {
        handlePrevSlide()
      } else if (e.key === "ArrowRight") {
        handleNextSlide()
      } else if (e.key === "Enter" || e.key === " ") {
        // Find the currently focused element
        const focusedElement = document.activeElement
        if (focusedElement && focusedElement.tagName === "BUTTON") {
          focusedElement.click()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isTransitioning])

  // Enhanced touch swipe functionality
  useEffect(() => {
    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX

      // Pause autoplay on touch
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current)
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }

    const handleTouchEnd = (e) => {
      if (isTransitioning) return

      touchEndX = e.changedTouches[0].screenX
      handleSwipe()

      // Resume autoplay after touch
      const autoplayDelay = setTimeout(() => {
        if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current)
        if (progressTimerRef.current) clearInterval(progressTimerRef.current)

        // Reset progress
        setProgress(0)

        // Start progress timer
        progressTimerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) return 100
            return prev + 100 / (8000 / 80)
          })
        }, 80)

        // Set timer for next slide
        autoplayTimerRef.current = setTimeout(() => {
          handleNextSlide()
        }, 8000)
      }, 500)

      return () => clearTimeout(autoplayDelay)
    }

    const handleSwipe = () => {
      // Improved swipe detection with threshold
      const swipeThreshold = 50

      // Swipe left (next slide)
      if (touchEndX < touchStartX - swipeThreshold) {
        handleNextSlide()
      }
      // Swipe right (previous slide)
      if (touchEndX > touchStartX + swipeThreshold) {
        handlePrevSlide()
      }
    }

    const sliderElement = sliderRef.current
    if (sliderElement) {
      sliderElement.addEventListener("touchstart", handleTouchStart, { passive: true })
      sliderElement.addEventListener("touchend", handleTouchEnd, { passive: true })

      return () => {
        sliderElement.removeEventListener("touchstart", handleTouchStart)
        sliderElement.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [sliderRef.current, isTransitioning])

  const handleSlideChange = (slideNumber) => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide(slideNumber)

    // Reset autoplay and progress
    if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current)
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    setProgress(0)

    // Allow transitions to complete before enabling more changes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  const handleNextSlide = useCallback(() => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide((prev) => {
      const newSlide = prev >= movies.length ? 1 : prev + 1
      // Preload the next image
      preloadNextImage(newSlide % movies.length)
      return newSlide
    })

    // Allow transitions to complete before enabling more changes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }, [movies.length, isTransitioning, preloadNextImage])

  const handlePrevSlide = useCallback(() => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide((prev) => {
      const newSlide = prev <= 1 ? movies.length : prev - 1
      // Preload the previous image
      preloadNextImage(newSlide - 2 >= 0 ? newSlide - 2 : movies.length - 1)
      return newSlide
    })

    // Allow transitions to complete before enabling more changes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }, [movies.length, isTransitioning, preloadNextImage])

  if (loading) {
    return <SliderSkeleton />
  }

  return (
    <div
      ref={sliderRef}
      className="relative w-full min-h-[400px] h-[calc(100vh-68px)] overflow-hidden group"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured movies and shows"
    >
      {/* Main Carousel */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait" initial={false}>
          {movies.map(
            (movie, index) =>
              index + 1 === currentSlide && (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="relative w-full h-full"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${movies.length}: ${movie.title}`}
                >
                  {/* Enhanced Gradient Overlays for better text readability */}
                  <div className="absolute inset-0 z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-95"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Optimized Background Image with smooth zoom effect */}
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.05 }}
                    transition={{ duration: 8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                      alt=""
                      fill
                      sizes="100vw"
                      className="object-cover object-center"
                      priority={index === 0}
                      quality={90}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPYe0YQ1AAAAABJRU5ErkJggg=="
                    />
                  </motion.div>

                  {/* Responsive Content Container with blurred backdrop */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="absolute z-20 w-[92%] sm:w-[85%] md:w-[70%] lg:w-[55%] 
                    left-4 sm:left-8 md:left-12 lg:left-16 
                    bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-28"
                  >
                    {/* Title with responsive font sizes */}
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 
                      font-bold text-white tracking-wide leading-tight mb-3 sm:mb-4"
                    >
                      {movie.title}
                    </motion.h2>

                    {/* Enhanced Metadata Section */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="flex items-center gap-2 sm:gap-4 flex-wrap mb-3 sm:mb-4"
                    >
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-primary rounded-lg shadow-lg shadow-primary/30 backdrop-blur-sm">
                        {movie.vote_average?.toFixed(1)} ★
                      </span>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-white/10 rounded-lg backdrop-blur-sm">
                        {movie.release_date?.split("-")[0] || movie.first_air_date?.split("-")[0] || "New"}
                      </span>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-white/10 rounded-lg backdrop-blur-sm">
                        {movie.adult ? "18+" : "PG-13"}
                      </span>
                    </motion.div>

                    {/* Enhanced Overview Section with blurred backdrop */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="relative overflow-hidden rounded-xl backdrop-blur-md mb-4 sm:mb-6"
                    >
                      <div className="absolute inset-0 bg-black/40 -z-10"></div>
                      <p
                        className="text-sm sm:text-base md:text-lg font-medium text-gray-100 
                      tracking-wide leading-relaxed line-clamp-3 sm:line-clamp-3 p-3 sm:p-4"
                      >
                        {movie.overview}
                      </p>
                    </motion.div>

                    {/* Enhanced Action Buttons */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      className="flex flex-wrap items-center gap-3 sm:gap-4"
                    >
                      <Link
                        href={`/${getContentRoute(movie)}/${movie.id}`}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base 
                        text-white transition-all duration-300 rounded-full bg-primary 
                        hover:bg-primary/80 hover:scale-105 active:scale-95 shadow-lg shadow-primary/30
                        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                      >
                        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">Watch Now</span>
                      </Link>
                      <Link
                        href={`/${getContentRoute(movie)}/${movie.id}`}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 
                        text-sm sm:text-base rounded-full backdrop-blur-sm
                        bg-white/10 text-white hover:bg-white/20
                        transition-all duration-300 hover:scale-105 active:scale-95
                        focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                      >
                        <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>More Info</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Navigation Buttons - larger and more visible */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 
          bg-black/40 hover:bg-primary text-white p-3 sm:p-4 rounded-full 
          opacity-0 group-hover:opacity-100 transition-all duration-300 
          hover:scale-110 active:scale-95 backdrop-blur-sm touch:opacity-100
          focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black
          sm:opacity-60"
        aria-label="Previous slide"
        disabled={isTransitioning}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={handleNextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 
          bg-black/40 hover:bg-primary text-white p-3 sm:p-4 rounded-full 
          opacity-0 group-hover:opacity-100 transition-all duration-300 
          hover:scale-110 active:scale-95 backdrop-blur-sm touch:opacity-100
          focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black
          sm:opacity-60"
        aria-label="Next slide"
        disabled={isTransitioning}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Enhanced Slide Indicators with progress animation */}
      <div
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 
        flex space-x-2 sm:space-x-3"
      >
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index + 1)}
            className="group relative flex items-center justify-center h-8 transition-all duration-300"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index + 1 === currentSlide ? "true" : "false"}
            disabled={isTransitioning}
          >
            <div
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 relative overflow-hidden",
                index + 1 === currentSlide
                  ? "w-10 sm:w-14 bg-primary shadow-lg shadow-primary/30"
                  : "w-1.5 bg-gray-400/50 group-hover:bg-gray-300/70 group-hover:w-3",
              )}
            >
              {index + 1 === currentSlide && (
                <motion.div
                  style={{ width: `${progress}%` }}
                  className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

