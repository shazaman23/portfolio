import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Experience } from '../api';
import { expectHeadingsInOrder, experience } from '../test/fixtures';
import { MyWork } from './MyWork';

const experiences = [
  experience({
    id: '1',
    brand: 'UK2',
    title: 'Dropdown Cart',
    myPart: 'Developed',
    screenshot: 'a.webp',
  }),
  experience({
    id: '5',
    brand: 'Benegov',
    title: 'Website',
    myPart: 'Designed & Developed',
    screenshot: 'b.webp',
  }),
];

function renderMyWork(list: Experience[] | null, loadFailed = false) {
  return render(
    <MemoryRouter>
      <MyWork experiences={list} loadFailed={loadFailed} />
    </MemoryRouter>,
  );
}

describe('MyWork', () => {
  it('is the My Work section, the target of the #my-work links', () => {
    const { container } = renderMyWork(experiences);

    expect(
      screen.getByRole('heading', { level: 2, name: 'My Work' }),
    ).toBeInTheDocument();
    expect(container.querySelector('section#my-work')).toBeInTheDocument();
  });

  it('shows one card per project, linking to its page', () => {
    renderMyWork(experiences);

    const card = screen.getByRole('link', {
      name: /UK2\s+Dropdown Cart\s+Developed/,
    });
    expect(card).toHaveAttribute('href', '/experience/1');
    expect(
      within(card).getByRole('heading', { level: 3, name: 'Dropdown Cart' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Benegov\s+Website\s+Designed & Developed/,
      }),
    ).toHaveAttribute('href', '/experience/5');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expectHeadingsInOrder();
  });

  it("shows each card's desktop screenshot, loaded lazily", () => {
    const { container } = renderMyWork(experiences);

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute(
      'src',
      '/assets/img/screenshots/desktop/a.webp',
    );
    expect(images[0]).toHaveAttribute('loading', 'lazy');
    // The card's link already names the project.
    expect(images[0]).toHaveAttribute('alt', '');
  });

  it('holds the space with three placeholder cards while loading', () => {
    const { container } = renderMyWork(null);

    expect(screen.queryAllByRole('link')).toHaveLength(0);
    const placeholders = container.querySelectorAll('li[aria-hidden="true"]');
    expect(placeholders).toHaveLength(3);
  });

  it('shows no cards and no placeholders for an empty list', () => {
    const { container } = renderMyWork([]);

    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('says so when the projects could not be loaded', () => {
    renderMyWork(null, true);

    expect(
      screen.getByText(
        "The projects couldn't be loaded. Please refresh the page to try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
