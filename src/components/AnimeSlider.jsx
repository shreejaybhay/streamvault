"use client"
import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useRouter } from 'next/navigation';

const AnimeSlider = () => {
  const [trendingAnime, setTrendingAnime] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingAnime = async () => {
      try {
        const response = await axios.get('https://api.jikan.moe/v4/top/anime');

        if (response.data.data) {
          setTrendingAnime(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching trending anime:', error);
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
    router.push(`/anime/${animeId}`);
  };

  return (
    <div className="mx-10 mt-10">
      <h2 className="mb-4 text-2xl font-bold">Trending Anime</h2>
      <Slider {...sliderSettings}>
        {trendingAnime.map(anime => (
          <div key={anime.mal_id} className="cursor-pointer" onClick={() => handleAnimeClick(anime.mal_id)}>
            <img
              src={anime.images.jpg.image_url || '/tv.jpg'}
              alt={anime.title}
              className="w-48 h-auto mx-auto rounded-md"
            />
            <p className="mt-2 text-sm text-center text-gray-400">
              {anime.title}
            </p>
            <p className="text-center text-gray-400">
              Rating: {anime.score}/10
            </p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default AnimeSlider;
