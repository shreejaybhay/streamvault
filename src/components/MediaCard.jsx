import React from "react";
import Link from "next/link";
import { FaStar, FaClock } from "react-icons/fa";
import { BiMovie } from "react-icons/bi";
import { BsTv } from "react-icons/bs";

const MediaCard = ({ item, type }) => {
  // Determine properties based on media type
  const title = type === "movie" ? item.title : item.name;
  const releaseDate = type === "movie" ? item.release_date : item.first_air_date;
  const releaseYear = releaseDate ? releaseDate.split("-")[0] : "TBA";
  
  // Check if the item is from the anime route
  const isAnime = window.location.pathname.startsWith('/animes');
  
  // Fix the URL construction to handle anime type correctly
  const detailUrl = isAnime 
    ? `/animes/${item.id}`
    : type === "tv" 
      ? `/shows/${item.id}` 
      : `/${type}s/${item.id}`;

  // Function to get badge text based on year
  const getBadge = (year) => {
    if (!year || year === "TBA") return null;

    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear();

    if (yearNum === currentYear) return "New";
    if (yearNum === currentYear - 1) return "Recent";
    if (yearNum >= 2015) return "2015+";
    if (yearNum >= 2000) return "2000s";
    if (yearNum >= 1990) return "90s";
    if (yearNum >= 1980) return "80s";
    if (yearNum >= 1970) return "70s";
    if (yearNum >= 1960) return "60s";
    if (yearNum >= 1950) return "50s";
    if (yearNum < 1950) return "Classic";
    return null;
  };

  // Get genre name if available
  const getGenreName = (genreId, genres) => {
    if (!genreId || !genres || genres.length === 0) return "";
    const genre = genres.find((g) => g.id === genreId);
    return genre ? genre.name : "";
  };

  // Add anime-specific information
  const episodes = type === "anime" ? item.number_of_episodes : null;
  const status = type === "anime" ? item.status : null;

  return (
    <Link
      href={detailUrl}
      className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out rounded-lg shadow-lg bg-base-100 hover:shadow-xl hover:scale-[1.02] group border border-base-300"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-base-300">
            <span className="text-base-content/50">No Image</span>
          </div>
        )}

        {/* Always present overlay that changes opacity on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          {/* Content container */}
          <div className="absolute inset-0 flex flex-col justify-end p-3">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1 text-xs">
                {item.runtime || item.episode_run_time ? (
                  <>
                    <FaClock />
                    <span>
                      {item.runtime || item.episode_run_time[0] || "?"} min
                    </span>
                  </>
                ) : (
                  <>
                    <BiMovie />
                    <span>
                      {type === "movie"
                        ? "Feature Film"
                        : type === "show"
                        ? "TV Series"
                        : "Anime"}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs line-clamp-2 text-white/80">
                {item.overview || "No description available"}
              </div>
            </div>
          </div>
        </div>

        {/* Rating badge */}
        {item.vote_average > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-md bg-primary/90 text-primary-content backdrop-blur-sm flex items-center gap-1 z-10">
            <FaStar className="text-yellow-300" />
            {item.vote_average?.toFixed(1) || "N/A"}
          </div>
        )}

        {/* Year badge */}
        {getBadge(releaseYear) && (
          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-md bg-accent/90 text-accent-content backdrop-blur-sm z-10">
            {getBadge(releaseYear)}
          </div>
        )}

        {/* Add anime-specific information to the overlay */}
        {type === "anime" && episodes && (
          <div className="absolute bottom-2 left-2 px-2 py-1 text-xs font-semibold rounded-md bg-secondary/90 text-secondary-content backdrop-blur-sm z-10">
            {episodes} Episodes
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 p-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-base-200/50 flex items-center justify-center">
          {type === "movie" ? (
            <BiMovie className="text-base-content/50" />
          ) : type === "show" ? (
            <BsTv className="text-base-content/50" />
          ) : (
            <BiMovie className="text-base-content/50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium leading-tight line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-base-content/70">{releaseYear}</span>
            {item.genre_ids && item.genre_ids[0] && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-base-200 text-base-content/70">
                {type === "movie"
                  ? // Movie genres
                    item.genre_ids[0] === 28
                    ? "Action"
                    : item.genre_ids[0] === 12
                    ? "Adventure"
                    : item.genre_ids[0] === 16
                    ? "Animation"
                    : item.genre_ids[0] === 35
                    ? "Comedy"
                    : item.genre_ids[0] === 80
                    ? "Crime"
                    : item.genre_ids[0] === 99
                    ? "Documentary"
                    : item.genre_ids[0] === 18
                    ? "Drama"
                    : item.genre_ids[0] === 10751
                    ? "Family"
                    : item.genre_ids[0] === 14
                    ? "Fantasy"
                    : item.genre_ids[0] === 36
                    ? "History"
                    : item.genre_ids[0] === 27
                    ? "Horror"
                    : item.genre_ids[0] === 10402
                    ? "Music"
                    : item.genre_ids[0] === 9648
                    ? "Mystery"
                    : item.genre_ids[0] === 10749
                    ? "Romance"
                    : item.genre_ids[0] === 878
                    ? "Science Fiction"
                    : item.genre_ids[0] === 10770
                    ? "TV Movie"
                    : item.genre_ids[0] === 53
                    ? "Thriller"
                    : item.genre_ids[0] === 10752
                    ? "War"
                    : item.genre_ids[0] === 37
                    ? "Western"
                    : "Other"
                  : // TV/Anime genres
                  item.genre_ids[0] === 10759
                  ? "Action & Adventure"
                  : item.genre_ids[0] === 16
                  ? "Animation"
                  : item.genre_ids[0] === 35
                  ? "Comedy"
                  : item.genre_ids[0] === 80
                  ? "Crime"
                  : item.genre_ids[0] === 99
                  ? "Documentary"
                  : item.genre_ids[0] === 18
                  ? "Drama"
                  : item.genre_ids[0] === 10751
                  ? "Family"
                  : item.genre_ids[0] === 10762
                  ? "Kids"
                  : item.genre_ids[0] === 9648
                  ? "Mystery"
                  : item.genre_ids[0] === 10763
                  ? "News"
                  : item.genre_ids[0] === 10764
                  ? "Reality"
                  : item.genre_ids[0] === 10765
                  ? "Sci-Fi & Fantasy"
                  : item.genre_ids[0] === 10766
                  ? "Soap"
                  : item.genre_ids[0] === 10767
                  ? "Talk"
                  : item.genre_ids[0] === 10768
                  ? "War & Politics"
                  : item.genre_ids[0] === 37
                  ? "Western"
                  : "Other"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MediaCard;
