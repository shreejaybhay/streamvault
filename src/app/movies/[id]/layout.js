import { headers } from 'next/headers';

async function getMovie(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`,
      { next: { revalidate: 60 } }
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const movie = await getMovie(params.id);
  
  if (!movie) {
    return {
      title: 'Movie Not Found - StreamVault',
      description: 'The requested movie could not be found.',
    };
  }

  return {
    title: `${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'}) - StreamVault`,
    description: movie.overview || 'Watch this movie on StreamVault',
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function MovieLayout({ children }) {
  return <>{children}</>;
}