import CinematicGallery from "../components/CinematicGallery.jsx";
import Hero from "../components/Hero.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import Stats from "../components/Stats.jsx";
import UploadSection from "../components/UploadSection.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <CinematicGallery />
      <Stats />
      <UploadSection />
      <HowItWorks />
    </>
  );
}
