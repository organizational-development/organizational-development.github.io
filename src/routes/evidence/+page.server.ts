import { allTopics } from '$lib/server/content';
import { STRENGTHS, rank, type Strength } from '$lib/content';

export function load() {
  // Models only: a questionnaire repeats its model's rating, so listing both
  // would double-count the ratings and disagree with the distribution the
  // source repository publishes.
  const topics = allTopics().filter((topic) => topic.evidence && !topic.model);

  /** Topics grouped under their leading evidence value, strongest group first. */
  const groups = STRENGTHS.map((strength: Strength) => ({
    strength,
    topics: topics
      .filter((topic) => topic.evidence!.strength === strength)
      .sort((a, b) => a.title.localeCompare(b.title))
  }))
    .filter((group) => group.topics.length > 0)
    .sort((a, b) => rank(a.strength) - rank(b.strength));

  const all = allTopics();
  return {
    groups,
    labelled: topics.length,
    models: all.filter((topic) => !topic.model).length,
    questionnaires: all.filter((topic) => topic.model).length
  };
}
