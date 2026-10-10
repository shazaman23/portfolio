import { useEffect, useEffectEvent, useState } from 'react';

const VISIBLE_MS = 5_000;
// The opacity transition's duration-1000 below.
const FADE_MS = 1_000;

interface Props {
  message: string;
  // Called once the alert has faded out, so the parent can remove it.
  onDone: () => void;
}

// A toast in the top-left corner, below the nav, faded out after 5 seconds as
// on the Laravel site. Render it with a new key to show another message.
export function FlashAlert({ message, onDone }: Props) {
  const [hiding, setHiding] = useState(false);
  const done = useEffectEvent(onDone);

  useEffect(() => {
    const hide = window.setTimeout(() => setHiding(true), VISIBLE_MS);
    const remove = window.setTimeout(() => done(), VISIBLE_MS + FADE_MS);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(remove);
    };
  }, []);

  return (
    <div
      role="status"
      data-hiding={hiding || undefined}
      className="fixed top-20 left-4 z-50 rounded-lg border border-green-200 bg-green-50 px-6 py-4 font-semibold text-green-900 shadow-lg data-hiding:opacity-0 motion-safe:transition-opacity motion-safe:duration-1000"
    >
      <p>{message}</p>
    </div>
  );
}
