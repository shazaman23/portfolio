import { useCallback, useEffect, useState } from 'react';

export const ROTATE_EVERY_MS = 5_000;
export const HOVER_PAUSE_MS = 10_000;

// Cycles through screenshots every 5 seconds. select() shows one right away
// and pauses the cycle; it restarts 10 seconds later, carrying on from where
// it was. Timings match the Laravel site's Vue instance.
export function useScreenRotation(screenshots: readonly string[]) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  // Bumped by each select(), which restarts the effect below with a pause.
  const [pauses, setPauses] = useState(0);
  const count = screenshots.length;

  useEffect(() => {
    if (count === 0) {
      return;
    }
    let interval: number | undefined;
    const start = () => {
      interval = window.setInterval(() => {
        setSelected(null);
        setIndex((i) => (i + 1) % count);
      }, ROTATE_EVERY_MS);
    };
    const pause =
      pauses > 0 ? window.setTimeout(start, HOVER_PAUSE_MS) : undefined;
    if (pause === undefined) {
      start();
    }
    return () => {
      window.clearTimeout(pause);
      window.clearInterval(interval);
    };
  }, [count, pauses]);

  const select = useCallback((screenshot: string) => {
    setSelected(screenshot);
    setPauses((n) => n + 1);
  }, []);

  const current = selected ?? (count > 0 ? screenshots[index % count] : null);
  return { current, select };
}
