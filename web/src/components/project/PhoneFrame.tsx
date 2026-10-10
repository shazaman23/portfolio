import type { ReactNode } from 'react';

// A phone drawn in CSS around a mobile screenshot.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border-[10px] border-gray-900 bg-gray-900 shadow-xl">
      {children}
    </div>
  );
}
