import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import { experience, jsonResponse, stubFetch } from './test/fixtures';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

const uk2 = experience({
  id: '1',
  brand: 'UK2',
  title: 'Dropdown Cart',
  problem: 'Carts were hard to reach.',
  description: 'A dropdown cart.',
  demoText: 'Hover the cart icon.',
  url: 'https://www.uk2.net/',
  screenshot: 'uk2-dropdown.webp',
});
const benegov = experience({
  id: '5',
  brand: 'Benegov',
  title: 'Site',
  url: null,
  demoText: 'It was a site.',
  screenshot: 'benegov-site.webp',
});

describe('home page', () => {
  it('shows every section, with the experiences from the API', async () => {
    const fetch = stubFetch(() => jsonResponse(200, [uk2, benegov]));
    renderAt('/');

    expect(
      screen.getByRole('heading', { name: /Jake\s*Killpack/ }),
    ).toBeInTheDocument();
    for (const name of ['About Me', 'My Work', 'Contact Me']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(
      await screen.findByRole('link', { name: /UK2 - Dropdown Cart/ }),
    ).toHaveAttribute('href', '/experience/1');
    expect(
      screen.getByRole('link', { name: /Benegov - Site/ }),
    ).toHaveAttribute('href', '/experience/5');
    expect(fetch).toHaveBeenCalledWith('/api/experiences', expect.anything());
  });

  it('says so when the experiences could not be loaded', async () => {
    stubFetch(() => jsonResponse(503, {}));
    renderAt('/');

    expect(
      await screen.findByText(/projects couldn't be loaded/i),
    ).toBeInTheDocument();
  });

  it('credits the icons it uses', () => {
    stubFetch(() => jsonResponse(200, []));
    renderAt('/');

    expect(screen.getByText(/Books icon made by/)).toBeInTheDocument();
    expect(screen.getByText(/TV icon made by/)).toBeInTheDocument();
  });
});

describe('experience page', () => {
  it('shows the experience, its mobile screenshot, and a link to the site', async () => {
    const fetch = stubFetch(() => jsonResponse(200, uk2));
    const { container } = renderAt('/experience/1');

    expect(
      await screen.findByRole('heading', { name: 'UK2 - Dropdown Cart' }),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/experiences/1', expect.anything());
    expect(screen.getByText('Carts were hard to reach.')).toBeInTheDocument();
    expect(screen.getByText('A dropdown cart.')).toBeInTheDocument();
    const demo = screen.getByText(/Hover the cart icon\./);
    expect(
      within(demo).getByRole('link', { name: 'Check it out!!' }),
    ).toHaveAttribute('href', 'https://www.uk2.net/');
    expect(
      container.querySelector<HTMLElement>('.cellphone .screen-demo')!.style
        .backgroundImage,
    ).toContain('/assets/img/screenshots/mobile/uk2-dropdown.webp');
  });

  it('says a retired site is no longer running instead of linking to it', async () => {
    stubFetch(() => jsonResponse(200, benegov));
    renderAt('/experience/5');

    expect(
      await screen.findByText(/It was a site\.\s+\(site no longer running\)/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Check it out!!' })).toBeNull();
  });

  it('says when a feature has no mobile view', async () => {
    stubFetch(() => jsonResponse(200, { ...uk2, noMobile: true }));
    const { container } = renderAt('/experience/1');

    expect(
      await screen.findByText(
        'This feature is not available for mobile devices.',
      ),
    ).toHaveClass('screen-demo', 'no-mobile');
    expect(container.querySelectorAll('.screen-demo')).toHaveLength(1);
  });

  it('links back to My Work on the home page', async () => {
    stubFetch(() => jsonResponse(200, uk2));
    renderAt('/experience/1');

    expect(await screen.findByRole('link', { name: /Back/ })).toHaveAttribute(
      'href',
      '/#my-work',
    );
  });

  it('credits the icons it uses', async () => {
    stubFetch(() => jsonResponse(200, uk2));
    renderAt('/experience/1');

    expect(
      await screen.findByText(/Cellphone icon made by/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Books icon made by/)).toBeNull();
  });

  it('is a 404 for an unknown experience', async () => {
    stubFetch(() => jsonResponse(404, { message: 'Not Found' }));
    renderAt('/experience/9');

    expect(await screen.findByText('404 | Not Found')).toBeInTheDocument();
  });

  it('says so when the experience could not be loaded', async () => {
    stubFetch(() => jsonResponse(503, {}));
    renderAt('/experience/1');

    expect(await screen.findByText(/couldn't be loaded/i)).toBeInTheDocument();
  });
});

describe('unknown paths', () => {
  it('are a 404, kept out of search results', () => {
    renderAt('/nope');

    expect(screen.getByText('404 | Not Found')).toBeInTheDocument();
    // React hoists the tag into <head>.
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex',
    );
  });
});
