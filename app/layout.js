import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'LeaseDraft AI — Court-Ready Landlord Notices',
  description:
    'Generate legally compliant Pay or Quit, Cure or Quit, and Lease Termination notices with automated Proof of Service affidavits.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/*
          Tailwind is loaded once here, globally, via the CDN build (no build step or
          config file needed). Previously each page had to remember to add this script
          tag itself — app/success/page.js never did, so every Tailwind className on
          that page silently did nothing and it rendered as plain unstyled HTML. Moving
          it to the root layout means every current and future page gets it for free.
        */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        {children}
        {/*
          Vercel Web Analytics: toggling it on in the dashboard alone does nothing —
          it also requires this component to actually be present and deployed, which
          is what was missing (the dashboard was showing "not enabled" even after Eric
          clicked through the setup screen, because that screen's real ask was "add
          this code," not just a switch). Placed once here in the root layout so every
          route gets tracked.
        */}
        <Analytics />
      </body>
    </html>
  );
}
