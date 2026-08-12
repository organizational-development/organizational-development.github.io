import { partSlugs, topicSlugs } from '$lib/server/content';
import { SITE } from '$lib/content';

export const prerender = true;

/**
 * A sitemap that lists every topic and every part of the guide. Readers arrive
 * from a search for one model — "Burke-Litwin", "psychological safety" — not
 * for the front page, so each of those needs to be indexable on its own.
 */
export function GET() {
  const paths = [
    '/',
    '/guide/',
    '/topics/',
    '/evidence/',
    ...partSlugs().map((slug) => `/guide/${slug}/`),
    ...topicSlugs().map((slug) => `/topics/${slug}/`)
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${SITE}${path}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'content-type': 'application/xml' } });
}
