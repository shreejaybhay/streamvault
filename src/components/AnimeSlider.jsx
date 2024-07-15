"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";

const AnimeSlider = () => {
  const [trendingAnime, setTrendingAnime] = useState([]);
  const router = useRouter();
  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
  const ANIME_GENRE_ID = 16; // Animation genre ID

  useEffect(() => {
    const fetchTrendingAnime = async () => {
      try {
        // Example of fetching data from TMDB (Note: TMDB primarily has movies and TV shows, not dedicated anime data)
        const response = await axios.get(
          `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${ANIME_GENRE_ID}`,
          {
            params: {
              api_key: "YOUR_API_KEY",
            },
          }
        );

        if (response.data.results) {
          setTrendingAnime(response.data.results);
        }
      } catch (error) {
        console.error("Error fetching trending anime:", error);
      }
    };

    fetchTrendingAnime();
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

  const handleAnimeClick = (animeId) => {
    router.push(`/animes/${animeId}`);
  };

  return (
    <div className="mx-10 my-10">
      <h2 className="mb-4 text-2xl font-bold">Trending Anime</h2>
      <Slider {...sliderSettings}>
        {trendingAnime.map((anime) => (
          <div
            key={anime.id}
            className="cursor-pointer"
            onClick={() => handleAnimeClick(anime.id)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${anime.poster_path}`}
              alt={anime.name}
              className="w-48 h-auto mx-auto rounded-md"
            />
            <p className="mt-2 text-sm text-center text-gray-400">
              {anime.name}
            </p>
            <p className="text-center text-gray-400">
              Rating: {anime.vote_average}/10
            </p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default AnimeSlider;
