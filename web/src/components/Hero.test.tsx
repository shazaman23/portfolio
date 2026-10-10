import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Hero } from './Hero';

function renderHero() {
  return render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>,
  );
}

describe('Hero', () => {
  it('names you and your role', () => {
    renderHero();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Jake Killpack' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('jumps to My Work and Contact Me', () => {
    renderHero();

    expect(screen.getByRole('link', { name: 'See my work' })).toHaveAttribute(
      'href',
      '/#my-work',
    );
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute(
      'href',
      '/#contact-me',
    );
  });

  it('links to GitHub and LinkedIn', () => {
    renderHero();

    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/shazaman23',
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/jacob-killpack-overview/',
    );
  });
});
