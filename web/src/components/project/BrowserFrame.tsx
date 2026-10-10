import type { ReactNode } from 'react';

// A browser window drawn in CSS around a desktop screenshot.
export function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 shadow-xl">
      <div
        aria-hidden="true"
        className="flex items-center gap-1.5 bg-gray-200 px-3 py-2"
      >
        <span className="size-3 rounded-full bg-gray-400" />
        <span className="size-3 rounded-full bg-gray-400" />
        <span className="size-3 rounded-full bg-gray-400" />
        <span className="ml-3 h-4 flex-1 rounded bg-white" />
      </div>
      {children}
    </div>
  );
}
