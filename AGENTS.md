# AGENTS.md

Guidance for AI agents working on this repository. Read `README.md` first for
the layout and the commands.

## What this repository is, and is not

This is the **website** for the Organizational Development guide. It is not the
guide.

The prose lives in
<https://github.com/organizational-development/organizational-development>.
`src/content/` is a vendored copy of it.

**Never edit `src/content/`.** An edit there is lost the next time anyone runs
`pnpm sync`, and it silently forks the guide from its source of truth. To fix a
typo in a topic, fix it in the guide repository, then run `pnpm sync` here.

## Conventions

- **Prerendered, always.** `src/routes/+layout.ts` sets `prerender = true`.
  Every route must be prerenderable: no runtime server code, no request-time
  data. A new dynamic route needs an `entries()` export so adapter-static knows
  what to emit.
- **Content stays server-side.** Anything that reads `src/content/` belongs in
  `src/lib/server/`, which SvelteKit refuses to bundle into client code. The
  guide alone is 180 KB; a stray client-side import would ship all of it to
  every reader.
- **Heading ids must match GitHub's.** The guide's cross-references are
  `#fragment` links written against GitHub's anchors, and paginating the guide
  rewrites every one of them. `slugger()` in `src/lib/markdown.ts` deletes
  punctuation rather than hyphenating it — `conways-law`, not `conway-s-law` —
  and numbers a repeated heading `-1`, not `-2`. Change that function and
  hundreds of links move silently.
- **Lily components are vendored, not imported from npm.** They live in
  `src/lib/lily/` and `src/lib/helpers/`, copied verbatim from the Lily Design
  System repository. To add a component, copy its `.svelte` file across rather
  than reaching outside this repository.
- **Lily components are headless.** They carry class names and no styles. Put
  styling in `static/assets/style.css`, never in a component `<style>` block, so
  that all of the site's appearance is in one file and every theme keeps
  working.
- **The theme wins by default.** The active Lily theme states nearly everything
  inside `:where()`, which has zero specificity, so a plain class selector in
  `style.css` overrides it. If a rule seems not to apply, check whether the
  theme is styling a *parent* — `.section-heading`, for instance, is sized and
  bolded on the container, so `em` units on its children compound off that.
- **Sizes scale from `--text-base`,** which the `TextSizePicker` drives via
  `data-text-size` on `<html>`. Use `em` or that variable; a hard-coded `px`
  font size ignores the reader's choice.
- **The evidence rating is never colour alone.** `EvidenceBadge` always prints
  the word. Colour is a second cue, and it uses the theme's own semantic pairs
  (`--color-error` with `--color-error-content`) so contrast survives all of the
  themes in `static/assets/themes/`.

## Adding a topic

Topics come from the source repository, so the only work here is placement: add
the new slug to the right family in `FAMILIES` in `src/lib/content.ts`. A topic
missing from that manifest still gets a page, but it lands under "Additional
topics" and the build prints a warning naming it. Questionnaires are never
listed: `<model>-questionnaire` inherits its model's family automatically and is
rendered beside it.

**Take the grouping from upstream, not from taste.** The families and their
order mirror `topics/index.md` in the source repository, which is its canonical
inventory. Re-grouping here would mean a reader who finds `just-culture` under
*Culture models* upstream finds it somewhere else on the site. If a grouping
looks wrong, argue it upstream and re-sync.

The sync is one-directional and the site always loses:

```sh
pnpm sync     # copies README.md and topics/<name>/index.md into src/content/
pnpm build    # read the output: "[content]" warnings name unfiled topics
```

## Before committing

```sh
pnpm check    # svelte-check: must report 0 errors
pnpm build    # must complete with no `handleMissingId` warnings
```

A `handleMissingId` warning means a cross-reference now points at a heading that
does not exist on the target page. It is demoted to a warning so a single typo
upstream cannot break the deploy — which makes it your job to read the build
output rather than trust the exit code.

Then check the built site rather than trusting the build log. Serve `build/` as
a plain static directory — that is what GitHub Pages does, and `vite preview`
can disagree with it:

```sh
cd build && python3 -m http.server 4190
```

Verify at 1440px and at 390px that no page scrolls horizontally, that the theme
and text-size pickers work, and that the console is clean.

## Things that have bitten before

- **Apostrophes in headings.** "Conway's law" is `conways-law` on GitHub and
  `conway-s-law` under a naive slugger. The whole cross-reference graph depends
  on getting this right; see `slugger()`.
- **Wide tables.** The guide compares five or six columns of frameworks against
  evidence. Tables are wrapped in a scrolling `.prose-scroll` region by the
  markdown renderer; do not remove the wrapper to "fix" a table's appearance.
- **Bare URLs.** Topics end in autolinked source URLs with no spaces to break
  at. `.prose a { overflow-wrap: anywhere }` is what keeps them from setting the
  page width on a phone.
- **pnpm build scripts.** `pnpm-workspace.yaml` must set `allowBuilds.esbuild`
  to a real boolean. `sv create` writes a placeholder string there, and that
  fails every later `pnpm install --frozen-lockfile`, including in CI.
