async function getShow(id) {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`,
        { next: { revalidate: 60 } }
      );
      return response.json();
    } catch (error) {
      console.error('Error fetching show:', error);
      return null;
    }
  }
  
  export async function generateMetadata({ params }) {
    const show = await getShow(params.id);
  
    if (!show) {
      return {
        title: 'Show Not Found - StreamVault',
        description: 'The requested TV show could not be found.',
      };
    }
  
    const yearStart = show.first_air_date?.split('-')[0] || 'N/A';
    const yearEnd = show.status === 'Ended' ?
      (show.last_air_date?.split('-')[0] || 'N/A') : yearStart
    const yearString = yearStart === yearEnd ? yearStart : `${yearStart}-${yearEnd}`;
  
    return {
      title: `${show.name} (${yearString}) - StreamVault`,
      description: show.overview || 'Watch this TV show on StreamVault',
      openGraph: {
        title: `${show.name} (${yearString})`,
        description: show.overview,
        images: show.poster_path ?
          [`https://image.tmdb.org/t/p/w500${show.poster_path}`] :
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
  
  export default function ShowLayout({ children }) {
    return <>{children}</>;
  }