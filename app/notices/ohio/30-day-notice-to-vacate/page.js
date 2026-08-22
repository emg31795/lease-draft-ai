import { PageShell, NoticeCta, RelatedLinks } from '../../../../components/SiteChrome';

export const metadata = {
  title: 'Ohio 30-Day Notice to Vacate — Periodic Rental Date Rule Explained | LeaseDraft AI',
  description:
    "Ohio Revised Code § 5321.17(B) requires a 30-day notice to end ON the tenant's periodic rental date, not simply 30 days from today. Here's how that actually works, plus a $9 tool that computes it for you.",
};

export default function OhioThirtyDayNoticePage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">
        Ohio 30-Day Notice to Vacate
      </h1>
      <p className="text-slate-500 mb-8">
        Ohio Revised Code § 5321.17(B) — and the periodic-rental-date rule most generic templates get
        wrong.
      </p>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">What this notice is for</h2>
          <p>
            This notice terminates a month-to-month tenancy in Ohio without needing a lease violation
            or nonpayment — either party can end a periodic tenancy this way. It is separate from the
            3-day notice to leave premises (ORC § 1923.04), which is used after a violation or
            nonpayment, not for an ordinary end-of-tenancy termination.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            The rule most templates get wrong: it&apos;s not &quot;30 days from today&quot;
          </h2>
          <p>
            Ohio Revised Code § 5321.17(B) requires the notice to give the tenant <strong>at least 30
            days</strong>, and the termination date must land <strong>on the tenant&apos;s next periodic
            rental date</strong> — typically the recurring monthly rent due date — not simply 30
            calendar days after the notice is served. A generic 50-state template that just adds 30
            days to today&apos;s date will frequently compute the wrong termination date, because it
            isn&apos;t anchored to the tenant&apos;s actual rent-due cycle.
          </p>
          <p>
            For example: if a tenant&apos;s rent is due on the 1st of each month, and a landlord serves
            this notice on the 10th, a flat &quot;+30 days&quot; calculation lands on the 9th of the
            following month — not a valid periodic rental date under Ohio law. The correct deadline
            has to walk forward to the next rent-due date that is still at least 30 days out, which in
            this example would be the 1st of the month after that.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No 60-day tier in Ohio</h2>
          <p>
            Some states (California, New York, Florida) scale the notice period up for longer-term
            tenants — Ohio does not. ORC § 5321.17 has no 60-day tier at all; 30 days, anchored to the
            periodic rental date, is the rule regardless of how long the tenant has lived there. A
            template offering a &quot;60-Day Notice to Vacate&quot; option for Ohio is offering
            something Ohio law doesn&apos;t actually provide.
          </p>
        </section>
      </div>

      <NoticeCta
        heading="Generate a Correctly-Dated Ohio 30-Day Notice"
        body="LeaseDraft AI asks for your tenant's actual periodic rental date and computes the real termination date from it — not a flat 30-day guess — for $9."
      />

      <RelatedLinks
        links={[
          { href: '/notices/ohio/3-day-notice-to-leave-premises', label: 'Ohio 3-Day Notice to Leave Premises (ORC § 1923.04)' },
          { href: '/guides/how-eviction-notice-deadlines-are-calculated', label: 'How eviction notice deadlines are actually calculated' },
          { href: '/guides/why-eviction-cases-get-dismissed', label: 'Why self-filed eviction cases get dismissed' },
        ]}
      />
    </PageShell>
  );
}
