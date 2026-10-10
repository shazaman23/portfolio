import { Link } from 'react-router';

const sections = [
  { label: 'Work', hash: 'my-work' },
  { label: 'About', hash: 'about-me' },
  { label: 'Contact', hash: 'contact-me' },
];

// Pinned to the top of every page. The home page's sections are #hash
// targets; index.css's scroll-padding-top keeps their headings below this bar.
export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4"
      >
        <Link to="/" className="font-bold text-brand-navy">
          Jake Killpack
        </Link>
        <ul className="flex gap-5 sm:gap-8">
          {sections.map(({ label, hash }) => (
            <li key={hash}>
              <Link
                to={`/#${hash}`}
                className="font-semibold hover:text-brand-navy hover:underline"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
