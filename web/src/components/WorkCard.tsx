import { Link } from 'react-router';
import type { Experience } from '../api';
import { desktopScreenshot } from '../paths';

export function WorkCard({ experience }: { experience: Experience }) {
  return (
    <Link
      to={`/experience/${experience.id}`}
      className="block h-full overflow-hidden rounded-xl bg-white text-ink shadow-md hover:shadow-xl focus-visible:outline-white motion-safe:transition motion-safe:hover:-translate-y-1"
    >
      {/* A fixed shape, so the cards don't move as screenshots arrive. */}
      <img
        src={desktopScreenshot(experience.screenshot)}
        alt=""
        loading="lazy"
        className="aspect-[3/2] w-full bg-gray-200 object-cover object-top"
      />
      <div className="p-4">
        <p className="text-xs font-bold tracking-wider text-label uppercase">
          {experience.brand}
        </p>
        <h3 className="mt-1 text-lg font-bold">{experience.title}</h3>
        <p className="mt-1 text-sm text-gray-600">{experience.myPart}</p>
      </div>
    </Link>
  );
}
