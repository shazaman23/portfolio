/*! Icons: Font Awesome Free 7 by @fontawesome, https://fontawesome.com,
    CC BY 4.0 (https://fontawesome.com/license/free). */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface Props {
  icon: IconDefinition;
  className?: string;
}

// A Font Awesome icon as inline SVG, sized to the text around it. Every icon
// on the site sits beside text that says the same thing, so it's decorative:
// hidden from screen readers and never focusable.
export function Icon({ icon, className }: Props) {
  const [width, height, , , pathData] = icon.icon;
  const paths = Array.isArray(pathData) ? pathData : [pathData];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      className={`inline-block h-[1em] w-auto fill-current align-[-0.125em] ${className ?? ''}`}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
