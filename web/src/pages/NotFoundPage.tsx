import { Link } from 'react-router';

// CloudFront answers every page path with index.html, so a missing page is
// still a 200. The robots tag keeps these out of search results instead.
export function NotFoundPage() {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-muted"
      style={{ minHeight: '100vh' }}
    >
      <meta name="robots" content="noindex" />
      <p>404 | Not Found</p>
      <Link to="/">Go to the home page</Link>
    </div>
  );
}
