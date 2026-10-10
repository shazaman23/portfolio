import type { Credit } from '../credits';

interface Props {
  // "row footer" inside the home page's container; plain "footer" below
  // an experience.
  className: string;
  columns: Credit[][];
}

export function Footer({ className, columns }: Props) {
  return (
    <div className={className}>
      <div className="d-flex flex-column w-100">
        <h4 className="mx-auto">Icon Attributions</h4>

        <div className="d-flex icon-bib">
          {columns.map((column, index) => (
            <ul key={index} className="flex-1">
              {column.map((credit) => (
                <li key={credit.icon}>
                  {credit.icon} icon made by{' '}
                  <a href={credit.href}>{credit.author}</a> from{' '}
                  <a href="https://www.flaticon.com/">www.flaticon.com</a>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div className="d-flex contact-info w-100 text-center">
          <div className="flex-1">
            <a href="https://github.com/shazaman23">
              <i className="fi flaticon-github"></i> GitHub
            </a>
          </div>
          <div className="flex-1">
            <a href="https://www.linkedin.com/in/jacob-killpack-overview/">
              <i className="fi flaticon-linkedin"></i> Linkedin
            </a>
          </div>
          <div className="flex-1">
            <a href="mailto:contact@jakekillpack.com">
              <i className="fi flaticon-email"></i> contact@jakekillpack.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
