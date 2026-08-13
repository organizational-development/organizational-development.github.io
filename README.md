# organizational-development.github.io

The website for the **Organizational Development** guide:
<https://organizational-development.github.io>

The prose lives in
<https://github.com/organizational-development/organizational-development>.
This repository is only the site that renders it: SvelteKit, the
[Lily Design System™](https://github.com/LilyDesignSystem), and
`@sveltejs/adapter-static`, published to GitHub Pages as plain HTML.

## What the site publishes

* **The guide** at `/guide/` — the source `README.md`, split into one page per
  part, with its cross-references rewritten to work across the pages.
* **The topics** at `/topics/` — one page per model, framework, method, and
  system, grouped into the seven families of the source repository's canonical
  `topics/index.md` inventory, with each diagnostic model shown beside its
  paired questionnaire.
* **The evidence table** at `/evidence/` — every labelled topic ranked from
  `Strong` to `Very weak`, with the specific methodological objection quoted.
  This is the collection's distinguishing claim, so it gets its own page.

## Commands

```sh
pnpm install         # install dependencies
pnpm dev             # development server at http://localhost:5173
pnpm check           # svelte-check; must report 0 errors
pnpm build           # static site into build/
pnpm preview         # serve the production build
pnpm sync            # re-copy the prose from the source repository
```

`pnpm sync` assumes the two repositories are siblings:

```
organizational-development/
├── organizational-development/            <- the guide
└── organizational-development.github.io/  <- this site
```

Pass a path as the first argument if they are not.

## Layout

```
src/
├── app.html                 Loads the Lily theme, then the site stylesheet
├── content/                 Vendored copy of the guide — never edit by hand
│   ├── README.md            The guide
│   └── topics/<slug>.md     One file per topic
├── lib/
│   ├── content.ts           Types, the family manifest, the evidence vocabulary
│   ├── markdown.ts          Markdown rendering, GitHub-compatible heading ids
│   ├── EvidenceBadge.svelte The evidence rating, as a Lily badge
│   ├── helpers/             Lily ThemePicker and TextSizePicker
│   ├── lily/                Vendored Lily headless components
│   └── server/content.ts    Build-time access to the prose; never bundled
├── routes/                  Home, /guide/, /topics/, /evidence/, sitemap.xml
static/
├── assets/style.css         All of the site's own styling
└── assets/themes/*.css      The Lily themes offered by the theme picker
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which checks, builds,
and publishes to GitHub Pages. **Settings → Pages → Source must be set to
"GitHub Actions"**; with the default "Deploy from a branch", Jekyll publishes
this README instead and the workflow's artifact is ignored.

## License

The site code follows the license of the source repository. The guide's prose is
licensed there. Lily Design System™ is a trademark of its authors.
