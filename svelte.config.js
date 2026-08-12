import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Static site configuration, following
 * https://svelte.dev/docs/kit/adapter-static#GitHub-Pages
 *
 * Every route prerenders (see `src/routes/+layout.ts`), so the whole guide ships
 * as plain HTML files that GitHub Pages serves directly — no server runtime.
 *
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      // GitHub Pages serves 404.html for any unmatched path, so this is both
      // the SPA fallback and the real "page not found" page.
      fallback: '404.html',
      // Pages compresses responses itself, so shipping .gz/.br alongside every
      // file would only enlarge the artifact.
      precompress: false,
      // Fail the build on a route that cannot be prerendered, rather than
      // quietly publishing a site with a hole in it.
      strict: true
    }),

    /*
     * `paths.base` is deliberately not set.
     *
     * The adapter-static docs pair `paths.base` with a
     * `BASE_PATH: '/${{ github.event.repository.name }}'` step in the deploy
     * workflow. That is for a *project* site served from a subpath at
     * user.github.io/repo. This repository is named
     * organizational-development.github.io, which makes it the organization's
     * root site: it is served from the domain root, so the base path is empty
     * and copying that step would prefix every URL with
     * `/organizational-development.github.io` and break the whole site.
     */

    prerender: {
      // Guide parts carry cross-references into headings that live on other
      // part pages, and topics cross-link each other by name. Demote the
      // missing-id check so a cross-reference typo warns rather than failing
      // the whole build.
      handleMissingId: 'warn'
    }
  }
};

export default config;
