// Markdown rendering for the guide and the topics.
//
// Every page of this site is prerendered by adapter-static, so everything here
// runs at build time and never ships to the browser. That is deliberate: the
// guide alone is ~180 KB of markdown and the topics add 82 more files, none of
// which needs a client-side markdown parser.

import { Marked, Renderer } from 'marked';

/** The stock renderers, so the overrides below only have to add a wrapper. */
const defaultTable = Renderer.prototype.table;
const defaultLink = Renderer.prototype.link;

/** One heading lifted out of a document, for building an on-page contents nav. */
export type Heading = {
  /** Heading depth: 2 for `##`, 3 for `###`. */
  depth: number;
  /** Heading text, plain (no markup). */
  text: string;
  /** The `id` attribute given to the heading, for `#fragment` links. */
  id: string;
};

/** A markdown document split into the parts a page needs. */
export type Document = {
  /** The `# ` heading text, or `''` when the source has none. */
  title: string;
  /** The opening paragraph as plain text, for page leads and meta tags. */
  summary: string;
  /** Body HTML, with the `# ` title removed since pages render it themselves. */
  html: string;
  /** `##` and `###` headings in document order. */
  headings: Heading[];
};

/** How a link in the source markdown maps onto a URL on this site. */
export type LinkRewriter = (href: string) => string;

/**
 * Turn heading text into a URL fragment the way GitHub does: lowercase, drop
 * punctuation, then replace runs of whitespace with hyphens. A repeat of an
 * earlier heading gets a `-1`, `-2`, … suffix.
 *
 * Matching GitHub exactly matters here, because the guide's cross-references
 * were written against GitHub's anchors. Two details are easy to get wrong and
 * both bite:
 *
 *   - Punctuation is *deleted*, not turned into a hyphen. "Conway's law" is
 *     `conways-law`, not `conway-s-law`, and every link in the guide says so.
 *   - Non-ASCII letters survive, which is why the class is `\p{L}\p{N}` rather
 *     than `a-z0-9`: the change curve anchor is `#kübler-ross-change-curve`.
 */
export function slugger() {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base =
      text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
        .trim()
        .replace(/\s+/g, '-') || 'section';
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    // GitHub numbers the *second* occurrence `-1`, not `-2`.
    return count === 1 ? base : `${base}-${count - 1}`;
  };
}

/** Strip markup from a markdown fragment, leaving readable plain text. */
export function plain(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Options for one `parse` call. */
export type ParseOptions = {
  /**
   * A slugger shared across several calls. The guide is rendered one part at a
   * time but its anchors have to be unique across the whole document, so the
   * caller passes one slugger through every part in document order.
   */
  slug?: ReturnType<typeof slugger>;
  /** Rewrites source-repository link targets into site URLs. */
  rewrite?: LinkRewriter;
  /** Keep the `# ` title in the body. Off by default; pages render it. */
  keepTitle?: boolean;
};

/**
 * Parse one markdown document.
 *
 * A fresh `Marked` instance per call keeps the heading slugger's duplicate
 * counter scoped where the caller wants it — a shared global instance would let
 * one topic's ids leak into the next.
 */
export function parse(markdown: string, options: ParseOptions = {}): Document {
  const slug = options.slug ?? slugger();
  const rewrite = options.rewrite;
  const headings: Heading[] = [];

  const marked = new Marked({
    gfm: true,
    renderer: {
      heading(token) {
        const text = this.parser.parseInline(token.tokens);
        const bare = plain(token.text);
        const id = slug(bare);
        if (token.depth === 2 || token.depth === 3) {
          headings.push({ depth: token.depth, text: bare, id });
        }
        return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
      },

      /**
       * Rewrite links that point at the source repository's file layout.
       *
       * The prose is written for GitHub, where `../psychological-safety/` opens
       * a directory and its `README.md` symlink renders. On this site the same
       * material lives at `/topics/psychological-safety/`, so every such link
       * is translated rather than left to 404.
       */
      link(token) {
        if (!rewrite) return defaultLink.call(this, token);
        return defaultLink.call(this, { ...token, href: rewrite(token.href) });
      },

      /**
       * Wrap every table in a scrolling container.
       *
       * The guide's tables compare five or six columns of frameworks and
       * evidence ratings. Narrowing them to a phone would make them unreadable,
       * and letting them set the page width makes everything else unreadable,
       * so the table scrolls inside its own box. `tabindex` makes that scroll
       * region reachable from the keyboard, which WCAG 2.1.1 requires of any
       * scrollable content.
       */
      table(token) {
        const html = defaultTable.call(this, token);
        return `<div class="prose-scroll" role="region" aria-label="Table" tabindex="0">${html}</div>\n`;
      }
    }
  });

  const lines = markdown.split('\n');

  // The first `# ` line is the document title; pages render it themselves in a
  // page header, so drop it from the body to avoid a duplicate h1.
  let cursor = 0;
  let title = '';
  while (cursor < lines.length) {
    const line = lines[cursor];
    cursor += 1;
    if (line.startsWith('# ')) {
      title = line.slice(2).trim();
      break;
    }
  }

  const body = options.keepTitle || !title ? markdown : lines.slice(cursor).join('\n');
  const html = marked.parse(body) as string;

  return { title, summary: summarize(markdown), html, headings };
}

/**
 * The document's opening paragraph, as plain text.
 *
 * Topics open with a definition paragraph — what the thing is, who created it,
 * and when — which is exactly the right text for a card and a meta description.
 * Skip the title, any blockquote, and any list, so a file that opens with a
 * contents list does not describe itself as "Contents: Introduction, Part 1".
 */
export function summarize(markdown: string): string {
  const blocks = markdown
    .replace(/^#\s+.*$/m, '')
    .split(/\n\s*\n/)
    .map((block) => block.trim());

  for (const block of blocks) {
    if (!block) continue;
    if (/^[#>*\-|]/.test(block)) continue;
    if (block.startsWith('**Evidence:')) continue;
    if (/^(Use when|Do not use when|See |Rate |Legend)/.test(block)) continue;
    return plain(block);
  }
  return '';
}
