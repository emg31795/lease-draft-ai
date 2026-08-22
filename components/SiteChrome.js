// Shared header/footer/CTA for the pSEO content pages (app/notices/**, app/guides/**).
// Deliberately mirrors the visual language already established in app/page.js and
// app/terms/page.js (slate-50 background, blue-600 accents, rounded-xl white cards)
// rather than introducing a new look for these pages. Kept as its own component so the
// pSEO pages share one source of truth for header/footer copy instead of each page
// re-typing it — app/page.js itself is left untouched to avoid touching the
// already-shipped, already-verified homepage.

export function SiteHeader() {
  return (
    <header className="border-b bg-white py-4 px-6 mb-8 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-blue-600">LeaseDraft AI</a>
        <a
          href="/"
          className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Generate a Notice ($9) →
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 mt-16">
      <div className="max-w-4xl mx-auto px-4">
        <p>© 2026 LeaseDraft AI. All rights reserved.</p>

        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-medium">
          <a href="mailto:leasedraftai@proton.me" className="text-blue-600 hover:underline">Support: leasedraftai@proton.me</a>
          <a href="/recover" className="text-blue-600 hover:underline">Lost your document?</a>
          <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
        </p>

        <p className="mt-2 max-w-2xl mx-auto">
          Statutory citations, notice periods, and deadlines are verified in code for California, Texas,
          Florida, Ohio, and most New York notice types. One exception: New York has no statewide statute
          creating a pre-suit &quot;Cure or Quit&quot; notice, so that specific notice type remains AI-drafted
          with a clear disclosure in the wizard.
        </p>

        <p className="mt-2 max-w-2xl mx-auto">
          Disclaimer: LeaseDraft AI provides automated legal document formatting and self-help tools, not
          legal advice or legal representation. Independently verify any citation or deadline before relying
          on it, especially for anything filed in court.
        </p>
      </div>
    </footer>
  );
}

// A single reusable call-to-action card used at the bottom (and sometimes middle) of
// every pSEO content page — always links back to the homepage wizard, never a dead end.
export function NoticeCta({ heading, body, buttonLabel }) {
  return (
    <div className="bg-blue-600 rounded-xl shadow-md p-6 sm:p-8 text-center text-white my-10">
      <h2 className="text-xl font-bold mb-2">{heading}</h2>
      <p className="text-blue-100 mb-5 max-w-xl mx-auto">{body}</p>
      <a
        href="/"
        className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition"
      >
        {buttonLabel || 'Generate My Notice — $9 →'}
      </a>
    </div>
  );
}

// Small internal-linking footer used across notice/guide pages so Google (and readers)
// can discover the rest of the content cluster, not just the one page they landed on.
export function RelatedLinks({ links }) {
  if (!links?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8 mt-8">
      <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Related</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="text-blue-600 hover:underline text-sm">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 pb-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
