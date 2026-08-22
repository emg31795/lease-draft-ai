// Next.js App Router sitemap convention — auto-served at /sitemap.xml. Lists the
// homepage plus every pSEO content page (app/notices/**, app/guides/**) so search
// engines can discover the new long-tail pages without relying solely on internal
// links. Update this list whenever a new notices/ or guides/ page is added.

const BASE_URL = 'https://www.leasedraftai.com';

export default function sitemap() {
  const staticRoutes = ['', '/terms', '/privacy'];

  const notices = [
    '/notices/ohio/3-day-notice-to-leave-premises',
    '/notices/ohio/30-day-notice-to-vacate',
    '/notices/new-york/14-day-rent-demand-notice',
    '/notices/new-york/90-day-notice-to-vacate',
  ];

  const guides = [
    '/guides/how-eviction-notice-deadlines-are-calculated',
    '/guides/proof-of-service-affidavit-eviction',
    '/guides/why-eviction-cases-get-dismissed',
  ];

  const allRoutes = [...staticRoutes, ...notices, ...guides];

  return allRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date('2026-08-22'),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
