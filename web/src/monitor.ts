import { useEffect, useState } from 'react';

export interface MonitorSize {
  // The screenshot area inside the computer frame, in CSS pixels.
  width: number;
  height: number;
  // Applied to the frame. Below 768 px the frame image shrinks but its box
  // doesn't, so a negative margin pulls the menu up under it.
  marginBottom: number;
}

// The My Work monitor's size for a window width. The breakpoints and ratios
// are the Laravel site's handleResize(), unchanged, so the screenshot keeps
// lining up with the frame image.
export function monitorSize(windowWidth: number): MonitorSize {
  if (windowWidth > 768) {
    return { width: 632, height: 422, marginBottom: 0 };
  }

  const [widthDivisor, heightDivisor] =
    windowWidth > 625
      ? [1.25, 1.48]
      : windowWidth > 545
        ? [1.28, 1.46]
        : windowWidth > 450
          ? [1.31, 1.46]
          : windowWidth > 400
            ? [1.36, 1.45]
            : windowWidth > 350
              ? [1.4, 1.46]
              : [1.46, 1.46];
  const width = windowWidth / widthDivisor;
  return {
    width,
    height: width / heightDivisor,
    marginBottom: windowWidth - 768,
  };
}

export function useWindowWidth(): number {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}
