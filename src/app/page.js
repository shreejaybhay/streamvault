import AnimeSlider from "@/components/AnimeSlider";
import TrendingMoviesSlider from "@/components/MoviesSlider";
import TrendingMoviesCarousel from "@/components/MoviesSlider";
import ShowsSlider from "@/components/ShowsSlider";
import Slider from "@/components/Slider";

export default function Home() {
  return (
    <div className="w-full h-auto">
      <Slider />
      <TrendingMoviesCarousel />
      <ShowsSlider />
      <AnimeSlider />
    </div>
  );
}
