import { PageShell, NoticeCta, RelatedLinks } from '../../../../components/SiteChrome';

export const metadata = {
  title: 'New York 90-Day Notice to Vacate — RPL § 226-c Tenancy Tiers | LeaseDraft AI',
  description:
    "New York's notice-to-vacate period scales with how long the tenant has lived there — 30, 60, or 90 days under RPL § 226-c. Here's how the tiers work, and a $9 tool that gets the tier right automatically.",
};

export default function NewYorkNinetyDayNoticePage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">
        New York 90-Day Notice to Vacate
      </h1>
      <p className="text-slate-500 mb-8">
        New York Real Property Law § 226-c(2)(d) — for tenants who&apos;ve occupied the unit 2 years or
        more.
      </p>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            New York&apos;s notice period isn&apos;t one number — it&apos;s three
          </h2>
          <p>
            Unlike states that use a single flat notice period regardless of how long the tenant has
            lived there, New York Real Property Law § 226-c sets the required notice period based on
            <strong> occupancy length or lease term, whichever is longer</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Under 1 year:</strong> 30 days&apos; notice (RPL § 226-c(2)(b))</li>
            <li><strong>1 year to under 2 years:</strong> 60 days&apos; notice (RPL § 226-c(2)(c))</li>
            <li><strong>2 years or more:</strong> 90 days&apos; notice (RPL § 226-c(2)(d)) — the tier
              covered on this page</li>
          </ul>
          <p>
            Picking the wrong tier — for example, sending a 30-day notice to a tenant who has actually
            lived in the unit for 2+ years — produces a notice period that&apos;s legally too short,
            which can get an eviction case dismissed outright.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">How the 90-day count works</h2>
          <p>
            As with the 14-day rent demand, the day of service doesn&apos;t count, all calendar days
            count toward the 90, and if the resulting deadline lands on a weekend or public holiday it
            rolls forward to the next business day under General Construction Law §§ 20 and 25-a.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Good Cause Eviction disclosure</h2>
          <p>
            As with New York&apos;s other notice-to-vacate tiers, the 2024 Good Cause Eviction Law (RPL
            § 231-c) may require a separate disclosure about the tenancy&apos;s Good Cause coverage,
            at minimum in New York City and a growing list of municipalities that have opted in.
            Confirm this before relying on the notice alone.
          </p>
        </section>
      </div>

      <NoticeCta
        heading="Get the Right Tier — Automatically"
        body="LeaseDraft AI asks how long the tenant has occupied the unit and auto-selects the correct 30/60/90-day tier — no manual lookup, no guessing — for $9."
      />

      <RelatedLinks
        links={[
          { href: '/notices/new-york/14-day-rent-demand-notice', label: 'New York 14-Day Rent Demand Notice (RPAPL § 711(2))' },
          { href: '/guides/how-eviction-notice-deadlines-are-calculated', label: 'How eviction notice deadlines are actually calculated' },
          { href: '/guides/why-eviction-cases-get-dismissed', label: 'Why self-filed eviction cases get dismissed' },
        ]}
      />
    </PageShell>
  );
}
