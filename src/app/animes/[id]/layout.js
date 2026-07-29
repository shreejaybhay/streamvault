async function getAnime(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`,
      { next: { revalidate: 60 } }
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching anime:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const anime = await getAnime(params.id);

  if (!anime) {
    return {
      title: 'Anime Not Found - StreamVault',
      description: 'The requested anime could not be found.',
    };
  }

  const yearStart = anime.first_air_date?.split('-')[0] || 'N/A';
  const yearEnd = anime.status === 'Ended' ?
    (anime.last_air_date?.split('-')[0] || 'N/A') : yearStart;
  const yearString = yearStart === yearEnd ? yearStart : `${yearStart}-${yearEnd}`;

  return {
    title: `${anime.name} (${yearString}) - StreamVault`,
    description: anime.overview || 'Watch this anime on StreamVault',
    openGraph: {
      title: `${anime.name} (${yearString})`,
      description: anime.overview,
      images: anime.poster_path ?
        [`https://image.tmdb.org/t/p/w500${anime.poster_path}`] :
        [],
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function AnimeLayout({ children }) {
  return <>{children}</>;
}