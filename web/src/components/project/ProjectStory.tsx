import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import type { ReactNode } from 'react';
import type { Experience } from '../../api';
import { mobileScreenshot } from '../../paths';
import { visitLabel } from '../../visitLabel';
import { Icon } from '../Icon';
import { PhoneFrame } from './PhoneFrame';

// The project's text, a link to the live site, and the phone screenshot
// beside them (below on phones). Each part shows only when the project has
// it.
export function ProjectStory({ experience }: { experience: Experience }) {
  const phone = !experience.noMobile;
  return (
    <div
      className={`mt-12 ${phone ? 'md:grid md:grid-cols-[1fr_16rem] md:gap-12' : ''}`}
    >
      <div className="max-w-prose space-y-8 text-lg">
        <Section title="The problem">{experience.problem}</Section>
        <Section title="What I did">{experience.description}</Section>
        {experience.demoText && (
          <Section title="Try it">{experience.demoText}</Section>
        )}
        {experience.url ? (
          <a
            href={experience.url}
            className="inline-block rounded-full bg-brand-navy px-6 py-3 font-bold text-white hover:bg-brand-navy/85"
          >
            {visitLabel(experience.url)}{' '}
            <Icon icon={faArrowRight} className="ml-1" />
          </a>
        ) : (
          <p className="text-gray-600">(site no longer running)</p>
        )}
      </div>
      {phone && (
        <div className="mx-auto mt-12 w-64 md:mt-0">
          <PhoneFrame>
            <img
              src={mobileScreenshot(experience.screenshot)}
              alt={`${experience.title} on a phone`}
              width={474}
              height={807}
              className="block h-auto w-full"
            />
          </PhoneFrame>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-brand-navy">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
