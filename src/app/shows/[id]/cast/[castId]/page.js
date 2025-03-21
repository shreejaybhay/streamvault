"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdKeyboardBackspace, MdExpandMore } from 'react-icons/md';
import { FaImdb, FaWikipediaW, FaAward, FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const SkeletonLoader = () => (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back button skeleton */}
            <div className="h-8 w-24 bg-base-300 rounded-full mb-8 animate-pulse"></div>

            {/* Main content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column - Profile section */}
                <div className="md:col-span-1">
                    <div className="h-96 bg-base-300 rounded-xl animate-pulse"></div>
                </div>

                {/* Right column - Info section */}
                <div className="md:col-span-2">
                    <div className="space-y-4">
                        <div className="h-12 w-3/4 bg-base-300 rounded-lg animate-pulse"></div>
                        <div className="h-8 w-1/2 bg-base-300 rounded-lg animate-pulse"></div>
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-4 bg-base-300 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CastDetailsPage = ({ params }) => {
    const router = useRouter();
    const [actor, setActor] = useState(null);
    const [wikiData, setWikiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortCriteria, setSortCriteria] = useState('rating');
    const showId = params.id;
    const actorId = params.castId;

    const calculateAge = (birthday, deathday = null) => {
        const birthDate = new Date(birthday);
        const endDate = deathday ? new Date(deathday) : new Date();
        const age = Math.floor((endDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        return age;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
                const tmdbResponse = await fetch(
                    `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}&append_to_response=tv_credits,images,external_ids`
                );
                const tmdbData = await tmdbResponse.json();
                setActor(tmdbData);

                if (tmdbData.name) {
                    const wikiResponse = await fetch(
                        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(tmdbData.name)}`
                    );
                    const wikiData = await wikiResponse.json();
                    setWikiData(wikiData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load actor details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [actorId]);

    const renderTVCredits = () => {
        if (!actor?.tv_credits?.cast) return null;

        const sortShows = () => {
            const shows = [...actor.tv_credits.cast];
            return shows.sort((a, b) => {
                if (sortCriteria === 'rating') return b.vote_average - a.vote_average;
                return new Date(b.first_air_date) - new Date(a.first_air_date);
            }).slice(0, 10);
        };

        const sortedShows = sortShows();
        const defaultShowPoster = "https://i.postimg.cc/mZwHxM8Y/default-poster.jpg";

        return (
            <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-8 border border-base-content/10 mt-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Notable TV Roles</h2>
                    <select
                        value={sortCriteria}
                        onChange={(e) => setSortCriteria(e.target.value)}
                        className="select select-sm select-bordered"
                    >
                        <option value="rating">Sort by Rating</option>
                        <option value="date">Sort by Date</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedShows.map((show) => (
                        <Link
                            key={show.id}
                            href={`/shows/${show.id}`}
                            className="block transition-transform duration-300 hover:scale-[1.02]"
                        >
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="flex items-center gap-4 p-4 bg-base-300/50 rounded-lg hover:bg-base-300 transition-colors group"
                            >
                                <div className="relative w-12 h-18 min-w-[48px] overflow-hidden rounded">
                                    <Image
                                        src={show.poster_path
                                            ? `https://image.tmdb.org/t/p/w92${show.poster_path}`
                                            : defaultShowPoster
                                        }
                                        alt={show.name}
                                        width={48}
                                        height={72}
                                        className="object-cover rounded group-hover:shadow-lg transition-shadow"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultShowPoster;
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                                        {show.name}
                                    </h3>
                                    <p className="text-sm text-base-content/70 truncate">
                                        {show.character}
                                        {show.first_air_date && ` (${new Date(show.first_air_date).getFullYear()})`}
                                    </p>
                                    {show.vote_average > 0 && (
                                        <div className="flex items-center gap-1 text-yellow-400 text-sm mt-1">
                                            <span>★</span>
                                            <span>{show.vote_average.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    const renderSocialLinks = () => {
        if (!actor?.external_ids) return null;

        const socialLinks = [
            {
                id: 'imdb',
                url: actor.external_ids.imdb_id ? `https://www.imdb.com/name/${actor.external_ids.imdb_id}` : null,
                icon: <FaImdb className="text-xl" />,
                color: 'bg-[#f3ce13] text-black',
                label: 'Visit IMDb Profile'
            },
            {
                id: 'instagram',
                url: actor.external_ids.instagram_id ? `https://instagram.com/${actor.external_ids.instagram_id}` : null,
                icon: <FaInstagram className="text-xl" />,
                color: 'bg-[#E4405F] text-white',
                label: 'Visit Instagram Profile'
            },
            {
                id: 'twitter',
                url: actor.external_ids.twitter_id ? `https://twitter.com/${actor.external_ids.twitter_id}` : null,
                icon: <FaTwitter className="text-xl" />,
                color: 'bg-[#1DA1F2] text-white',
                label: 'Visit Twitter Profile'
            },
            {
                id: 'facebook',
                url: actor.external_ids.facebook_id ? `https://facebook.com/${actor.external_ids.facebook_id}` : null,
                icon: <FaFacebook className="text-xl" />,
                color: 'bg-[#4267B2] text-white',
                label: 'Visit Facebook Profile'
            },
            {
                id: 'wikipedia',
                url: wikiData?.content_urls?.desktop?.page || null,
                icon: <FaWikipediaW className="text-xl" />,
                color: 'bg-base-100 text-base-content',
                label: 'Visit Wikipedia Page'
            }
        ];

        return (
            <div className="flex flex-wrap justify-center gap-3">
                {socialLinks.map(link => link.url && (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.label}
                        className={`p-3 rounded-full hover:scale-110 transition-transform duration-300 ${link.color}`}
                    >
                        {link.icon}
                    </a>
                ))}
            </div>
        );
    };

    const renderCareerHighlights = () => {
        if (!actor.tv_credits?.cast) return null;

        const totalShows = actor.tv_credits.cast.length;
        const averageRating = actor.tv_credits.cast.reduce((acc, show) => acc + show.vote_average, 0) / totalShows;
        const mostRecentShow = [...actor.tv_credits.cast].sort((a, b) =>
            new Date(b.first_air_date) - new Date(a.first_air_date)
        )[0];
        const highestRatedShow = [...actor.tv_credits.cast].sort((a, b) => b.vote_average - a.vote_average)[0];

        const stats = [
            {
                label: "Career Span",
                value: `${new Date(actor.tv_credits.cast[actor.tv_credits.cast.length - 1].first_air_date).getFullYear()} - Present`
            },
            {
                label: "Total TV Shows",
                value: totalShows
            },
            {
                label: "Average Rating",
                value: `★ ${averageRating.toFixed(1)}`
            },
            {
                label: "Latest Project",
                value: mostRecentShow.name,
                subtext: new Date(mostRecentShow.first_air_date).getFullYear()
            },
            {
                label: "Highest Rated",
                value: highestRatedShow.name,
                subtext: `★ ${highestRatedShow.vote_average.toFixed(1)}`
            }
        ];

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-base-300/50 p-4 rounded-lg">
                        <span className="text-sm text-base-content/70">{stat.label}</span>
                        <div className="font-semibold text-base-content">
                            {stat.value}
                            {stat.subtext && (
                                <span className="block text-sm text-base-content/70">{stat.subtext}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderPersonalInfo = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {actor.birthday && (
                <div className="bg-base-300/50 p-4 rounded-lg">
                    <span className="font-semibold block text-sm text-base-content/70">Age & Birthday</span>
                    <span className="text-base-content">
                        {calculateAge(actor.birthday)} years old
                        <span className="block text-sm">
                            Born {new Date(actor.birthday).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </span>
                </div>
            )}
            {actor.place_of_birth && (
                <div className="bg-base-300/50 p-4 rounded-lg">
                    <span className="font-semibold block text-sm text-base-content/70">Birthplace</span>
                    <span className="text-base-content">{actor.place_of_birth}</span>
                </div>
            )}
            {actor.gender && (
                <div className="bg-base-300/50 p-4 rounded-lg">
                    <span className="font-semibold block text-sm text-base-content/70">Gender</span>
                    <span className="text-base-content">
                        {actor.gender === 1 ? 'Female' : actor.gender === 2 ? 'Male' : 'Non-Binary'}
                    </span>
                </div>
            )}
            {actor.known_for_department && (
                <div className="bg-base-300/50 p-4 rounded-lg">
                    <span className="font-semibold block text-sm text-base-content/70">Department</span>
                    <span className="text-base-content">{actor.known_for_department}</span>
                </div>
            )}
        </div>
    );

    if (loading) return <SkeletonLoader />;
    if (error) return <div className="text-center text-error p-4">{error}</div>;
    if (!actor) return <div className="text-center text-error p-4">Actor not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 pt-4 mb-6">
            <div className="max-w-7xl mx-auto px-4">
                <motion.button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-8"
                    whileHover={{ x: -5 }}
                >
                    <MdKeyboardBackspace className="text-2xl" />
                    <span>Back</span>
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-4 lg:sticky lg:top-20 lg:self-start space-y-6">
                        {/* Main Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="rounded-xl overflow-hidden shadow-2xl border-2 border-primary/10"
                        >
                            <Image
                                src={actor.profile_path
                                    ? `https://image.tmdb.org/t/p/original${actor.profile_path}`
                                    : defaultShowPoster}
                                alt={actor.name}
                                width={500}
                                height={750}
                                className="w-full h-auto"
                                priority
                            />
                        </motion.div>

                        {/* Social Links */}
                        <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-6 border border-base-content/10">
                            <h3 className="text-lg font-semibold mb-4 text-center">Connect</h3>
                            {renderSocialLinks()}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Main Info Card */}
                            <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-8 border border-base-content/10">
                                <h1 className="text-4xl font-bold text-base-content mb-2">{actor.name}</h1>
                                {wikiData?.description && (
                                    <div className="text-primary/80 text-lg mb-4">{wikiData.description}</div>
                                )}

                                {/* Biography */}
                                <div className="prose prose-lg max-w-none mt-6">
                                    {wikiData?.extract_html ? (
                                        <div
                                            className="text-base-content/80 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: wikiData.extract_html }}
                                        />
                                    ) : actor.biography ? (
                                        <p className="text-base-content/80 leading-relaxed">{actor.biography}</p>
                                    ) : (
                                        <p className="text-base-content/60 italic">Biography not available.</p>
                                    )}
                                </div>

                                {/* Personal Info */}
                                {renderPersonalInfo()}
                            </div>

                            {/* Career Highlights */}
                            <div className="bg-base-200/50 backdrop-blur-sm rounded-xl p-8 border border-base-content/10">
                                <h2 className="text-2xl font-bold mb-4">Career Highlights</h2>
                                {renderCareerHighlights()}
                            </div>

                            {/* Notable TV Shows */}
                            {renderTVCredits()}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastDetailsPage;
