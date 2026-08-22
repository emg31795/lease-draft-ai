import { PageShell, NoticeCta, RelatedLinks } from '../../../components/SiteChrome';

export const metadata = {
  title: 'Why Self-Filed Eviction Cases Get Dismissed (and How to Avoid It) | LeaseDraft AI',
  description:
    "Judges dismiss a significant share of self-filed eviction cases over notice defects, not the underlying merits. Here are the specific, recurring mistakes — and how to avoid each one.",
};

export default function WhyCasesGetDismissedPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">
        Why Self-Filed Eviction Cases Get Dismissed
      </h1>
      <p className="text-slate-500 mb-8">
        Often it isn&apos;t the merits of the case — it&apos;s a defect in the notice itself.
      </p>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <p>
            A landlord can have an entirely valid reason to evict a tenant — unpaid rent, a real lease
            violation — and still lose or have the case dismissed, because eviction is a procedural
            area of law where the notice that precedes the court filing has to be exactly right. Courts
            treat the notice as a jurisdictional prerequisite, not a formality: get it wrong, and the
            case can be thrown out before the underlying facts are even considered. Below are the
            specific, recurring ways that happens.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Missing required statutory language</h2>
          <p>
            Several states require specific language to appear in the notice itself — not just the
            substance, but close to the exact wording. Ohio&apos;s 3-day notice (ORC § 1923.04) and
            Florida&apos;s 3-day notice (Statutes § 83.56(3)) both have this requirement. A generic,
            written-to-work-everywhere template is, by design, not tailored to any one state&apos;s
            specific required language.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">2. A miscounted or misdated deadline</h2>
          <p>
            As covered in more detail in{' '}
            <a href="/guides/how-eviction-notice-deadlines-are-calculated" className="text-blue-600 hover:underline">
              how eviction notice deadlines are actually calculated
            </a>
            , the correct deadline often isn&apos;t a flat &quot;add N days.&quot; Filing before the
            real deadline has passed — even by one day, even by an honest mistake — can get a case
            dismissed as premature.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">3. A vague or missing deadline entirely</h2>
          <p>
            It&apos;s common for free and AI-generated notices to fill in the deadline with a
            placeholder — something like &quot;[X days as required by local law]&quot; — instead of a
            computed date, leaving the landlord to work out (and often get wrong) the actual deadline
            themselves.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Incomplete or missing Proof of Service</h2>
          <p>
            Covered in full in{' '}
            <a href="/guides/proof-of-service-affidavit-eviction" className="text-blue-600 hover:underline">
              what a Proof of Service affidavit needs to hold up in court
            </a>
            . Without a properly sworn, specific record of how and when the notice was delivered,
            judges won&apos;t accept that notice was actually given — regardless of whether it truly
            was.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Using the wrong notice type or tier</h2>
          <p>
            Some states scale the required notice period by tenancy length (New York&apos;s 30/60/90-day
            tiers under RPL § 226-c) or by the underlying reason (Ohio&apos;s cure notice is scoped only
            to health-and-safety violations, not general lease breaches). Picking the wrong tier or type
            produces a notice that&apos;s facially insufficient.
          </p>
        </section>
      </div>

      <NoticeCta
        heading="Avoid All Five, Automatically"
        body="LeaseDraft AI fills in the required statutory language, computes the real deadline, bundles a proper Proof of Service affidavit, and only offers notice types your state actually supports — for $9."
      />

      <RelatedLinks
        links={[
          { href: '/guides/how-eviction-notice-deadlines-are-calculated', label: 'How eviction notice deadlines are actually calculated' },
          { href: '/guides/proof-of-service-affidavit-eviction', label: 'What a Proof of Service affidavit needs to hold up in court' },
          { href: '/notices/new-york/14-day-rent-demand-notice', label: 'New York 14-Day Rent Demand Notice' },
        ]}
      />
    </PageShell>
  );
}
