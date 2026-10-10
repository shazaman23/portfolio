import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';
import type { Experience } from '../../api';
import { ChevronArt } from '../ChevronArt';
import { Icon } from '../Icon';

interface Props {
  // null while loading, or when the project couldn't be loaded.
  experience: Experience | null;
  // An empty band at its final height, so nothing moves when the project
  // arrives.
  loading: boolean;
}

export function ProjectHeader({ experience, loading }: Props) {
  return (
    <header
      aria-hidden={loading || undefined}
      className="relative min-h-44 overflow-hidden bg-brand-blue text-brand-navy"
    >
      <ChevronArt className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto opacity-70 md:block" />
      {!loading && (
        <div className="relative mx-auto max-w-6xl px-4 py-8">
          <Link
            to="/#my-work"
            className="font-bold underline underline-offset-4"
          >
            <Icon icon={faArrowLeft} className="mr-2" />
            Back to My Work
          </Link>
          {experience && (
            <>
              <h1 className="mt-4 text-3xl font-bold sm:text-5xl">
                {experience.brand} – {experience.title}
              </h1>
              <p className="mt-2 text-sm font-bold tracking-wider uppercase">
                {experience.myPart}
              </p>
            </>
          )}
        </div>
      )}
    </header>
  );
}
