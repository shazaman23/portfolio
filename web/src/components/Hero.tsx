import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router';
import { GITHUB_URL, LINKEDIN_URL } from '../links';
import { ChevronArt } from './ChevronArt';
import { Icon } from './Icon';

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-brand-blue text-brand-navy"
    >
      <ChevronArt className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto opacity-70 md:block" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h1 id="hero-title" className="text-5xl font-bold sm:text-7xl">
          Jake Killpack
        </h1>
        <p className="mt-2 text-xl sm:text-2xl">Software Engineer</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/#my-work"
            className="rounded-full bg-brand-navy px-6 py-3 font-bold text-white hover:bg-brand-navy/85"
          >
            See my work
          </Link>
          <Link
            to="/#contact-me"
            className="rounded-full bg-white px-6 py-3 font-bold text-brand-navy hover:bg-white/85"
          >
            Get in touch
          </Link>
        </div>
        <ul className="mt-6 flex gap-6 font-semibold">
          <li>
            <a href={GITHUB_URL} className="underline underline-offset-4">
              <Icon icon={faGithub} className="mr-2" />
              GitHub
            </a>
          </li>
          <li>
            <a href={LINKEDIN_URL} className="underline underline-offset-4">
              <Icon icon={faLinkedin} className="mr-2" />
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
