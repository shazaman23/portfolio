import type { Experience } from '../api';
import { WorkCard } from './WorkCard';

interface Props {
  // null while loading.
  experiences: Experience[] | null;
  loadFailed: boolean;
}

// Shown while loading, so the cards don't push the page down when they
// arrive. About the height of a row of real cards.
const PLACEHOLDERS = 3;

export function MyWork({ experiences, loadFailed }: Props) {
  return (
    <section
      id="my-work"
      aria-labelledby="my-work-title"
      className="bg-brand-gray text-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2
          id="my-work-title"
          className="text-center text-4xl font-bold sm:text-5xl"
        >
          My Work
        </h2>
        {loadFailed ? (
          <p className="mt-8 text-center">
            The projects couldn't be loaded. Please refresh the page to try
            again.
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences === null
              ? Array.from({ length: PLACEHOLDERS }, (_, i) => (
                  // Keys apart from the projects' ids ("1", "2", ...), so
                  // React never reuses a placeholder as a card.
                  <li key={`placeholder-${i}`} aria-hidden="true">
                    <div className="h-full overflow-hidden rounded-xl bg-white/10">
                      <div className="aspect-[3/2] bg-white/10" />
                      <div className="h-24" />
                    </div>
                  </li>
                ))
              : experiences.map((experience) => (
                  <li key={experience.id}>
                    <WorkCard experience={experience} />
                  </li>
                ))}
          </ul>
        )}
      </div>
    </section>
  );
}
