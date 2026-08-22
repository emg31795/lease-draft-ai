import { PageShell, NoticeCta, RelatedLinks } from '../../../components/SiteChrome';

export const metadata = {
  title: 'Proof of Service Affidavit for Eviction Notices — What Courts Require | LeaseDraft AI',
  description:
    "A Proof of Service (Affidavit of Service) proves you actually delivered your eviction notice lawfully. Here's what it needs to hold up in court, and why a missing or incomplete one is a common reason cases get thrown out.",
};

export default function ProofOfServicePage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">
        What a Proof of Service Affidavit Needs to Hold Up in Court
      </h1>
      <p className="text-slate-500 mb-8">
        Delivering the notice is only half the job — proving you delivered it is the other half.
      </p>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Why this document exists</h2>
          <p>
            An eviction notice only starts the legal clock if the tenant was actually, lawfully served
            — and if a case ever reaches court, the judge needs proof of that, not just the
            landlord&apos;s word. A Proof of Service (sometimes called an Affidavit of Service) is a
            sworn statement, signed under penalty of perjury, documenting exactly how and when the
            notice was delivered. Courts routinely expect to see one filed alongside an eviction case —
            and a missing or incomplete one is one of the more avoidable reasons a self-filed case runs
            into trouble.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">What it needs to state</h2>
          <p>A Proof of Service that actually holds up generally needs to state, specifically:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Who served the notice (name of the server, not just the landlord entity)</li>
            <li>The exact date and time of service</li>
            <li>The method of service — personal delivery, posting and mailing, substituted service on
              another occupant, etc. — since each state&apos;s statute specifies which methods are
              valid and in what order they may be used</li>
            <li>The exact address where service occurred</li>
            <li>A sworn statement under penalty of perjury, properly formatted for the state and county
              where the case will be filed</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">A common gap: service method rules</h2>
          <p>
            Most states don&apos;t simply allow any method of delivery — they specify an order of
            preference (for example, personal delivery first, with substituted service like posting and
            mailing only allowed if personal delivery genuinely can&apos;t be accomplished). A Proof of
            Service that doesn&apos;t reflect the actual method used, or that documents a method the
            statute doesn&apos;t recognize as valid for that notice type, can undermine the notice even
            if the underlying grounds for eviction are otherwise solid.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Why free templates often skip this entirely
          </h2>
          <p>
            Many free, generic eviction notice templates provide only the notice itself and leave Proof
            of Service as an afterthought — or omit it entirely, assuming the landlord will find a
            separate form somewhere else. That gap is exactly where an otherwise-correct notice can
            still fail to hold up procedurally.
          </p>
        </section>
      </div>

      <NoticeCta
        heading="Get the Notice and the Affidavit Together"
        body="Every LeaseDraft AI notice is bundled with a properly formatted Proof of Service / Affidavit of Service — not a separate purchase, not an afterthought. $9, one time."
      />

      <RelatedLinks
        links={[
          { href: '/guides/how-eviction-notice-deadlines-are-calculated', label: 'How eviction notice deadlines are actually calculated' },
          { href: '/guides/why-eviction-cases-get-dismissed', label: 'Why self-filed eviction cases get dismissed' },
          { href: '/notices/ohio/3-day-notice-to-leave-premises', label: 'Ohio 3-Day Notice to Leave Premises' },
        ]}
      />
    </PageShell>
  );
}
