import { error } from '@sveltejs/kit';
import { part, partSlugs } from '$lib/server/content';

/** Prerender one page per part; adapter-static needs the list up front. */
export function entries() {
  return partSlugs().map((slug) => ({ slug }));
}

export function load({ params }) {
  const found = part(params.slug);
  if (!found) error(404, `No part of the guide named "${params.slug}"`);
  return found;
}
