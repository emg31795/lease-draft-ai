import { PageShell, NoticeCta, RelatedLinks } from '../../../../components/SiteChrome';

export const metadata = {
  title: 'Ohio 3-Day Notice to Leave Premises — Requirements & Free Guide | LeaseDraft AI',
  description:
    "What Ohio's 3-day notice to leave premises (ORC § 1923.04) actually requires, the mandatory statutory language, and how the deadline is counted — plus a $9 tool that generates the notice and Proof of Service for you.",
};

export default function OhioThreeDayNoticePage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">
        Ohio 3-Day Notice to Leave Premises
      </h1>
      <p className="text-slate-500 mb-8">
        Ohio Revised Code § 1923.04 — what it requires, the mandatory notice language, and how the
        3-day count actually works.
      </p>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">What this notice is</h2>
          <p>
            Ohio&apos;s 3-day notice to leave the premises is required under Ohio Revised Code
            § 1923.04 before a landlord can file an eviction (forcible entry and detainer) action in
            municipal or county court. Unlike some states, Ohio law does not give the tenant a
            statutory right to cure by paying — this is an <strong>unconditional demand for
            possession</strong>, not a &quot;pay within 3 days or leave&quot; offer. Paying the amount
            owed is a practical way to resolve things with the landlord, but it is not something Ohio
            law entitles the tenant to do in response to this specific notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">The mandatory notice language</h2>
          <p>
            ORC § 1923.04(A) requires the notice to include specific statutory language,
            conventionally shown in bold or all-capital letters on official court forms:
          </p>
          <blockquote className="border-l-4 border-blue-200 pl-4 italic text-slate-600 my-3">
            &quot;You are being asked to leave the premises. If you do not leave, an eviction action
            may be initiated against you. If you are in doubt regarding your legal rights and
            obligations as a tenant, it is recommended that you seek legal assistance.&quot;
          </blockquote>
          <p>
            A notice missing this exact language is a common, avoidable reason self-filed Ohio
            eviction cases get challenged in court.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">How the 3-day count works</h2>
          <p>
            The count starts the day after the tenant receives the notice. Whether Ohio law excludes
            weekends and court holidays from that count is genuinely unsettled — the statute&apos;s own
            text doesn&apos;t say, and legal sources disagree. Documented practice in a number of Ohio
            county courts excludes weekends and holidays (the more conservative reading, since it gives
            the tenant slightly more time and reduces the risk of filing too early), but at least one
            source states the opposite. If your notice is served on a Thursday, for example, the
            weekend-excluding count and the calendar-day count can land on different dates — worth
            confirming your local municipal or county court&apos;s practice before relying on either
            reading for an actual filing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Where landlords go wrong</h2>
          <p>
            The most common mistakes with this notice: leaving out the mandatory statutory language
            entirely (many generic, non-Ohio-specific templates don&apos;t include it), miscounting the
            3-day deadline, and not preparing a proper Proof of Service affidavit showing exactly how
            and when the tenant was served — something Ohio eviction court clerks expect to see filed
            alongside the case.
          </p>
        </section>
      </div>

      <NoticeCta
        heading="Generate a court-ready Ohio 3-Day Notice"
        body="LeaseDraft AI fills in the mandatory ORC § 1923.04 language automatically, computes the deadline, and bundles a signed Proof of Service affidavit — all for $9, no subscription."
      />

      <RelatedLinks
        links={[
          { href: '/notices/ohio/30-day-notice-to-vacate', label: "Ohio 30-Day Notice to Vacate (ORC § 5321.17)" },
          { href: '/guides/proof-of-service-affidavit-eviction', label: 'What a Proof of Service affidavit needs to hold up in court' },
          { href: '/guides/why-eviction-cases-get-dismissed', label: 'Why self-filed eviction cases get dismissed' },
        ]}
      />
    </PageShell>
  );
}
