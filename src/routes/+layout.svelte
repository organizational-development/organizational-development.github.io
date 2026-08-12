<script lang="ts">
  import { page } from '$app/state';
  import SkipLink from '$lib/lily/SkipLink.svelte';
  import GrailLayout from '$lib/lily/GrailLayout.svelte';
  import GrailLayoutTopHeader from '$lib/lily/GrailLayoutTopHeader.svelte';
  import GrailLayoutCenterMain from '$lib/lily/GrailLayoutCenterMain.svelte';
  import GrailLayoutBottomFooter from '$lib/lily/GrailLayoutBottomFooter.svelte';
  import ThemePicker from '$lib/helpers/ThemePicker.svelte';
  import TextSizePicker from '$lib/helpers/TextSizePicker.svelte';
  import { SOURCE_REPO } from '$lib/content';

  let { children } = $props();

  const THEMES = [
    'light',
    'dark',
    'nord',
    'dracula',
    'corporate',
    'business',
    'united-kingdom-government-digital-service',
    'united-kingdom-national-health-service-england-for-practitioners',
    'united-states-web-design-system'
  ];

  const THEME_LABELS: Record<string, string> = {
    light: 'Light',
    dark: 'Dark',
    nord: 'Nord',
    dracula: 'Dracula',
    corporate: 'Corporate',
    business: 'Business',
    'united-kingdom-government-digital-service': 'UK Government',
    'united-kingdom-national-health-service-england-for-practitioners': 'NHS England',
    'united-states-web-design-system': 'US Web Design System'
  };

  const TEXT_SIZES = ['small', 'medium', 'large', 'x-large'];

  const siteLinks = [
    { href: '/guide/', label: 'Guide' },
    { href: '/topics/', label: 'Topics' },
    { href: '/evidence/', label: 'Evidence' }
  ];

  /** A nav link is current for its own page and for everything beneath it. */
  const isCurrent = (href: string) => page.url.pathname.startsWith(href);
</script>

<SkipLink href="#main" label="Skip to main content" />

<GrailLayout class="site">
  <GrailLayoutTopHeader class="site-header">
    <a class="site-brand" href="/">
      <span class="site-brand-title">Organizational Development</span>
      <span class="site-brand-subtitle">A practitioner's guide for knowledge workers</span>
    </a>

    <nav class="site-nav" aria-label="Site">
      {#each siteLinks as link (link.href)}
        <a href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}>
          {link.label}
        </a>
      {/each}
      <a href={SOURCE_REPO} rel="noopener">Source</a>
    </nav>

    <div class="site-controls">
      <TextSizePicker
        label="Text size"
        sizes={TEXT_SIZES}
        defaultValue="medium"
        storageKey="organizational-development-text-size"
      />
      <ThemePicker
        label="Theme"
        themesUrl="/assets/themes/"
        themes={THEMES}
        themeLabels={THEME_LABELS}
        defaultValue="light"
        detectFromSystem
        storageKey="organizational-development-theme"
      />
    </div>
  </GrailLayoutTopHeader>

  <GrailLayoutCenterMain class="site-main" id="main">
    {@render children()}
  </GrailLayoutCenterMain>

  <GrailLayoutBottomFooter class="site-footer">
    <p>
      <strong>Organizational Development</strong> — a comprehensive practitioner's guide to OD for
      health care professionals, software engineers, and senior executives. Every framework says
      what the evidence is, and where it is weak.
    </p>
    <p>
      Source and contributions:
      <a href={SOURCE_REPO} rel="noopener">github.com/organizational-development</a>. Built with the
      <a href="https://github.com/LilyDesignSystem" rel="noopener">Lily Design System™</a>.
    </p>
  </GrailLayoutBottomFooter>
</GrailLayout>
