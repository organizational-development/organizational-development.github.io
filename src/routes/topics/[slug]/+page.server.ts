import { error } from '@sveltejs/kit';
import { topic, topicSlugs } from '$lib/server/content';

/** Prerender one page per topic; adapter-static needs the list up front. */
export function entries() {
  return topicSlugs().map((slug) => ({ slug }));
}

export function load({ params }) {
  const found = topic(params.slug);
  if (!found) error(404, `No topic named "${params.slug}"`);
  return found;
}
