import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getExperience, type Experience } from '../api';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '../components/Icon';
import { Footer } from '../components/Footer';
import { experienceCredits } from '../credits';
import { mobileScreenshot } from '../paths';
import { NotFoundPage } from './NotFoundPage';

type Lookup =
  | { status: 'loading' }
  | { status: 'found'; experience: Experience }
  | { status: 'missing' }
  | { status: 'failed' };

// Replaces the Laravel site's /experience/{id}.
export function ExperiencePage() {
  const { id = '' } = useParams();
  const lookup = useExperience(id);

  if (lookup.status === 'missing') {
    return <NotFoundPage />;
  }
  // Only an empty showcase while loading. Anything shown earlier would move
  // when the content arrives (the footer gets pushed down, and the Back link
  // sits at a percentage of the page's height): a large layout shift. The
  // empty title keeps the top margin the real title gives the showcase on
  // phones (it collapses through), so the showcase doesn't drop either.
  if (lookup.status === 'loading') {
    return (
      <div className="content showcase container-fluid position-relative">
        <h2 className="main-title" aria-hidden="true"></h2>
      </div>
    );
  }

  return (
    <>
      <div className="content showcase container-fluid position-relative">
        <div className="position-absolute back-btn">
          <Link className="text-uppercase" to="/#my-work">
            <Icon icon={faArrowLeft} /> Back
          </Link>
        </div>

        {lookup.status === 'found' && (
          <Details experience={lookup.experience} />
        )}
        {lookup.status === 'failed' && (
          <div className="features">
            <p>
              Sorry, this project couldn't be loaded. Please refresh the page to
              try again.
            </p>
          </div>
        )}
      </div>

      <Footer className="footer" columns={experienceCredits} />
    </>
  );
}

function Details({ experience }: { experience: Experience }) {
  return (
    <>
      <h2 className="main-title font-weight-bold text-center">
        {experience.brand} - {experience.title}
      </h2>

      <div className="display cellphone">
        {experience.noMobile ? (
          <div className="screen-demo no-mobile">
            This feature is not available for mobile devices.
          </div>
        ) : (
          <div
            className="screen-demo"
            style={{
              backgroundImage: `url(${mobileScreenshot(experience.screenshot)})`,
            }}
          ></div>
        )}
      </div>

      <div>
        <div className="features">
          <p>{experience.problem}</p>
          <p>{experience.description}</p>
          <p>
            {experience.demoText}{' '}
            {experience.url ? (
              <a href={experience.url}>Check it out!!</a>
            ) : (
              '(site no longer running)'
            )}
          </p>
        </div>
      </div>
    </>
  );
}

function useExperience(id: string): Lookup {
  // Tagged with the id it's for, so a stale result never shows for another.
  const [result, setResult] = useState<{ id: string; lookup: Lookup }>();

  useEffect(() => {
    const controller = new AbortController();
    void getExperience(id, controller.signal).then(
      (experience) =>
        setResult({
          id,
          lookup: experience
            ? { status: 'found', experience }
            : { status: 'missing' },
        }),
      () => {
        if (!controller.signal.aborted) {
          setResult({ id, lookup: { status: 'failed' } });
        }
      },
    );
    return () => controller.abort();
  }, [id]);

  return result?.id === id ? result.lookup : { status: 'loading' };
}
