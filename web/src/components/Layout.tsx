import { Outlet, ScrollRestoration } from 'react-router';

export function Layout() {
  return (
    <>
      {/* Scrolls to the top on a new page, back to where you were on Back,
          and to the element named by a #hash (the "/#my-work" back link). */}
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
