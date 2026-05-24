import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <div className="eyebrow mb-2">404</div>
      <h1 className="font-serif text-3xl font-bold mb-4" style={{ color: 'var(--ink-strong)' }}>
        Page not found
      </h1>
      <p className="text-lg mb-6" style={{ color: 'var(--ink-muted)' }}>
        This page doesn't exist in the corpus.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-sm font-semibold px-5 py-2.5"
        style={{ background: 'var(--amber)', color: 'var(--slate-deep)', fontSize: 14 }}
      >
        Back to Case Front
      </Link>
    </div>
  );
}
