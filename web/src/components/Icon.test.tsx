import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon';

describe('Icon', () => {
  it('draws the icon inline at its own proportions', () => {
    const { container } = render(<Icon icon={faHouse} />);

    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('viewBox', '0 0 512 512');
    expect(svg.querySelector('path')).toHaveAttribute(
      'd',
      faHouse.icon[4] as string,
    );
  });

  it('is hidden from screen readers and skipped by Tab', () => {
    const { container } = render(<Icon icon={faGithub} />);

    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('adds the classes it is given', () => {
    const { container } = render(<Icon icon={faHouse} className="text-3xl" />);

    expect(container.querySelector('svg')).toHaveClass('text-3xl');
  });
});
