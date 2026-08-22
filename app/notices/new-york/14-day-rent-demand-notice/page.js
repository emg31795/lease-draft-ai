import { PageShell, NoticeCta, RelatedLinks } from '../../../../components/SiteChrome';

export const metadata = {
  title: '14-Day Rent Demand Notice New York — RPAPL § 711(2) Requirements | LeaseDraft AI',
  description:
    "New York's 14-day rent demand notice (RPAPL § 711(2), as amended by the HSTPA) must state both the amount owed and the option to pay or surrender possession. Here's what's required, plus a $9 tool that generates it and a Proof of Service affidavit.",
};

export default function NewYorkFourteenDayNoticePage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">
        New York 14-Day Rent Demand Notice
      </h1>
      <p className="text-slate-500 mb-8">
        RPAPL § 711(2), as amended by the Housing Stability and Tenant Protection Act of 2019 (HSTPA).
      </p>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">What changed under the HSTPA</h2>
          <p>
            Before 2019, New York&apos;s rent demand period was commonly treated as 3 days. The Housing
            Stability and Tenant Protection Act of 2019 extended this to <strong>14 days</strong> under
            RPAPL § 711(2) — a change some older templates and out-of-date guides still don&apos;t
            reflect. Serving a notice on the old 3-day timeline in New York today produces a legally
            defective notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">What the notice must state</h2>
          <p>
            RPAPL § 711(2) requires the demand to state, in the alternative, <strong>both</strong>: the
            exact amount of rent owed, <strong>and</strong> that the tenant may either pay that amount
            or surrender possession of the premises. A notice that only demands payment, without
            explicitly offering the option to instead surrender possession, does not satisfy the
            statute.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">How the 14-day count works</h2>
          <p>
            The day of service doesn&apos;t count — the 14-day period starts the following day, and all
            calendar days (including weekends) count toward the total. If the 14th day lands on a
            Saturday, Sunday, or public holiday, the deadline rolls forward to the next day that
            isn&apos;t one of those, under New York&apos;s General Construction Law §§ 20 and 25-a. That
            rollover step is easy to miss by hand — a notice dated as if the deadline were the raw
            14th day, when it actually falls on a weekend, understates the tenant&apos;s actual
            deadline.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">A note on Good Cause Eviction</h2>
          <p>
            As of the 2024 Good Cause Eviction Law, New York Real Property Law § 231-c may require this
            notice to be accompanied by a separate disclosure stating whether the tenancy is covered.
            This applies at minimum in New York City, and in a growing list of other municipalities that
            have separately opted in — confirm your property&apos;s coverage and your municipality&apos;s
            opt-in status before relying on the rent demand alone.
          </p>
        </section>
      </div>

      <NoticeCta
        heading="Generate a Correctly-Worded 14-Day Rent Demand"
        body="LeaseDraft AI states both required alternatives, computes the rollover-adjusted deadline, and bundles a Proof of Service affidavit — for $9, no subscription."
      />

      <RelatedLinks
        links={[
          { href: '/notices/new-york/90-day-notice-to-vacate', label: 'New York 90-Day Notice to Vacate (long-term tenancy)' },
          { href: '/guides/how-eviction-notice-deadlines-are-calculated', label: 'How eviction notice deadlines are actually calculated' },
          { href: '/guides/proof-of-service-affidavit-eviction', label: 'What a Proof of Service affidavit needs to hold up in court' },
        ]}
      />
    </PageShell>
  );
}
