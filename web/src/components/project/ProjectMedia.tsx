import type { Experience } from '../../api';
import { desktopScreenshot } from '../../paths';
import { BrowserFrame } from './BrowserFrame';

// The project's main visual. Today every project has a desktop screenshot;
// other formats plug in here (a photo, a diagram, or nothing), for work that
// is private or has nothing to screenshot.
export function ProjectMedia({ experience }: { experience: Experience }) {
  return (
    <BrowserFrame>
      {/* width and height let the browser reserve the space (no CLS). */}
      <img
        src={desktopScreenshot(experience.screenshot)}
        alt={`${experience.title} on a desktop browser`}
        width={1232}
        height={796}
        className="block h-auto w-full bg-gray-200"
      />
    </BrowserFrame>
  );
}
