import type { Experience } from '../../api';
import { desktopScreenshot } from '../../paths';
import { BrowserFrame } from './BrowserFrame';

// The project's main visual. Today every project has a desktop screenshot;
// new formats (a photo, a diagram, nothing) plug in here. See "Project Pages
// Must Stay Flexible" in docs/action-plans/tailwind-restyle.md.
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
