import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom doesn't do layout, so it lacks the scrolling that React Router's
// ScrollRestoration calls.
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
