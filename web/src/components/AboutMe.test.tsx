import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectHeadingsInOrder } from '../test/fixtures';
import { AboutMe } from './AboutMe';

const labels = ['Family', 'Gaming', 'Learning', 'Movies', 'Adventure'];

const tile = (label: string) => screen.getByRole('button', { name: label });
// A tile's panel, or null while it's closed (hidden panels aren't in the
// accessibility tree). By name, since the section itself is a region too.
const panel = (label: string) => screen.queryByRole('region', { name: label });

describe('AboutMe', () => {
  it('is the About Me section, the target of the #about-me link', () => {
    const { container } = render(<AboutMe />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'About Me' }),
    ).toBeInTheDocument();
    expect(container.querySelector('section#about-me')).toBeInTheDocument();
    expectHeadingsInOrder();
  });

  it('shows five closed tiles, no panel, and no photos', () => {
    render(<AboutMe />);

    for (const label of labels) {
      expect(tile(label)).toHaveAttribute('aria-expanded', 'false');
    }
    for (const label of labels) {
      expect(panel(label)).toBeNull();
    }
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('opens a tile into a panel with its photo and paragraph', async () => {
    const user = userEvent.setup();
    render(<AboutMe />);

    await user.click(tile('Family'));

    expect(tile('Family')).toHaveAttribute('aria-expanded', 'true');
    const family = panel('Family')!;
    expect(tile('Family')).toHaveAttribute('aria-controls', family.id);
    expect(within(family).getByRole('img')).toHaveAttribute(
      'src',
      '/assets/img/about/family-cabin.webp',
    );
    expect(within(family).getByRole('img')).toHaveAttribute(
      'alt',
      'family picture',
    );
    expect(family).toHaveTextContent(/My family is probably the biggest/);
    // Only the opened tile's photo.
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('keeps one tile open at a time', async () => {
    const user = userEvent.setup();
    render(<AboutMe />);

    await user.click(tile('Family'));
    await user.click(tile('Movies'));

    expect(tile('Family')).toHaveAttribute('aria-expanded', 'false');
    expect(tile('Movies')).toHaveAttribute('aria-expanded', 'true');
    expect(panel('Family')).toBeNull();
    expect(within(panel('Movies')!).getByRole('img')).toHaveAttribute(
      'src',
      '/assets/img/about/popcorn.webp',
    );
  });

  it('closes an open tile when it is clicked again, keeping its photo', async () => {
    const user = userEvent.setup();
    const { container } = render(<AboutMe />);

    await user.click(tile('Gaming'));
    await user.click(tile('Gaming'));

    expect(tile('Gaming')).toHaveAttribute('aria-expanded', 'false');
    expect(panel('Gaming')).toBeNull();
    // Still in the DOM inside the hidden panel, so reopening doesn't fetch
    // it again.
    expect(
      container.querySelector(
        'img[src="/assets/img/about/betrayal-game-slim.webp"]',
      ),
    ).toBeInTheDocument();
  });

  it('opens and closes from the keyboard with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<AboutMe />);

    tile('Learning').focus();
    await user.keyboard('{Enter}');
    expect(tile('Learning')).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard(' ');
    expect(tile('Learning')).toHaveAttribute('aria-expanded', 'false');

    await user.tab();
    expect(tile('Movies')).toHaveFocus();
  });
});
