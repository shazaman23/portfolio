import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlashAlert } from './FlashAlert';

describe('FlashAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the message, fades after 5 seconds, then goes away', () => {
    const onDone = vi.fn();
    render(<FlashAlert message="Sent!" onDone={onDone} />);

    const alert = screen.getByRole('status');
    expect(alert).toHaveTextContent('Sent!');
    expect(alert).not.toHaveAttribute('data-hiding');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(alert).toHaveAttribute('data-hiding');
    expect(onDone).not.toHaveBeenCalled();

    // After the 1-second fade, so the invisible alert can't cover links.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onDone).toHaveBeenCalledOnce();
  });
});
