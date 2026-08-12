import { allTopics } from '$lib/server/content';
import { STRENGTHS, rank, type Strength } from '$lib/content';

export function load() {
  const topics = allTopics().filter((topic) => topic.evidence);

  /** Topics grouped under their leading evidence value, strongest group first. */
  const groups = STRENGTHS.map((strength: Strength) => ({
    strength,
    topics: topics
      .filter((topic) => topic.evidence!.strength === strength)
      .sort((a, b) => a.title.localeCompare(b.title))
  }))
    .filter((group) => group.topics.length > 0)
    .sort((a, b) => rank(a.strength) - rank(b.strength));

  return {
    groups,
    labelled: topics.length,
    unlabelled: allTopics().length - topics.length
  };
}
