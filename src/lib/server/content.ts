// Server-only access to the guide's markdown.
//
// Living under `$lib/server/` means SvelteKit refuses to bundle this into
// client code, which matters here: the vendored content is the 180 KB guide
// plus 82 topic files. The site is fully prerendered, so this module runs at
// build time and each page ships only its own rendered HTML.

import { parse, plain, slugger, summarize, type Document, type Heading } from '$lib/markdown';
import {
  FAMILIES,
  SOURCE_REPO,
  UNFILED,
  parseEvidence,
  type Family,
  type TopicRef
} from '$lib/content';

/** Raw markdown for every topic, keyed by module path. */
const topicFiles = import.meta.glob('../../content/topics/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

/** Raw markdown for the guide itself. */
const guideFiles = import.meta.glob('../../content/README.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const guideMarkdown = Object.values(guideFiles)[0] ?? '';

/* ---------------------------------------------------------------------------
 * Topics
 * ------------------------------------------------------------------------ */

type Topic = TopicRef & { markdown: string };

/** Family lookup by slug, built once from the manifest. */
const familyOf = new Map<string, Family>();
for (const family of FAMILIES) {
  for (const slug of family.slugs) familyOf.set(slug, family);
}

/**
 * Every topic on disk, keyed by slug.
 *
 * A questionnaire is not listed in the manifest — it inherits its model's
 * family, which keeps `<model>` and `<model>-questionnaire` together in the
 * contents and in the previous/next chain.
 */
const topics = new Map<string, Topic>();

for (const [path, markdown] of Object.entries(topicFiles)) {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const model = slug.endsWith('-questionnaire') ? slug.replace(/-questionnaire$/, '') : undefined;
  const family = familyOf.get(slug) ?? (model ? familyOf.get(model) : undefined) ?? UNFILED;

  if (family === UNFILED && !UNFILED.slugs.includes(slug)) {
    UNFILED.slugs.push(slug);
    console.warn(
      `[content] topic "${slug}" is not in the family manifest in src/lib/content.ts; ` +
        'it will appear under "Additional topics".'
    );
  }

  topics.set(slug, {
    slug,
    title: markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? slug,
    summary: summarize(markdown),
    family: family.id,
    evidence: parseEvidence(markdown),
    model,
    markdown
  });
}

// Pair each model with its questionnaire, now that every file is known.
for (const topic of topics.values()) {
  if (topic.model && topics.has(topic.model)) {
    topics.get(topic.model)!.questionnaire = topic.slug;
  }
}

/** Strip the markdown source before handing a topic to a page. */
function refOf(topic: Topic): TopicRef {
  const { markdown: _markdown, ...ref } = topic;
  return ref;
}

/** Every topic slug, in family order then manifest order. */
export function topicSlugs(): string[] {
  return orderedTopics().map((topic) => topic.slug);
}

/**
 * Reading order: family by family, and within a family each model immediately
 * followed by its questionnaire.
 */
function orderedTopics(): Topic[] {
  const ordered: Topic[] = [];
  for (const family of [...FAMILIES, UNFILED]) {
    for (const slug of family.slugs) {
      const topic = topics.get(slug);
      if (!topic) {
        console.warn(`[content] family "${family.id}" lists "${slug}", which is not on disk.`);
        continue;
      }
      ordered.push(topic);
      const paired = topic.questionnaire ? topics.get(topic.questionnaire) : undefined;
      if (paired) ordered.push(paired);
    }
  }
  return ordered;
}

/** The families, each with its topics, for rendering the topics contents. */
export function families(): Array<Family & { topics: TopicRef[] }> {
  const all = orderedTopics();
  return [...FAMILIES, UNFILED]
    .filter((family) => family.slugs.length > 0)
    .map((family) => ({
      ...family,
      topics: all.filter((topic) => topic.family === family.id).map(refOf)
    }));
}

/** Every topic as a flat list, for the evidence table. */
export function allTopics(): TopicRef[] {
  return orderedTopics().map(refOf);
}

/** A rendered topic plus its neighbours, or `null` if the slug is unknown. */
export function topic(slug: string): {
  ref: TopicRef;
  doc: Document;
  previous: TopicRef | null;
  next: TopicRef | null;
} | null {
  const found = topics.get(slug);
  if (!found) return null;

  const ordered = orderedTopics();
  const at = ordered.findIndex((candidate) => candidate.slug === slug);
  const neighbour = (offset: number): TopicRef | null => {
    const other = ordered[at + offset];
    return other && other.family === found.family ? refOf(other) : null;
  };

  return {
    ref: refOf(found),
    doc: parse(found.markdown, { rewrite: rewriteFromTopic }),
    previous: neighbour(-1),
    next: neighbour(1)
  };
}

/* ---------------------------------------------------------------------------
 * The guide
 * ------------------------------------------------------------------------ */

/** One `## ` section of the guide, rendered as its own page. */
export type PartRef = {
  /** URL slug, matching the GitHub anchor for the section's heading. */
  slug: string;
  /** `3` for `Part 3: Diagnostic frameworks`; empty for front and back matter. */
  number: string;
  /** Section title with any `Part N: ` prefix removed. */
  title: string;
  /** Opening paragraph, plain text. */
  summary: string;
  /** The `###` headings inside this part, for the contents. */
  sections: Heading[];
};

type Part = PartRef & { markdown: string };

/** Guide front matter: everything above the first `## ` heading. */
const guideOpening = guideMarkdown.split(/^## /m)[0];

/**
 * The guide's own contents list is written as `#anchor` links into a single
 * enormous GitHub page. This site paginates by part, so `/guide/` builds its
 * contents from the part manifest instead and this list is dropped rather than
 * shipped broken.
 */
const guideIntro = guideOpening.split(/^Contents:$/m)[0];

/** Split the guide into its `## ` sections, in document order. */
function splitParts(): Part[] {
  const blocks = guideMarkdown.split(/^## /m).slice(1);
  const slug = slugger();

  // The front matter's headings come first in GitHub's numbering, so feed them
  // through the shared slugger before any part, or a duplicate heading would
  // be numbered differently here than in the source.
  parse(guideOpening, { slug });

  return blocks.map((block) => {
    const newline = block.indexOf('\n');
    const heading = (newline === -1 ? block : block.slice(0, newline)).trim();
    const body = newline === -1 ? '' : block.slice(newline + 1);
    const numbered = heading.match(/^Part\s+(\d+):\s*(.+)$/);

    const part: Part = {
      slug: slug(plain(heading)),
      number: numbered ? numbered[1] : '',
      title: numbered ? numbered[2].trim() : heading,
      summary: summarize(body),
      // Filled in below, once every part's anchors are known.
      sections: [],
      markdown: body
    };

    part.sections = parse(body, { slug }).headings;
    return part;
  });
}

const parts = splitParts();

/**
 * Every anchor in the guide, mapped to the part page that now holds it.
 *
 * The source is one long document whose cross-references are all `#fragment`
 * links. Paginating it breaks every one of them unless they are rewritten, so
 * this map turns `#psychological-safety` into
 * `/guide/part-6-teams-and-individuals/#psychological-safety`.
 */
const anchorHome = new Map<string, string>();
for (const part of parts) {
  anchorHome.set(part.slug, part.slug);
  for (const heading of part.sections) anchorHome.set(heading.id, part.slug);
}

/** Rewrite a link written for the guide's `README.md` into a site URL. */
function rewriteFromGuide(href: string): string {
  if (href.startsWith('#')) {
    const anchor = href.slice(1);
    const home = anchorHome.get(anchor);
    if (!home) return href;
    return home === anchor ? `/guide/${home}/` : `/guide/${home}/#${anchor}`;
  }
  if (href === 'topics/' || href === 'topics') return '/topics/';
  const topicLink = href.match(/^topics\/([^/#]+)\/?(#.*)?$/);
  if (topicLink) return `/topics/${topicLink[1]}/${topicLink[2] ?? ''}`;
  return externalize(href);
}

/** Rewrite a link written inside `topics/<slug>/index.md` into a site URL. */
function rewriteFromTopic(href: string): string {
  if (href.startsWith('#')) return href;
  const sibling = href.match(/^\.\.\/([^/#]+)\/?(#.*)?$/);
  if (sibling) return `/topics/${sibling[1]}/${sibling[2] ?? ''}`;
  if (href === '../' || href === '../index.md') return '/topics/';
  if (href === '../../README.md' || href === '../../') return '/guide/';
  return externalize(href);
}

/**
 * Anything still pointing at a file in the source repository — `spec/index.md`,
 * `LICENSE.md` — is not published here, so send the reader to the file on
 * GitHub rather than to a 404.
 */
function externalize(href: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('/')) return href;
  return `${SOURCE_REPO}/blob/main/${href.replace(/^\.\//, '')}`;
}

/**
 * Every part rendered to HTML, keyed by slug.
 *
 * Rendering happens once here, in document order and through a single slugger,
 * rather than per page request. That is not only cheaper: it is what guarantees
 * the heading ids on a part page are the same ones `anchorHome` recorded, so
 * every rewritten cross-reference lands on a heading that exists.
 */
const rendered = new Map<string, Document>();
{
  const slug = slugger();
  parse(guideOpening, { slug });
  for (const each of parts) {
    slug(plain(headingOf(each)));
    rendered.set(each.slug, parse(each.markdown, { slug, rewrite: rewriteFromGuide }));
  }
}

/** Strip the markdown source before handing a part to a page. */
function partRefOf(part: Part): PartRef {
  const { markdown: _markdown, ...ref } = part;
  return ref;
}

/** Every part slug, for prerendering and the sitemap. */
export function partSlugs(): string[] {
  return parts.map((part) => part.slug);
}

/** The parts in reading order, for the guide contents. */
export function contents(): PartRef[] {
  return parts.map(partRefOf);
}

/** The guide's opening, above its contents list, rendered for `/guide/`. */
export function guideOverview(): Document {
  return parse(guideIntro, { rewrite: rewriteFromGuide });
}

/** The guide's title and lead sentence, for the home page and meta tags. */
export function guideSummary(): { title: string; summary: string } {
  return {
    title: guideMarkdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? 'Organizational Development',
    summary: summarize(guideIntro)
  };
}

/** A rendered part plus its neighbours, or `null` if the slug is unknown. */
export function part(slug: string): {
  ref: PartRef;
  doc: Document;
  previous: PartRef | null;
  next: PartRef | null;
} | null {
  const at = parts.findIndex((candidate) => candidate.slug === slug);
  if (at === -1) return null;

  return {
    ref: partRefOf(parts[at]),
    doc: rendered.get(slug)!,
    previous: at > 0 ? partRefOf(parts[at - 1]) : null,
    next: at < parts.length - 1 ? partRefOf(parts[at + 1]) : null
  };
}

/** Reconstruct a part's `## ` heading text, which is what the slugger consumed. */
function headingOf(part: Part): string {
  return part.number ? `Part ${part.number}: ${part.title}` : part.title;
}
