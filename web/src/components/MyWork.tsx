import { useMemo } from 'react';
import { Link } from 'react-router';
import type { Experience } from '../api';
import { monitorSize, useWindowWidth } from '../monitor';
import { desktopScreenshot } from '../paths';
import { useScreenRotation } from '../screenRotation';

interface Props {
  experiences: Experience[];
  loadFailed: boolean;
}

export function MyWork({ experiences, loadFailed }: Props) {
  const size = monitorSize(useWindowWidth());
  const screenshots = useMemo(
    () => experiences.map((e) => e.screenshot),
    [experiences],
  );
  const { current, select } = useScreenRotation(screenshots);

  return (
    <div id="my-work" className="row my-work">
      <div className="d-flex flex-column w-100">
        <h2 className="main-title font-weight-bold text-center">My Work</h2>

        <div
          className="computer-demo"
          style={{ marginBottom: `${size.marginBottom}px` }}
        >
          {/* Sizing and the cover fit come from _custom-images.scss; only
              the image and the size change here. */}
          <div
            className="screen-demo"
            style={{
              backgroundImage: current
                ? `url(${desktopScreenshot(current)})`
                : undefined,
              width: `${size.width}px`,
              height: `${size.height}px`,
            }}
          ></div>
        </div>

        <div className="menu d-flex flex-row flex-wrap text-center">
          {experiences.map((experience) => (
            <div key={experience.id} className="menu-slot flex-1 text-center">
              <Link to={`/experience/${experience.id}`}>
                <div
                  className="menu-option mx-auto"
                  onMouseEnter={() => select(experience.screenshot)}
                  onFocus={() => select(experience.screenshot)}
                >
                  {experience.brand} - {experience.title}
                  <br />
                  <small className="text-uppercase">{experience.myPart}</small>
                </div>
              </Link>
            </div>
          ))}
          {loadFailed && (
            <p className="flex-1">
              The projects couldn't be loaded. Please refresh the page to try
              again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
