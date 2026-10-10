// The chevrons from the old banner image (main-banner-bg-2.png), redrawn as
// white lines for the blue bands. Decorative.
export function ChevronArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="620 0 820 810"
      preserveAspectRatio="xMaxYMid slice"
      className={className}
    >
      <g fill="none" stroke="white" strokeWidth="6">
        <polyline points="1060,0 645,415 1040,810" />
        <polyline points="1140,0 725,415 1120,810" />
        <polyline points="1220,0 805,415 1200,810" />
      </g>
      <polygon
        points="1440,40 1075,408 1440,775"
        fill="white"
        fillOpacity="0.5"
      />
    </svg>
  );
}
