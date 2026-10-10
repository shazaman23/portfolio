import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import {
  expectHeadingsInOrder,
  experience,
  jsonResponse,
  stubFetch,
} from './test/fixtures';

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

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Jake Killpack' }),
    ).toBeInTheDocument();
    for (const name of ['About Me', 'My Work', 'Contact Me']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(
      await screen.findByRole('link', { name: /UK2\s+Dropdown Cart/ }),
    ).toHaveAttribute('href', '/experience/1');
    expect(
      screen.getByRole('link', { name: /Benegov\s+Site/ }),
    ).toHaveAttribute('href', '/experience/5');
    expect(fetch).toHaveBeenCalledWith('/api/experiences', expect.anything());
    expectHeadingsInOrder();
  });

  it('says so when the experiences could not be loaded', async () => {
    stubFetch(() => jsonResponse(503, {}));
    renderAt('/');

    expect(
      await screen.findByText(/projects couldn't be loaded/i),
    ).toBeInTheDocument();
  });

  it('keeps its headings in order when the projects fail to load', async () => {
    stubFetch(() => jsonResponse(503, {}));
    renderAt('/');

    await screen.findByText(/projects couldn't be loaded/i);
    expectHeadingsInOrder();
  });
});

describe('experience page', () => {
  it('shows the project: header, screenshots, story, and a link to the site', async () => {
    const fetch = stubFetch(() => jsonResponse(200, uk2));
    renderAt('/experience/1');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'UK2 – Dropdown Cart',
      }),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/experiences/1', expect.anything());
    expect(screen.getByText('Developed')).toBeInTheDocument();

    for (const [heading, text] of [
      ['The problem', 'Carts were hard to reach.'],
      ['What I did', 'A dropdown cart.'],
      ['Try it', 'Hover the cart icon.'],
    ]) {
      const section = screen
        .getByRole('heading', { level: 2, name: heading })
        .closest('section')!;
      expect(section).toHaveTextContent(text);
    }

    expect(screen.getByRole('link', { name: 'Visit uk2.net' })).toHaveAttribute(
      'href',
      'https://www.uk2.net/',
    );
    expect(
      screen.getByRole('img', { name: 'Dropdown Cart on a desktop browser' }),
    ).toHaveAttribute(
      'src',
      '/assets/img/screenshots/desktop/uk2-dropdown.webp',
    );
    expect(
      screen.getByRole('img', { name: 'Dropdown Cart on a phone' }),
    ).toHaveAttribute(
      'src',
      '/assets/img/screenshots/mobile/uk2-dropdown.webp',
    );
    expectHeadingsInOrder();
  });

  it('says a retired site is no longer running instead of linking to it', async () => {
    stubFetch(() => jsonResponse(200, benegov));
    renderAt('/experience/5');

    expect(
      await screen.findByText('(site no longer running)'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Visit / })).toBeNull();
  });

  it('leaves out the phone for a project with no mobile view', async () => {
    stubFetch(() => jsonResponse(200, { ...uk2, noMobile: true }));
    renderAt('/experience/1');

    expect(
      await screen.findByRole('img', {
        name: 'Dropdown Cart on a desktop browser',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /on a phone/ })).toBeNull();
    expect(screen.queryByText(/not available for mobile/)).toBeNull();
  });

  it('shows "Try it" only when there is demo text', async () => {
    stubFetch(() => jsonResponse(200, { ...uk2, demoText: null }));
    renderAt('/experience/1');

    expect(
      await screen.findByRole('heading', { name: 'What I did' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Try it' })).toBeNull();
  });

  it('handles a project with nothing optional: no demo, no site, no phone', async () => {
    stubFetch(() =>
      jsonResponse(200, {
        ...benegov,
        demoText: null,
        url: null,
        noMobile: true,
      }),
    );
    renderAt('/experience/5');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Benegov – Site' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent),
    ).toEqual(['The problem', 'What I did']);
    expect(screen.getByText('(site no longer running)')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expectHeadingsInOrder();
  });

  it('links back to My Work on the home page', async () => {
    stubFetch(() => jsonResponse(200, uk2));
    renderAt('/experience/1');

    expect(
      await screen.findByRole('link', { name: 'Back to My Work' }),
    ).toHaveAttribute('href', '/#my-work');
  });

  it('shows only an empty header band until the project loads', async () => {
    // Anything shown earlier would move when the content arrives. The band
    // keeps its final height, and main is a screen tall, so the footer
    // stays below the fold (CLS).
    // By URL: Layout asks for the project list too.
    const waiting = new Map<string, (response: Response) => void>();
    stubFetch(
      (url) => new Promise<Response>((resolve) => waiting.set(url, resolve)),
    );
    renderAt('/experience/1');

    const main = screen.getByRole('main');
    expect(main).toHaveTextContent('');
    expect(within(main).queryAllByRole('heading')).toHaveLength(0);
    expect(within(main).queryAllByRole('link')).toHaveLength(0);

    waiting.get('/api/experiences/1')!(jsonResponse(200, uk2));
    expect(
      await screen.findByRole('link', { name: 'Back to My Work' }),
    ).toBeInTheDocument();
  });

  it('is a 404 for an unknown experience', async () => {
    stubFetch(() => jsonResponse(404, { message: 'Not Found' }));
    renderAt('/experience/9');

    expect(await screen.findByText('404 | Not Found')).toBeInTheDocument();
  });

  it('says so when the experience could not be loaded, with the Back link', async () => {
    stubFetch(() => jsonResponse(503, {}));
    renderAt('/experience/1');

    expect(
      await screen.findByText(
        "Sorry, this project couldn't be loaded. Please refresh the page to try again.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to My Work' }),
    ).toBeInTheDocument();
    expectHeadingsInOrder();
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

describe('every page', () => {
  const pages = [
    { path: '/', api: () => jsonResponse(200, [uk2]) },
    { path: '/experience/1', api: () => jsonResponse(200, uk2) },
    { path: '/nope', api: () => jsonResponse(200, []) },
  ];

  it.each(pages)(
    '$path has a skip link to the main content',
    ({ path, api }) => {
      stubFetch(api);
      renderAt(path);

      expect(
        screen.getByRole('link', { name: 'Skip to content' }),
      ).toHaveAttribute('href', '#content');
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'content');
      // Focusable from the skip link, but not a Tab stop.
      expect(main).toHaveAttribute('tabindex', '-1');
    },
  );

  it.each(pages)(
    '$path has the nav to each home-page section',
    ({ path, api }) => {
      stubFetch(api);
      renderAt(path);

      const nav = screen.getByRole('navigation', { name: 'Main' });
      expect(
        within(nav).getByRole('link', { name: 'Jake Killpack' }),
      ).toHaveAttribute('href', '/');
      expect(within(nav).getByRole('link', { name: 'Work' })).toHaveAttribute(
        'href',
        '/#my-work',
      );
      expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute(
        'href',
        '/#about-me',
      );
      expect(
        within(nav).getByRole('link', { name: 'Contact' }),
      ).toHaveAttribute('href', '/#contact-me');
    },
  );

  it.each(pages)(
    '$path has the footer links and no icon credits',
    ({ path, api }) => {
      stubFetch(api);
      renderAt(path);

      const footer = screen.getByRole('contentinfo');
      expect(
        within(footer).getByRole('link', { name: 'GitHub' }),
      ).toHaveAttribute('href', 'https://github.com/shazaman23');
      expect(
        within(footer).getByRole('link', { name: 'LinkedIn' }),
      ).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/jacob-killpack-overview/',
      );
      expect(
        within(footer).getByRole('link', { name: 'contact@jakekillpack.com' }),
      ).toHaveAttribute('href', 'mailto:contact@jakekillpack.com');
      expect(screen.queryByText('Icon Attributions')).toBeNull();
    },
  );
});

describe('the 404 page', () => {
  it('is headed by an h1 and links home', () => {
    renderAt('/nope');

    expect(
      screen.getByRole('heading', { level: 1, name: '404 | Not Found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Go to the home page' }),
    ).toHaveAttribute('href', '/');
    expectHeadingsInOrder();
  });
});

describe('going home from a project page', () => {
  it('shows the cards on the first render, so #hash links land in place', async () => {
    // Cards that arrive after the hash scroll push About Me and Contact Me
    // down, and Safari doesn't keep the scroll position anchored.
    const waiting: ((response: Response) => void)[] = [];
    const fetch = stubFetch((url) =>
      url === '/api/experiences'
        ? new Promise<Response>((resolve) => waiting.push(resolve))
        : jsonResponse(200, uk2),
    );
    const user = userEvent.setup();
    renderAt('/experience/1');
    await screen.findByRole('heading', {
      level: 1,
      name: 'UK2 – Dropdown Cart',
    });

    // Answer the list requests made so far; any made later stay pending.
    await act(async () => {
      for (const respond of waiting.splice(0)) {
        respond(jsonResponse(200, [uk2, benegov]));
      }
    });
    await user.click(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole(
        'link',
        { name: 'Contact' },
      ),
    );

    expect(
      screen.getByRole('link', { name: /UK2\s+Dropdown Cart/ }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(0);
    expect(
      fetch.mock.calls.filter(([url]) => url === '/api/experiences'),
    ).toHaveLength(1);
  });
});
