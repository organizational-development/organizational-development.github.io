import { families } from '$lib/server/content';

export function load() {
  const groups = families();
  return {
    families: groups,
    topicCount: groups.reduce((total, family) => total + family.topics.length, 0)
  };
}
