import { useEffect, useState } from 'react';
import { getExperiences, type Experience } from '../api';
import { AboutMe } from '../components/AboutMe';
import { ContactMe } from '../components/ContactMe';
import { Footer } from '../components/Footer';
import { homeCredits } from '../credits';
import { MyWork } from '../components/MyWork';

export function HomePage() {
  const { experiences, loadFailed } = useExperiences();

  return (
    <div className="content container-fluid homepage">
      <div className="row home">
        <div className="home-banner">
          <div className="title">
            <h1 className="display-3 text-left">
              <strong>
                Jake <br />
                Killpack
              </strong>
            </h1>
            <h5 className="text-muted text-left">Software Engineer</h5>
          </div>
        </div>
      </div>

      <AboutMe />
      <MyWork experiences={experiences} loadFailed={loadFailed} />
      <ContactMe />
      <Footer className="row footer" columns={homeCredits} />
    </div>
  );
}

// The rest of the page doesn't wait for this: until it loads, the menu is
// empty and the monitor blank.
function useExperiences() {
  const [state, setState] = useState<{
    experiences: Experience[];
    loadFailed: boolean;
  }>({ experiences: [], loadFailed: false });

  useEffect(() => {
    const controller = new AbortController();
    void getExperiences(controller.signal).then(
      (experiences) => setState({ experiences, loadFailed: false }),
      () => {
        if (!controller.signal.aborted) {
          setState({ experiences: [], loadFailed: true });
        }
      },
    );
    return () => controller.abort();
  }, []);

  return state;
}
