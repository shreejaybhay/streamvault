"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useSWR from "swr";

// Custom arrow components with enhanced styling
const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-0 z-10 flex items-center justify-center w-10 h-10 -ml-5 transform -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md text-white top-1/2 hover:bg-white/20 transition-all duration-300 hover:scale-110 group shadow-lg shadow-black/20"
      aria-label="Previous shows"
    >
      <IoIosArrowBack
        size={24}
        className="transition-transform duration-300 group-hover:-translate-x-0.5"
      />
    </button>
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-0 z-10 flex items-center justify-center w-10 h-10 -mr-5 transform -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md text-white top-1/2 hover:bg-white/20 transition-all duration-300 hover:scale-110 group shadow-lg shadow-black/20"
      aria-label="Next shows"
    >
      <IoIosArrowForward
        size={24}
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </button>
  );
};

// Genre mapping for TV shows
const genreMap = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

// Enhanced ShowCard component with modern design and improved hover effects
const ShowCard = ({ show, index }) => {
  return (
    <Link href={`/shows/${show.id}`} passHref>
      <motion.div className="relative px-1.5 md:px-2 lg:px-3 cursor-pointer group">
        <div className="overflow-hidden rounded-lg shadow-lg shadow-black/40 backdrop-blur-md bg-gray-800/40 border border-gray-700/30 transition-all duration-300">
          <div className="relative aspect-[2/3] w-full overflow-hidden">
            {show.poster_path ? (
              <div className="relative w-full h-full">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.name}
                  fill
                  sizes="(max-width: 640px) 42vw, (max-width: 768px) 28vw, (max-width: 1024px) 23vw, 18vw"
                  className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                  loading={index < 3 ? "eager" : "lazy"}
                  priority={index < 3}
                  quality={90}
                />

                {/* Improved overlay with better positioning and scaling */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity delay-100 duration-300">
                    <div className="transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                      <h3 className="mb-1 text-xs font-bold tracking-wide text-white md:text-sm">
                        {show.name}
                      </h3>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {show.genre_ids?.slice(0, 2).map((genreId) => (
                          <span
                            key={genreId}
                            className="px-1.5 py-0.5 text-[10px] bg-gray-700/80 backdrop-blur-sm rounded-full text-gray-200"
                          >
                            {genreMap[genreId] || "Genre"}
                          </span>
                        ))}
                        <span className="px-1.5 py-0.5 text-[10px] bg-gray-700/80 backdrop-blur-sm rounded-full text-gray-200">
                          {show.first_air_date?.split("-")[0] || "N/A"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-300 line-clamp-3 md:line-clamp-4 font-medium">
                        {show.overview}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-800">
                <span className="text-gray-400">No Image</span>
              </div>
            )}

            {/* Rating badge - repositioned to bottom-left with improved styling */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 text-xs font-semibold tracking-wide rounded-lg bg-primary/80 text-white backdrop-blur-sm shadow-md shadow-black/20 z-10">
              {show.vote_average?.toFixed(1)} ★
            </div>
          </div>

          {/* Basic info shown by default - more compact */}
          <div className="p-2 md:p-3">
            <h3 className="text-xs font-semibold tracking-wide text-gray-200 truncate md:text-sm lg:text-base">
              {show.name}
            </h3>
            <div className="flex items-center justify-between mt-0.5 md:mt-1">
              <span className="text-[10px] md:text-xs text-gray-400">
                {show.first_air_date?.split("-")[0] || "N/A"}
              </span>
              <span className="text-[10px] md:text-xs text-gray-400">
                {show.episode_run_time && show.episode_run_time.length > 0 
                  ? `${show.episode_run_time[0]} min` 
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// Custom pagination component
const CustomPagination = ({ slideCount, currentSlide, totalItems }) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium">
      {currentSlide + 1}/{totalItems > 0 ? totalItems : 20}
    </div>
  );
};

// Enhanced skeleton loader with shimmer effect to match new card design
const SkeletonLoader = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8">
    {[...Array(8)].map((_, index) => (
      <div key={index} className="px-1.5 md:px-2 lg:px-3">
        <div className="overflow-hidden rounded-lg bg-gray-800/50 shadow-lg shadow-black/20 relative border border-gray-700/30">
          {/* Poster placeholder with aspect ratio matching the actual posters */}
          <div
            className="relative w-full aspect-[2/3] bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 animate-shimmer"
            style={{ backgroundSize: "200% 100%" }}
          >
            {/* Rating badge skeleton */}
            <div className="absolute bottom-2 left-2 w-12 h-5 rounded-lg bg-gray-700/80 animate-pulse"></div>
          </div>
          
          {/* Card content skeleton */}
          <div className="p-2 md:p-3">
            {/* Title skeleton */}
            <div
              className="w-full h-4 mb-2 rounded bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 animate-shimmer"
              style={{
                backgroundSize: "200% 100%",
                animationDelay: `${index * 0.1}s`,
              }}
            ></div>
            
            {/* Release date skeleton */}
            <div
              className="w-1/3 h-3 rounded bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 animate-shimmer"
              style={{
                backgroundSize: "200% 100%",
                animationDelay: `${index * 0.15}s`,
              }}
            ></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const TrendingShowsSlider = () => {
  const [trendingShows, setTrendingShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const TMDBKEY = process.env.NEXT_PUBLIC_TMDB_KEY;
    const fetchTrendingShows = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDBKEY}`
        );
        setTrendingShows(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending shows:', error);
        setLoading(false);
      }
    };

    fetchTrendingShows();
  }, []);

  // Responsive settings for different screen sizes
  const responsiveSettings = [
    {
      breakpoint: 1536, // 2xl breakpoint
      settings: {
        slidesToShow: 7,
      },
    },
    {
      breakpoint: 1280, // xl breakpoint
      settings: {
        slidesToShow: 6,
      },
    },
    {
      breakpoint: 1024, // lg breakpoint
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 768, // md breakpoint
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 640, // sm breakpoint
      settings: {
        slidesToShow: 2,
        centerMode: false,
      },
    },
    {
      breakpoint: 480, // mobile
      settings: {
        slidesToShow: 2,
        centerMode: false,
      },
    },
  ];

  const sliderSettings = {
    infinite: true,
    slidesToShow: 8, // Show 8 cards on the largest screens
    slidesToScroll: 1,
    responsive: responsiveSettings,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    dots: true,
    dotsClass: "slick-dots custom-dots",
    autoplay: false,
    speed: 500,
    cssEase: "cubic-bezier(0.23, 1, 0.32, 1)",
    lazyLoad: "ondemand",
    afterChange: (current) => setCurrentSlide(current),
    appendDots: (dots) => (
      <div>
        <ul className="flex items-center justify-center gap-2 mt-4">
          {" "}
          {dots}{" "}
        </ul>
        <CustomPagination
          slideCount={Math.ceil(trendingShows.length / 8)}
          currentSlide={currentSlide}
          totalItems={trendingShows.length}
        />
      </div>
    ),
    customPaging: (i) => (
      <button className="w-2.5 h-2.5 rounded-full bg-gray-600 hover:bg-primary transition-all duration-300 focus:outline-none">
        <span className="sr-only">Go to slide {i + 1}</span>
      </button>
    ),
  };

  return (
    <div className="relative py-8 overflow-hidden">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-4 2xl:px-2 max-w-[1850px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Trending TV Shows
          </h2>
          <Link
            href="/shows"
            className="px-4 py-1.5 text-sm font-medium text-white transition-all duration-300 rounded-full bg-primary hover:bg-primary/80"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <Slider {...sliderSettings}>
            {trendingShows.map((show, index) => (
              <ShowCard key={show.id} show={show} index={index} />
            ))}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default TrendingShowsSlider;
