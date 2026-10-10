import { useEffect, useEffectEvent, useState } from 'react';

const VISIBLE_MS = 5_000;
// The .hide-alert opacity transition in _default.scss.
const FADE_MS = 1_000;

interface Props {
  message: string;
  // Called once the alert has faded out, so the parent can remove it.
  onDone: () => void;
}

// The fixed alert in the top-left corner, faded out after 5 seconds as on
// the Laravel site. Render it with a new key to show another message.
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
      className={
        hiding
          ? 'alert alert-success flash-alert hide-alert'
          : 'alert alert-success flash-alert'
      }
      role="status"
    >
      <p>{message}</p>
    </div>
  );
}
