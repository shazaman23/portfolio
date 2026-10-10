import { useRef } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { useExperienceListLoader } from '../experienceList';
import { SiteFooter } from './SiteFooter';
import { SiteNav } from './SiteNav';

export function Layout() {
  const experienceList = useExperienceListLoader();
  const main = useRef<HTMLElement>(null);

  return (
    <>
      {/* Scrolls to the top on a new page, back to where you were on Back,
          and to the element named by a #hash (the "/#my-work" links). */}
      <ScrollRestoration />
      <a
        href="#content"
        onClick={(event) => {
          // Not a real #content navigation: browsers add a history entry
          // for it, which ScrollRestoration reads as Back and answers by
          // restoring an old scroll position (Safari, Firefox).
          event.preventDefault();
          main.current?.scrollIntoView();
          main.current?.focus({ preventScroll: true });
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-brand-navy"
      >
        Skip to content
      </a>
      <SiteNav />
      {/* At least a screen tall, so the footer always starts below the fold:
          a page that's still loading can't push it down in view (CLS). */}
      <main
        ref={main}
        id="content"
        tabIndex={-1}
        className="min-h-svh outline-none"
      >
        <Outlet context={experienceList} />
      </main>
      <SiteFooter />
    </>
  );
}
