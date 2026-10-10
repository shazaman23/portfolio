import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '../links';
import { Icon } from './Icon';

const links = [
  { href: GITHUB_URL, icon: faGithub, label: 'GitHub' },
  { href: LINKEDIN_URL, icon: faLinkedin, label: 'LinkedIn' },
  { href: `mailto:${EMAIL}`, icon: faEnvelope, label: EMAIL },
];

export function SiteFooter() {
  return (
    <footer className="bg-brand-navy text-on-navy">
      <ul className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-center sm:gap-12">
        {links.map(({ href, icon, label }) => (
          <li key={label}>
            <a
              href={href}
              className="underline underline-offset-4 hover:text-brand-blue focus-visible:outline-brand-blue"
            >
              <Icon icon={icon} className="mr-2" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
