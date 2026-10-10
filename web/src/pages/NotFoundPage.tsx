import { Link } from 'react-router';

// CloudFront answers every page path with index.html, so a missing page is
// still a 200. The robots tag keeps these out of search results instead.
export function NotFoundPage() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-3 px-4 text-center">
      <meta name="robots" content="noindex" />
      <h1 className="text-3xl font-bold text-brand-navy">404 | Not Found</h1>
      <Link to="/" className="text-brand-navy underline underline-offset-4">
        Go to the home page
      </Link>
    </div>
  );
}
