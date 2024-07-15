import Link from 'next/link';
import React from 'react';

const Watchlists = () => {
    return (
        <div className='h-[calc(100vh-68px)] p-4 md:p-10 w-full flex items-center justify-center bg-base-200'>
            <div className="flex flex-col w-full space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <Link href='/watchlist/movies' className="grid flex-grow h-20 card bg-base-300 rounded-box place-items-center">
                    Movies Watchlist
                </Link>
                <div className="divider md:divider-horizontal">OR</div>
                <Link href='/watchlist/shows' className="grid flex-grow h-20 card bg-base-300 rounded-box place-items-center">
                    Tv Shows Watchlist
                </Link>
                <div className="divider md:divider-horizontal">OR</div>
                <Link href='/watchlist/animes' className="grid flex-grow h-20 card bg-base-300 rounded-box place-items-center">
                    Anime Watchlist
                </Link>
            </div>
        </div>
    );
}

export default Watchlists;
