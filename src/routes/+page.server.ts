import { allTopics, contents, families, guideSummary } from '$lib/server/content';
import { STRENGTHS, rank, type Strength } from '$lib/content';

export function load() {
  const topics = allTopics();

  /**
   * Models only — a questionnaire inherits the rating of the model it
   * operationalizes, so counting both would inflate every bucket and disagree
   * with the distribution the source repository publishes.
   */
  const models = topics.filter((topic) => !topic.model);

  /**
   * How the models distribute across evidence strengths.
   *
   * This is the site's most honest single number, and the reason the home page
   * leads with it: most published OD writing presents every framework as
   * equally sound, and this collection's own tally says otherwise.
   */
  const distribution = STRENGTHS.map((strength: Strength) => ({
    strength,
    count: models.filter((topic) => topic.evidence?.strength === strength).length
  }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => rank(a.strength) - rank(b.strength));

  return {
    guide: guideSummary(),
    parts: contents().filter((part) => part.number),
    families: families().map(({ id, title, tagline, topics: list }) => ({
      id,
      title,
      tagline,
      count: list.length,
      strongest: list
        // Models only. A questionnaire shares its model's rating, so letting
        // both in would show the same evidence twice and crowd out a family's
        // third-best-evidenced model.
        .filter((topic) => topic.evidence && !topic.model)
        .sort((a, b) => rank(a.evidence!.strength) - rank(b.evidence!.strength))
        .slice(0, 3)
        .map(({ slug, title: name, evidence }) => ({ slug, title: name, evidence }))
    })),
    distribution,
    topicCount: topics.length,
    modelCount: models.length
  };
}
