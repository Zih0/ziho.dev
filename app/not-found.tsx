import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fadeIn">
      <div className="text-center">
        <div className="text-8xl font-display font-bold text-zinc-800 mb-4">404</div>
        <h1 className="text-2xl font-serif text-white mb-4">Page not found</h1>
        <p className="text-zinc-500 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-primary/80 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
