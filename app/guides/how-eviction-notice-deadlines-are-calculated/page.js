import { PageShell, NoticeCta, RelatedLinks } from '../../../components/SiteChrome';

export const metadata = {
  title: 'How Eviction Notice Deadlines Are Actually Calculated | LeaseDraft AI',
  description:
    'Why "add N days to today" gets eviction notice deadlines wrong more often than landlords expect — weekend/holiday exclusions, deadline rollovers, and periodic-date anchoring, explained state by state.',
};

export default function HowDeadlinesAreCalculatedPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">
        How Eviction Notice Deadlines Are Actually Calculated
      </h1>
      <p className="text-slate-500 mb-8">
        &quot;Add N days to today&quot; is wrong more often than most landlords expect. Here&apos;s why.
      </p>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <p>
            Every state gives an eviction notice a stated number of days — 3, 7, 14, 30, 60, or 90,
            depending on the state and notice type. It&apos;s tempting to treat that as simple addition:
            take today&apos;s date, add the number, done. In practice, that flat calculation is wrong
            for most of the notice types LeaseDraft AI supports, in one of four specific ways:
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            1. Some states exclude weekends and holidays from the count
          </h2>
          <p>
            California (Code of Civil Procedure § 1161) and Florida (Statutes § 83.56(3)) both exclude
            Saturdays, Sundays, and court holidays from their 3-day pay-or-quit counts — meaning a
            notice served right before a weekend takes noticeably longer, in real days, to expire than
            one served on a Monday. Ohio&apos;s 3-day notice has the same kind of exclusion in
            documented court practice, though — unusually — the statute&apos;s own text doesn&apos;t
            settle whether that&apos;s actually required.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            2. Some states count every calendar day, but roll the final deadline forward
          </h2>
          <p>
            Texas (Property Code § 24.0042, effective 2026) and New York (General Construction Law
            §§ 20 and 25-a) both count straight calendar days toward the total — but if the resulting
            deadline itself lands on a weekend or holiday, it rolls forward to the next valid day. This
            is a different rule from #1 above: the weekend doesn&apos;t stop the count from running, it
            just can&apos;t be the day the deadline actually falls on.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            3. Some notices have to land on a specific recurring date, not N days out
          </h2>
          <p>
            Florida&apos;s 30/60-day notices to vacate (Statutes § 83.57) and Ohio&apos;s 30-day notice
            (Revised Code § 5321.17(B)) don&apos;t simply require N days from today — they require the
            termination date to align with the tenant&apos;s actual rental-period boundary (e.g., their
            recurring monthly rent-due date). A flat &quot;+30 days&quot; calculation frequently lands
            on a date that isn&apos;t a valid periodic rental date at all, which can invalidate the
            notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            4. Some states scale the period by how long the tenant has lived there
          </h2>
          <p>
            New York&apos;s notice-to-vacate period (RPL § 226-c) isn&apos;t one fixed number — it&apos;s
            30, 60, or 90 days depending on the tenant&apos;s occupancy length or lease term. Applying
            the wrong tier produces a notice period that&apos;s legally too short.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            The common failure mode: a placeholder instead of a real answer
          </h2>
          <p>
            It&apos;s common for free templates and even some AI-generated notices to sidestep all of
            this by filling in the deadline with a vague placeholder — something like &quot;[X days as
            required by local law]&quot; — and leaving the landlord to work out the actual date
            themselves. That shifts the exact calculation described above back onto the person least
            equipped to get it right under time pressure.
          </p>
        </section>
      </div>

      <NoticeCta
        heading="Skip the Manual Calculation"
        body="LeaseDraft AI computes the real deadline date in tested code — weekend exclusions, rollovers, and periodic-date anchoring included — for whichever state and notice type you're using. $9, no subscription."
      />

      <RelatedLinks
        links={[
          { href: '/guides/proof-of-service-affidavit-eviction', label: 'What a Proof of Service affidavit needs to hold up in court' },
          { href: '/guides/why-eviction-cases-get-dismissed', label: 'Why self-filed eviction cases get dismissed' },
          { href: '/notices/ohio/30-day-notice-to-vacate', label: 'Ohio 30-Day Notice to Vacate — periodic date example' },
          { href: '/notices/new-york/90-day-notice-to-vacate', label: 'New York 90-Day Notice to Vacate — tenancy tiers' },
        ]}
      />
    </PageShell>
  );
}
