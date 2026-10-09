import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Experience } from '../api';
import { experience } from '../test/fixtures';
import { MyWork } from './MyWork';

const experiences = [
  experience({
    id: '1',
    brand: 'UK2',
    title: 'Dropdown Cart',
    myPart: 'Developed',
    screenshot: 'a.webp',
  }),
  experience({ id: '2', title: 'Two', screenshot: 'b.webp' }),
  experience({ id: '3', title: 'Three', screenshot: 'c.webp' }),
];

function renderMyWork(list: Experience[] = experiences, loadFailed = false) {
  const { container } = render(
    <MemoryRouter>
      <MyWork experiences={list} loadFailed={loadFailed} />
    </MemoryRouter>,
  );
  return {
    frame: container.querySelector<HTMLElement>('.computer-demo')!,
    screen: container.querySelector<HTMLElement>('.screen-demo')!,
  };
}

const showing = (el: HTMLElement) => el.style.backgroundImage;
const desktop = (name: string) =>
  expect.stringContaining(`/assets/img/screenshots/desktop/${name}`);

function setWindowWidth(width: number) {
  window.innerWidth = width;
  fireEvent(window, new Event('resize'));
}

describe('MyWork', () => {
  beforeEach(() => {
    window.innerWidth = 1280;
  });

  it('links each experience to its page', () => {
    renderMyWork();

    expect(
      // The <br> between the title and the role adds no space in jsdom.
      screen.getByRole('link', { name: /^UK2 - Dropdown Cart\s*Developed$/ }),
    ).toHaveAttribute('href', '/experience/1');
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('shows a blank screen until the experiences load', () => {
    const { screen: monitor } = renderMyWork([]);

    expect(showing(monitor)).toBe('');
  });

  it('says so when the experiences could not be loaded', () => {
    renderMyWork([], true);

    expect(
      screen.getByText(/projects couldn't be loaded/i),
    ).toBeInTheDocument();
  });

  describe('screenshot rotation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    const advance = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms);
      });

    it('starts on the first screenshot and moves on every 5 seconds', () => {
      const { screen: monitor } = renderMyWork();
      expect(showing(monitor)).toEqual(desktop('a.webp'));

      advance(4999);
      expect(showing(monitor)).toEqual(desktop('a.webp'));
      advance(1);
      expect(showing(monitor)).toEqual(desktop('b.webp'));
      advance(5000);
      expect(showing(monitor)).toEqual(desktop('c.webp'));
      advance(5000);
      expect(showing(monitor)).toEqual(desktop('a.webp'));
    });

    it('shows a hovered experience and pauses for 10 seconds', () => {
      const { screen: monitor } = renderMyWork();

      fireEvent.mouseEnter(screen.getByText(/Three/));
      expect(showing(monitor)).toEqual(desktop('c.webp'));

      // As on the Laravel site: rotation restarts 10 seconds after the hover,
      // so the next change comes 5 seconds after that.
      advance(14999);
      expect(showing(monitor)).toEqual(desktop('c.webp'));
      advance(1);
      expect(showing(monitor)).toEqual(desktop('b.webp'));
      advance(5000);
      expect(showing(monitor)).toEqual(desktop('c.webp'));
    });

    it('restarts the pause on each hover', () => {
      const { screen: monitor } = renderMyWork();

      fireEvent.mouseEnter(screen.getByText(/Three/));
      advance(9000);
      fireEvent.mouseEnter(screen.getByText(/Dropdown Cart/));
      expect(showing(monitor)).toEqual(desktop('a.webp'));

      // Without the restart, the first hover's pause would end here and the
      // rotation would move on to b 6 seconds after the second hover.
      advance(14999);
      expect(showing(monitor)).toEqual(desktop('a.webp'));
      advance(1);
      expect(showing(monitor)).toEqual(desktop('b.webp'));
    });
  });

  describe('monitor size', () => {
    it('is full size on a wide window', () => {
      const { frame, screen: monitor } = renderMyWork();

      expect(monitor.style.width).toBe('632px');
      expect(monitor.style.height).toBe('422px');
      expect(frame.style.marginBottom).toBe('0px');
    });

    it('follows the window as it resizes', () => {
      const { frame, screen: monitor } = renderMyWork();

      act(() => setWindowWidth(375));

      expect(parseFloat(monitor.style.width)).toBeCloseTo(375 / 1.4, 3);
      expect(parseFloat(monitor.style.height)).toBeCloseTo(375 / 1.4 / 1.46, 3);
      expect(frame.style.marginBottom).toBe('-393px');
    });
  });
});
