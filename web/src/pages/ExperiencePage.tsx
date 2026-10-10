import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getExperience, type Experience } from '../api';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { ProjectMedia } from '../components/project/ProjectMedia';
import { ProjectStory } from '../components/project/ProjectStory';
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

  return (
    <>
      <ProjectHeader
        experience={lookup.status === 'found' ? lookup.experience : null}
        loading={lookup.status === 'loading'}
      />
      {lookup.status === 'found' && (
        <div className="mx-auto max-w-6xl px-4 py-12">
          <ProjectMedia experience={lookup.experience} />
          <ProjectStory experience={lookup.experience} />
        </div>
      )}
      {lookup.status === 'failed' && (
        <p className="mx-auto max-w-6xl px-4 py-12 text-lg">
          Sorry, this project couldn't be loaded. Please refresh the page to try
          again.
        </p>
      )}
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
