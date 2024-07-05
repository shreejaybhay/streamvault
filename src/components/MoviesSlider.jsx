"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import Link from "next/link"; // Assuming you are using Next.js
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TrendingMoviesSlider = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);

  useEffect(() => {
    const TMDBKEY = process.env.NEXT_PUBLIC_TMDB_KEY;
    const fetchTrendingMovies = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDBKEY}`
        );
        setTrendingMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
      }
    };

    fetchTrendingMovies();
  }, []);

  // Responsive settings for different screen sizes
  const responsiveSettings = [
    {
      breakpoint: 1600,
      settings: {
        slidesToShow: 6,
      },
    },
    {
      breakpoint: 1200,
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
      breakpoint: 576,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 0,
      settings: {
        slidesToShow: 1,
      },
    },
  ];

  const sliderSettings = {
    infinite: true,
    slidesToShow: 8, // Default number of slides for xl screens
    slidesToScroll: 1,
    responsive: responsiveSettings, // Add responsive settings
  };

  return (
    <div className="mx-10 mt-10">
      <h2 className="mb-4 text-2xl font-bold">Trending Movies</h2>
      <Slider {...sliderSettings}>
        {trendingMovies.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`}>
            <div className="cursor-pointer">
              <img
                src={`https://image.tmdb.org/t/p/w300${
                  movie.poster_path || "/movie.jpg"
                }`}
                alt={movie.title}
                className="w-48 h-auto mx-auto rounded-md"
              />
              <p className="mt-2 text-sm text-center text-gray-400">
                {movie.title}
              </p>
              <p className="text-center text-gray-400">
                Rating: {movie.vote_average}
              </p>
            </div>
          </Link>
        ))}
      </Slider>
    </div>
  );
};

export default TrendingMoviesSlider;

