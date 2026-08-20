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
      <body>{children}</body>
    </html>
  );
}
