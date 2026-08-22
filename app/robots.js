// Next.js App Router robots convention — auto-served at /robots.txt. Explicitly points
// crawlers at the sitemap so the new pSEO pages get discovered.

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://www.leasedraftai.com/sitemap.xml',
  };
}
