"use client";
import { CiBookmarkPlus } from "react-icons/ci";
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

export default function Slider() {
  const [movies, setMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    const TMDBKEY = process.env.NEXT_PUBLIC_TMDB_KEY; // Access environment variable
    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDBKEY}&page=1`
        );
        if (!response.data.results) {
          throw new Error("Failed to fetch movies");
        }
        setMovies(response.data.results.slice(0, 6)); // Limit to 6 movies
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide % 6) + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full lg:h-[calc(100vh-68px)] h-[500px] overflow-hidden">
      <div className="relative w-full h-full carousel">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            id={`slide${index + 1}`}
            className={`relative w-full h-full carousel-item ${
              index + 1 === currentSlide ? "" : "hidden"
            }`}
          >
            <div className="absolute top-0 left-0 z-10 w-full h-full opacity-75 bg-gradient-to-r from-black to-transparent"></div>
            <Image
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              layout="fill"
              objectFit="cover"
              className="object-cover"
            />
            <div className="absolute z-20 bg-transparent card w-[40%] xl:bottom-20 left-20 bottom-0">
              <div className="card-body">
                <h2 className="text-3xl text-slate-300 card-title">
                  {movie.title}
                </h2>
                <p className="font-medium text-slate-300 line-clamp-3">
                  {movie.overview}
                </p>
                <div className="justify-start card-actions">
                  <button className="btn btn-primary">Watch Now</button>
                  <button className="btn">
                    <CiBookmarkPlus size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
