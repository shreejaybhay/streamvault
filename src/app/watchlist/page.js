"use client";
import Link from 'next/link';
import React from 'react';
import { FaFilm, FaTv, FaVideo } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Watchlists = () => {
    const watchlistItems = [
        {
            href: '/watchlist/movies',
            title: 'Movies Watchlist',
            icon: <FaFilm className="w-7 h-7" />,
            description: 'Track and organize your movie watchlist. Never miss a film you want to watch.',
            gradient: 'from-blue-500 to-cyan-400',
            delay: 0.1
        },
        {
            href: '/watchlist/shows',
            title: 'TV Shows Watchlist',
            icon: <FaTv className="w-7 h-7" />,
            description: 'Keep up with your favorite TV series and discover new shows to watch.',
            gradient: 'from-purple-500 to-pink-400',
            delay: 0.2
        },
        {
            href: '/watchlist/animes',
            title: 'Anime Watchlist',
            icon: <FaVideo className="w-7 h-7" />,
            description: 'Manage your anime collection and track series progress all in one place.',
            gradient: 'from-orange-500 to-red-400',
            delay: 0.3
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className='min-h-[calc(100vh-68px)] w-full bg-gradient-to-br from-base-300/50 to-base-100'>
            <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        My Watchlists
                    </h1>
                    <p className="mt-4 text-base-content/70 text-lg">
                        Organize and track your entertainment journey
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto"
                >
                    {watchlistItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: item.delay }}
                            whileHover={{ scale: 1.02 }}
                            className="group h-full"
                        >
                            <Link href={item.href} className="h-full block">
                                <div className="h-full relative overflow-hidden rounded-2xl bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                                    <div className="p-8 flex flex-col h-full">
                                        <div className="flex flex-col items-center text-center h-full">
                                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                                                <div className="text-white">
                                                    {item.icon}
                                                </div>
                                            </div>
                                            <h2 className="text-2xl font-bold mt-6 mb-4">{item.title}</h2>
                                            <p className="text-base-content/70 flex-grow mb-6">{item.description}</p>
                                            
                                            <div className="w-full mt-auto">
                                                <div className="inline-flex items-center justify-center w-full py-2.5 text-sm font-medium transition-colors rounded-full bg-base-200 text-base-content/70 group-hover:bg-primary/10 group-hover:text-primary">
                                                    View List
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-16 max-w-3xl mx-auto"
                >
                    <div className="backdrop-blur-xl bg-base-100/30 p-8 rounded-2xl shadow-lg border border-base-content/5">
                        <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            Pro Tips
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-base-100/50 backdrop-blur-sm">
                                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                </div>
                                <p className="text-base-content/80">
                                    Add content to your watchlist while browsing
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-base-100/50 backdrop-blur-sm">
                                <div className="flex-shrink-0 p-2 rounded-lg bg-secondary/10">
                                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                </div>
                                <p className="text-base-content/80">
                                    Track your watching progress easily
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Watchlists;
