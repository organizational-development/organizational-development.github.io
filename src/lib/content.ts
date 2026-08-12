// Shared types, the topic manifest, and the evidence vocabulary.
//
// This module holds no prose — only the small metadata that both the server
// load functions and the Svelte components need, so it is safe to import from
// either side. The prose lives in `$lib/server/content.ts`, which is
// server-only and therefore never reaches a client bundle.

/** Where the guide's source lives, for provenance and "edit this" links. */
export const SOURCE_REPO = 'https://github.com/organizational-development/organizational-development';

/** The published site, for canonical URLs and the sitemap. */
export const SITE = 'https://organizational-development.github.io';

/** One topic, as a card or a contents entry. */
export type TopicRef = {
  /** URL slug and content filename stem, e.g. `psychological-safety`. */
  slug: string;
  /** The `# ` heading, e.g. `Psychological safety`. */
  title: string;
  /** Opening paragraph, plain text. */
  summary: string;
  /** The family this topic belongs to. */
  family: string;
  /** Evidence rating, or `null` for material that carries no label. */
  evidence: Evidence | null;
  /** The paired questionnaire's slug, for diagnostic models. */
  questionnaire?: string;
  /** For a questionnaire, the model it operationalizes. */
  model?: string;
};

/** A topic's evidence label, split into the part that ranks and the prose. */
export type Evidence = {
  /** The full label as written, e.g. `Weak as a whole, good in its components`. */
  label: string;
  /** The leading value that ranks, e.g. `Weak`. */
  strength: Strength;
  /** The justification sentence(s) that follow the label. */
  detail: string;
};

/**
 * The permitted evidence strengths, strongest first.
 *
 * The source repository's convention is a bold `**Evidence: <strength>.**`
 * block on every model, with split labels — "Weak as a model, moderate in
 * components" — permitted where a single value would mislead. Ranking uses the
 * leading value; the full label is always shown alongside it.
 */
export const STRENGTHS = [
  'Strong',
  'Good',
  'Moderate',
  'Mixed',
  'Contested',
  'Weak',
  'Very weak',
  'Not an empirical model',
  'Not a model',
  'Normative'
] as const;

export type Strength = (typeof STRENGTHS)[number];

/** One-line reading of each strength, shown on the evidence page. */
export const STRENGTH_NOTES: Record<Strength, string> = {
  Strong: 'Meta-analytic or large replicated experimental support.',
  Good: 'Substantial empirical support, with some methodological limits.',
  Moderate: 'Real support for the underlying principle; the model itself untested.',
  Mixed: 'Genuinely contested, or components differ sharply in support.',
  Contested: 'Influential and seriously criticized on method.',
  Weak: 'Practitioner-derived, with little or no independent validation.',
  'Very weak': 'Contradicted, or transferred from an unrelated domain.',
  'Not an empirical model': 'A taxonomy or checklist, to be judged on usefulness.',
  'Not a model': 'A method or guidance, to be judged on how well it is run.',
  Normative: 'Value commitments, to be argued rather than measured.'
};

/** Sort order for a strength; unknown values sort last. */
export function rank(strength: Strength): number {
  const at = STRENGTHS.indexOf(strength);
  return at === -1 ? STRENGTHS.length : at;
}

/**
 * Parse a `**Evidence: <label>.** <detail>` block.
 *
 * Returns `null` when the file carries no label, which is correct for the
 * handful of process and catalog files that are not models at all.
 */
export function parseEvidence(markdown: string): Evidence | null {
  const match = markdown.match(/^\*\*Evidence:\s*([^*]+?)\.?\*\*\s*([\s\S]*?)(?=\n\s*\n)/m);
  if (!match) return null;

  const label = match[1].trim();
  const strength =
    // Longest match wins, so `Very weak` is not read as `Weak` and
    // `Not an empirical model` is not read as `Not a model`.
    [...STRENGTHS]
      .sort((a, b) => b.length - a.length)
      .find((candidate) => label.toLowerCase().startsWith(candidate.toLowerCase())) ?? null;

  if (!strength) return null;

  const detail = match[2]
    .replace(/\s+/g, ' ')
    .replace(/[*_]/g, '')
    .trim();

  return { label, strength, detail };
}

/** A group of topics, as the source repository's specification organizes them. */
export type Family = {
  /** URL-safe id, used as an anchor on the topics page. */
  id: string;
  title: string;
  /** The one-line framing shown under the family title. */
  tagline: string;
  /** Topic slugs, in the order the specification lists them. */
  slugs: string[];
};

/**
 * The six families, in the order the source repository's `spec/index.md`
 * inventory lists them.
 *
 * Kept in sync by hand: the topic files record their own content but not the
 * grouping. `$lib/server/content.ts` cross-checks this list against the files
 * on disk at build time, so a topic added upstream and forgotten here is a
 * build warning rather than a page that quietly never appears.
 */
export const FAMILIES: Family[] = [
  {
    id: 'foundations',
    title: 'Foundations, process, and ethics',
    tagline: 'what OD is, how an engagement runs, and the obligations that come with it',
    slugs: [
      'od-process-cycle',
      'entry-and-contracting',
      'action-research',
      'evidence-based-practice',
      'od-ethics',
      'systems-thinking',
      'sociotechnical-systems',
      'conways-law',
      'interventions-catalog'
    ]
  },
  {
    id: 'diagnostic-models',
    title: 'Diagnostic models',
    tagline: 'frameworks for working out what is actually wrong, each with a questionnaire',
    slugs: [
      'mckinsey-7s-framework',
      'burke-litwin-causal-model',
      'weisbord-six-box-model',
      'nadler-tushman-congruence-model',
      'galbraith-star-model',
      'leavitt-diamond-model',
      'maturity-models',
      'force-field-analysis',
      'swot-analysis',
      'pestle-analysis',
      'cynefin-framework',
      'viable-system-model',
      'organizational-network-analysis',
      'team-topologies'
    ]
  },
  {
    id: 'change-models',
    title: 'Change models',
    tagline: 'how change is planned, sequenced, and lived through',
    slugs: [
      'lewin-change-model',
      'kotter-8-step-change-model',
      'adkar-change-management-model',
      'bridges-transition-model',
      'kubler-ross-change-curve',
      'satir-change-model',
      'beckhard-harris-change-equation',
      'rogers-diffusion-of-innovations',
      'switch-framework',
      'mckinsey-influence-model',
      'theory-of-change',
      'plan-do-study-act',
      'improvement-kata'
    ]
  },
  {
    id: 'culture-teams-people',
    title: 'Culture, team, and human models',
    tagline: 'the behaviour of groups and the motivation of the people in them',
    slugs: [
      'schein-model-of-organizational-culture',
      'competing-values-framework',
      'westrum-organizational-culture-typology',
      'hofstede-cultural-dimensions',
      'just-culture',
      'psychological-safety',
      'tuckman-stages-of-group-development',
      'lencioni-five-dysfunctions-of-a-team',
      'drexler-sibbet-team-performance-model',
      'google-project-aristotle',
      'crew-resource-management',
      'thomas-kilmann-conflict-modes',
      'self-determination-theory',
      'herzberg-two-factor-theory',
      'maslow-hierarchy-of-needs',
      'job-characteristics-model',
      'immunity-to-change',
      'situational-leadership-model',
      'learning-organization',
      'double-loop-learning',
      'process-consultation'
    ]
  },
  {
    id: 'facilitation-methods',
    title: 'Large-group and facilitation methods',
    tagline: 'ways to convene many people and come out with something usable',
    slugs: [
      'appreciative-inquiry',
      'open-space-technology',
      'world-cafe',
      'future-search',
      'after-action-review',
      'survey-feedback-method'
    ]
  },
  {
    id: 'measurement',
    title: 'Measurement',
    tagline: 'what to count, what counting costs, and what it cannot tell you',
    slugs: [
      'measurement-and-metrics',
      'employee-engagement-surveys',
      'dora-metrics',
      'space-framework',
      'high-reliability-organizations'
    ]
  }
];

/** The family a stray topic lands in when the manifest above misses it. */
export const UNFILED: Family = {
  id: 'unfiled',
  title: 'Additional topics',
  tagline: 'present in the source repository but not yet placed in a family',
  slugs: []
};
