"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MdKeyboardBackspace } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { BiSortAlt2 } from "react-icons/bi";
import { RiUserSearchLine } from "react-icons/ri";

const CastPage = ({ params: { id: movieId } }) => {
    const [cast, setCast] = useState([]);
    const [movieTitle, setMovieTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');

    useEffect(() => {
        const fetchMovieData = async () => {
            setIsLoading(true);
            try {
                const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
                const [castResponse, movieResponse] = await Promise.all([
                    fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`),
                    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`)
                ]);

                const [castData, movieData] = await Promise.all([
                    castResponse.json(),
                    movieResponse.json()
                ]);

                setCast(castData.cast);
                setMovieTitle(movieData.title);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovieData();
    }, [movieId]);

    const filteredAndSortedCast = useMemo(() => {
        let result = [...cast];
        
        // Filter by search query
        if (searchQuery) {
            result = result.filter(actor => 
                actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                actor.character.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort based on selected option
        switch (sortBy) {
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'character':
                result.sort((a, b) => a.character.localeCompare(b.character));
                break;
            case 'popularity':
                result.sort((a, b) => b.popularity - a.popularity);
                break;
            default:
                break;
        }

        return result;
    }, [cast, searchQuery, sortBy]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
                <div className="container px-4 py-8 mx-auto">
                    <div className="animate-pulse space-y-8">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-base-200 rounded-lg"></div>
                            <div className="h-8 w-48 bg-base-200 rounded-lg"></div>
                        </div>
                        <div className="h-12 w-full max-w-md bg-base-200 rounded-lg"></div>
                        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="flex flex-col space-y-4 p-4 bg-base-200/50 rounded-xl backdrop-blur-sm">
                                    <div className="w-full aspect-square bg-base-300 rounded-xl animate-pulse"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-3/4 bg-base-300 rounded"></div>
                                        <div className="h-3 w-2/3 bg-base-300 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-base-200/80 backdrop-blur-lg border-b border-base-content/10 shadow-lg">
                <div className="container px-4 py-4 mx-auto">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        {/* Back Button and Title */}
                        <Link href={`/movies/${movieId}`}>
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center space-x-4 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors duration-300"
                            >
                                <MdKeyboardBackspace className="text-2xl text-primary" />
                                <span className="text-primary font-medium">{movieTitle}</span>
                            </motion.div>
                        </Link>

                        {/* Search and Sort Controls */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50" />
                                <input
                                    type="text"
                                    placeholder="Search cast..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-64 rounded-xl bg-base-100/50 border border-base-content/10 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 shadow-sm hover:bg-base-100/70"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-base-100/50 border border-base-content/10 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 shadow-sm hover:bg-base-100/70 cursor-pointer text-base-content"
                                    style={{
                                        backgroundColor: 'hsl(var(--b1) / 0.5)',
                                    }}
                                >
                                    <option value="default" className="bg-base-100 text-base-content">Default Order</option>
                                    <option value="name" className="bg-base-100 text-base-content">Sort by Name</option>
                                    <option value="character" className="bg-base-100 text-base-content">Sort by Character</option>
                                    <option value="popularity" className="bg-base-100 text-base-content">Sort by Popularity</option>
                                </select>
                                <BiSortAlt2 className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container px-4 py-8 mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    >
                        {filteredAndSortedCast.map((actor, index) => (
                            <Link 
                                href={`/movies/${movieId}/cast/${actor.id}`}
                                key={actor.id}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative flex flex-col rounded-2xl bg-base-100/30 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden"
                                >
                                    {/* Image Container */}
                                    <div className="relative w-full aspect-[3/4] overflow-hidden">
                                        <img
                                            src={actor.profile_path 
                                                ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` 
                                                : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
                                            }
                                            alt={actor.name}
                                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        {/* Popularity Badge */}
                                        {actor.popularity && (
                                            <div className="absolute top-3 right-3 px-2.5 py-1.5 text-xs font-medium bg-black/30 text-white rounded-lg backdrop-blur-md border border-white/10 shadow-xl">
                                                <span className="text-yellow-300">★</span> {actor.popularity.toFixed(1)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Container */}
                                    <div className="relative p-4 bg-gradient-to-b from-base-100/50 to-base-100/80 backdrop-blur-sm">
                                        {/* Name */}
                                        <h3 className="text-base font-semibold text-base-content group-hover:text-primary transition-colors duration-300 line-clamp-1">
                                            {actor.name}
                                        </h3>
                                        
                                        {/* Character */}
                                        <p className="text-sm text-base-content/70 line-clamp-1 mt-1 group-hover:text-base-content/90 transition-colors duration-300">
                                            {actor.character}
                                        </p>

                                        {/* Hover Indicator */}
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                    </div>

                                    {/* View Profile Button - Appears on Hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="px-4 py-2 bg-primary/90 text-primary-content rounded-full text-sm font-medium backdrop-blur-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            View Profile
                                        </span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>

                    {filteredAndSortedCast.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <RiUserSearchLine className="text-8xl text-primary/30 mb-6" />
                            <h3 className="text-2xl font-semibold text-base-content mb-2">No Cast Members Found</h3>
                            <p className="text-base-content/70 mb-6">Try adjusting your search criteria</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSortBy('default'); }}
                                className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors duration-300"
                            >
                                View All Cast
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CastPage;
