import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
          <SearchX size={28} />
        </div>
        <div className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">404</div>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The page you requested does not exist, or it may have moved to a different route.
        </p>
        <Link to="/" className="primary-button mt-6 w-full">
          <ArrowLeft size={16} className="mr-2" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
