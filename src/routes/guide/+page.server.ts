import { contents, guideOverview, guideSummary } from '$lib/server/content';

export function load() {
  return {
    overview: guideOverview(),
    guide: guideSummary(),
    parts: contents()
  };
}
