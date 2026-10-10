import { AboutMe } from '../components/AboutMe';
import { ContactMe } from '../components/ContactMe';
import { Hero } from '../components/Hero';
import { MyWork } from '../components/MyWork';
import { useExperienceList } from '../experienceList';

export function HomePage() {
  // Loaded by Layout; until it arrives, My Work shows placeholder cards.
  const { experiences, loadFailed } = useExperienceList();

  return (
    <>
      <Hero />
      <MyWork experiences={experiences} loadFailed={loadFailed} />
      <AboutMe />
      <ContactMe />
    </>
  );
}
