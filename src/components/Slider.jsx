"use client";
import { CiBookmarkPlus, CiBookmarkCheck } from "react-icons/ci";
import { FaPlay } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// New Skeleton Loader component for the hero slider
const SliderSkeleton = () => {
  return (
    <div className="relative w-full lg:h-[calc(100vh-68px)] h-[500px] overflow-hidden">
      {/* Gradient overlays for better visual effect */}
      <div className="absolute top-0 left-0 z-10 w-full h-full bg-gradient-to-r from-black via-black/70 to-transparent"></div>
      <div className="absolute top-0 left-0 z-10 w-full h-full bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
      
      {/* Background skeleton with enhanced shimmer effect */}
      <div 
        className="absolute inset-0 w-full h-full animate-pulse"
        style={{
          background: 'linear-gradient(90deg, #1a1a1a 0%, #262626 50%, #1a1a1a 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear'
        }}
      />
      
      {/* Content skeleton with staggered animations */}
      <div className="absolute z-20 bg-transparent md:w-[50%] w-[85%] xl:bottom-28 left-8 md:left-16 bottom-12">
        {/* Title skeleton with dynamic width */}
        <div 
          className="w-3/4 h-12 mb-6 rounded-lg animate-pulse"
          style={{
            background: 'linear-gradient(90deg, #333 0%, #444 50%, #333 100%)',
            animation: 'shimmerWithDelay 2s infinite linear',
            animationDelay: '0.1s'
          }}
        />
        
        {/* Overview skeleton - multiple lines with staggered animations */}
        <div className="space-y-3 mb-8">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-4 rounded animate-pulse"
              style={{
                width: `${100 - (index * 15)}%`,
                background: 'linear-gradient(90deg, #333 0%, #444 50%, #333 100%)',
                animation: 'shimmerWithDelay 2s infinite linear',
                animationDelay: `${0.2 + (index * 0.1)}s`
              }}
            />
          ))}
        </div>

        {/* Action buttons skeleton - matching the actual buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap items-center gap-3 sm:gap-4"
        >
          {/* Watch Now button skeleton */}
          <div 
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base 
              rounded-full bg-primary/30 animate-pulse"
          >
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white/20"></div>
            <div className="w-20 sm:w-24 h-4 sm:h-5 rounded bg-white/20"></div>
          </div>

          {/* Bookmark button skeleton */}
          <div 
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base 
              rounded-full bg-white/10 animate-pulse backdrop-blur-sm"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20"></div>
            <div className="w-20 sm:w-24 h-4 sm:h-5 rounded bg-white/20"></div>
          </div>
        </motion.div>
      </div>
      
      {/* Enhanced slide indicators skeleton */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full animate-pulse transition-all duration-300 ${
              i === 0 ? 'w-12 bg-primary/50' : 'w-2 bg-gray-600/50'
            }`}
            style={{
              animation: 'pulseWithDelay 2s infinite linear',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Add these custom animations to your global CSS file
const customStyles = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes shimmerWithDelay {
    0% { background-position: 200% 0; opacity: 0.7; }
    50% { opacity: 1; }
    100% { background-position: -200% 0; opacity: 0.7; }
  }

  @keyframes pulseWithDelay {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite linear;
  }
`;

// Add this style tag to your component
const StyleTag = () => (
  <style jsx global>{customStyles}</style>
);

export default function Slider() {
  const [movies, setMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState({});
  const sliderRef = useRef(null);

  useEffect(() => {
    const TMDBKEY = process.env.NEXT_PUBLIC_TMDB_KEY;
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDBKEY}&page=1`
        );
        if (!response.data.results) {
          throw new Error("No results found");
        }
        setMovies(response.data.results.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        // Immediately reset to 1 when reaching the end
        return prevSlide >= movies.length ? 1 : prevSlide + 1;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [movies.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "ArrowRight") {
        handleNextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  // Touch swipe functionality
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      // Swipe left (next slide)
      if (touchEndX < touchStartX - 50) {
        handleNextSlide();
      }
      // Swipe right (previous slide)
      if (touchEndX > touchStartX + 50) {
        handlePrevSlide();
      }
    };
    
    const sliderElement = sliderRef.current;
    if (sliderElement) {
      sliderElement.addEventListener("touchstart", handleTouchStart, false);
      sliderElement.addEventListener("touchend", handleTouchEnd, false);
      
      return () => {
        sliderElement.removeEventListener("touchstart", handleTouchStart);
        sliderElement.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [sliderRef.current]);

  const handleSlideChange = (slideNumber) => {
    setCurrentSlide(slideNumber);
  };

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => prev >= movies.length ? 1 : prev + 1);
  }, [movies.length]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => prev <= 1 ? movies.length : prev - 1);
  }, [movies.length]);

  const toggleBookmark = (movieId) => {
    setBookmarked(prev => ({
      ...prev,
      [movieId]: !prev[movieId]
    }));
  };

  if (loading) {
    return (
      <>
        <StyleTag />
        <SliderSkeleton />
      </>
    );
  }

  return (
    <div ref={sliderRef} className="relative w-full min-h-[400px] h-[calc(100vh-68px)] overflow-hidden group">
      {/* Main Carousel */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait" initial={false}>
          {movies.map((movie, index) => (
            index + 1 === currentSlide && (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.2, // Reduced from 0.3 to 0.2
                  ease: "easeInOut"
                }}
                className="relative w-full h-full"
              >
                {/* Enhanced Gradient Overlays */}
                <div className="absolute inset-0 z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent"></div>
                </div>

                {/* Optimized Background Image with smooth hover */}
                <Image
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.title}
                  layout="fill"
                  objectFit="cover"
                  className="object-center transition-all duration-700 ease-in-out transform scale-100 group-hover:scale-105"
                  priority={index === 0}
                  quality={90}
                />

                {/* Responsive Content Container */}
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
                      font-bold text-white tracking-wide font-display leading-tight mb-3 sm:mb-4"
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
                      {movie.release_date?.split("-")[0]}
                    </span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-white/10 rounded-lg backdrop-blur-sm">
                      {movie.adult ? "18+" : "PG-13"}
                    </span>
                  </motion.div>

                  {/* Enhanced Overview Section */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="relative overflow-hidden rounded-xl bg-black/20 mb-4 sm:mb-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent backdrop-blur-sm -z-10"></div>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-gray-200 
                      line-clamp-3 sm:line-clamp-3 p-3 sm:p-4">
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
                      href={`/movies/${movie.id}`}
                      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base 
                        text-white transition-all duration-300 rounded-full bg-primary 
                        hover:bg-primary/80 hover:scale-105 active:scale-95"
                    >
                      <FaPlay className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">Watch Now</span>
                    </Link>
                    <button
                      onClick={() => toggleBookmark(movie.id)}
                      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base 
                        transition-all duration-300 rounded-full bg-white/10 hover:bg-white/20 
                        backdrop-blur-sm hover:scale-105 active:scale-95"
                    >
                      {bookmarked[movie.id] ? (
                        <CiBookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      ) : (
                        <CiBookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                      <span className="font-medium text-white">
                        {bookmarked[movie.id] ? "Bookmarked" : "Bookmark"}
                      </span>
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced Navigation Buttons */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 
          bg-black/30 hover:bg-primary text-white p-2 sm:p-3 rounded-full 
          opacity-0 group-hover:opacity-100 transition-all duration-300 
          hover:scale-110 active:scale-95 backdrop-blur-sm touch:opacity-100"
        aria-label="Previous slide"
      >
        <IoIosArrowBack className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={handleNextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 
          bg-black/30 hover:bg-primary text-white p-2 sm:p-3 rounded-full 
          opacity-0 group-hover:opacity-100 transition-all duration-300 
          hover:scale-110 active:scale-95 backdrop-blur-sm touch:opacity-100"
        aria-label="Next slide"
      >
        <IoIosArrowForward className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Enhanced Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 
        flex space-x-2 sm:space-x-3">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index + 1)}
            className="group relative flex items-center justify-center h-8 transition-all duration-300"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className={`h-1 rounded-full transition-all duration-500 relative overflow-hidden ${
              index + 1 === currentSlide 
                ? "w-8 sm:w-12 bg-primary shadow-lg shadow-primary/30" 
                : "w-1 bg-gray-400/50 group-hover:bg-gray-300/70"
            }`}>
              {index + 1 === currentSlide && (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 8, ease: "linear" }}
                  className="absolute top-0 left-0 h-[0.75px] bg-white/30 rounded-full"
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper function to map genre IDs to names
function getGenreName(genreId) {
  const genres = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
  };
  
  return genres[genreId] || "Unknown";
}
