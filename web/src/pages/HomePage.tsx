import { useEffect, useState } from 'react';
import { getExperiences, type Experience } from '../api';
import { AboutMe } from '../components/AboutMe';
import { ContactMe } from '../components/ContactMe';
import { Hero } from '../components/Hero';
import { MyWork } from '../components/MyWork';

export function HomePage() {
  const { experiences, loadFailed } = useExperiences();

  return (
    <>
      <Hero />
      <MyWork experiences={experiences} loadFailed={loadFailed} />
      <AboutMe />
      <ContactMe />
    </>
  );
}

// The rest of the page doesn't wait for this: until it loads, My Work shows
// placeholder cards.
function useExperiences() {
  const [state, setState] = useState<{
    experiences: Experience[] | null;
    loadFailed: boolean;
  }>({ experiences: null, loadFailed: false });

  useEffect(() => {
    const controller = new AbortController();
    void getExperiences(controller.signal).then(
      (experiences) => setState({ experiences, loadFailed: false }),
      () => {
        if (!controller.signal.aborted) {
          setState({ experiences: null, loadFailed: true });
        }
      },
    );
    return () => controller.abort();
  }, []);

  return state;
}
