export const metadata = {
  title: 'Privacy Policy — LeaseDraft AI',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="border-b bg-white py-4 px-6 mb-8 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <a href="/" className="text-xl font-bold text-blue-600">LeaseDraft AI</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-100 space-y-6 text-sm leading-relaxed text-slate-700">
          <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: August 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">What we collect</h2>
            <p>
              When you use LeaseDraft AI's notice generator, we collect the information you enter into the
              wizard — including landlord and tenant names, contact details, and the rental property address —
              solely to draft the legal notice you requested. When you pay, our payment processor, Stripe,
              separately collects your email address and payment details to process the transaction; we never
              see or store your card number.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">How we use it</h2>
            <p>
              The details you enter are sent to Anthropic's Claude API to draft your notice, and to Stripe to
              process payment and, if you use the "Recover Your Document" tool, to look up your paid order by
              the email you checked out with. We do not sell your information, and we do not use it for
              advertising or share it with any other third party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">How long we keep it</h2>
            <p>
              We do not operate our own database of your notices — your document and its underlying details
              are generated on demand and held by Stripe as part of your checkout session record, subject to
              Stripe's own retention policies. We recommend downloading your PDF and keeping your own copy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Analytics</h2>
            <p>
              We use Vercel Web Analytics to understand aggregate site traffic (like page views and visitor
              counts). It does not use cookies and does not track you individually across other sites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Your choices</h2>
            <p>
              You can ask us to delete any information you've provided by emailing{' '}
              <a href="mailto:maarketeer@gmail.com" className="text-blue-600 underline">maarketeer@gmail.com</a>.
              Since we don't retain a database of past notices ourselves, this mainly means removing you from
              any correspondence and confirming nothing further is stored on our end.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Contact</h2>
            <p>
              Questions about this policy? Email{' '}
              <a href="mailto:maarketeer@gmail.com" className="text-blue-600 underline">maarketeer@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
