import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AboutMe } from './AboutMe';

const labels = ['Family', 'Gaming', 'Learning', 'Movies', 'Adventure'];

function strip(label: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: label });
  return heading.closest<HTMLElement>('.strip')!;
}

describe('AboutMe', () => {
  it('shows the five strips closed, with no photos requested', () => {
    render(<AboutMe />);

    for (const label of labels) {
      expect(strip(label)).not.toHaveClass('is-open');
    }
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('opens a strip and loads its photo from the media bucket', async () => {
    const user = userEvent.setup();
    render(<AboutMe />);

    await user.click(strip('Family'));

    expect(strip('Family')).toHaveClass('is-open');
    expect(within(strip('Family')).getByRole('img')).toHaveAttribute(
      'src',
      '/assets/img/about/family-cabin.webp',
    );
    // Only the opened strip's photo.
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('keeps one strip open at a time', async () => {
    const user = userEvent.setup();
    render(<AboutMe />);

    await user.click(strip('Family'));
    await user.click(strip('Movies'));

    expect(strip('Family')).not.toHaveClass('is-open');
    expect(strip('Movies')).toHaveClass('is-open');
    expect(within(strip('Movies')).getByRole('img')).toHaveAttribute(
      'src',
      '/assets/img/about/popcorn.webp',
    );
  });

  it('closes an open strip when it is clicked again, keeping its photo', async () => {
    const user = userEvent.setup();
    render(<AboutMe />);

    await user.click(strip('Gaming'));
    await user.click(strip('Gaming'));

    expect(strip('Gaming')).not.toHaveClass('is-open');
    // Still in the DOM (hidden by CSS), so reopening doesn't fetch it again.
    expect(within(strip('Gaming')).getByRole('img')).toHaveAttribute(
      'src',
      '/assets/img/about/betrayal-game-slim.webp',
    );
  });

  it('alternates the strip direction with hr separators between them', () => {
    const { container } = render(<AboutMe />);

    // _about-me.scss flips even strips with :nth-of-type, so the strips must
    // stay sibling divs, separated only by hr elements.
    const column = container.querySelector('.about-me > div')!;
    const tags = Array.from(column.children).map((el) => el.tagName);
    expect(tags).toEqual([
      'H2',
      'DIV',
      'HR',
      'DIV',
      'HR',
      'DIV',
      'HR',
      'DIV',
      'HR',
      'DIV',
    ]);
  });
});
