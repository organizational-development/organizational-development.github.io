<script lang="ts">
  import ArticleLayout from '$lib/lily/ArticleLayout.svelte';
  import Card from '$lib/lily/Card.svelte';
  import SectionHeading from '$lib/lily/SectionHeading.svelte';
  import EvidenceBadge from '$lib/EvidenceBadge.svelte';
  import { STRENGTH_NOTES, SOURCE_REPO } from '$lib/content';

  let { data } = $props();

  const description =
    'A comprehensive practitioner’s guide to organizational development for health care ' +
    'professionals, software engineers, and senior executives — with an evidence rating on ' +
    'every model.';
</script>

<svelte:head>
  <title>Organizational Development — a practitioner's guide</title>
  <meta name="description" content={description} />
</svelte:head>

<ArticleLayout class="page page-home">
  <header class="home-hero">
    <h1>Organizational development, with the evidence stated</h1>
    <p class="page-lead">
      A comprehensive guide for knowledge workers — health care professionals, software engineers,
      and senior executives. Every framework says what it is, when to use it, when
      <em>not</em> to, and how strong the evidence behind it actually is.
    </p>
    <p class="home-actions">
      <a class="home-action home-action-primary" href="/guide/">Read the guide</a>
      <a class="home-action" href="/topics/">Browse {data.topicCount} topics</a>
      <a class="home-action" href="/evidence/">See the evidence table</a>
    </p>
  </header>

  <section class="home-section" aria-labelledby="what-this-is">
    <SectionHeading
      id="what-this-is"
      heading="What this is"
      subtitle="One guide you can read end to end, and one reference file per model behind it."
    />
    <div class="home-grid">
      <Card class="home-card" heading="The guide" href="/guide/">
        <p>
          Eleven parts, from foundations and the OD process through diagnosis, change, culture,
          teams, interventions, measurement, and anti-patterns. Self-contained: you can act without
          following a single link.
        </p>
      </Card>
      <Card class="home-card" heading="The topics" href="/topics/">
        <p>
          {data.topicCount} reference files, one per model, framework, method, and system — each with
          its origin, its structure, worked examples for all three audiences, and its limitations.
        </p>
      </Card>
      <Card class="home-card" heading="The questionnaires" href="/topics/#diagnostic-models">
        <p>
          Every diagnostic model is paired with an operational instrument: numbered steps, rating
          scales, and a closing analysis section that says how to read the scores.
        </p>
      </Card>
    </div>
  </section>

  <section class="home-section" aria-labelledby="the-evidence">
    <SectionHeading
      id="the-evidence"
      heading="The evidence, counted"
      subtitle="Most OD writing presents every framework as equally sound. This collection does not."
    />
    <p>
      Each model carries an evidence label with a specific, named objection rather than a generic
      hedge. Across {data.modelCount} models the distribution is unflattering to the field — and that
      is the accurate picture. A weak model can still be a useful vocabulary; the label says which
      job it can and cannot do. Questionnaires are not counted here: each one inherits the rating of
      the model it operationalizes.
    </p>
    <!--
      A scrollable region must be keyboard reachable (WCAG 2.1.1), which is
      exactly what `tabindex` does here; the `region` role gives it the
      accessible name a tab stop needs.
    -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="prose-scroll" role="region" aria-label="Evidence distribution" tabindex="0">
      <table class="home-distribution">
        <thead>
          <tr>
            <th scope="col">Strength</th>
            <th scope="col">Topics</th>
            <th scope="col">What it means</th>
          </tr>
        </thead>
        <tbody>
          {#each data.distribution as entry (entry.strength)}
            <tr>
              <th scope="row"><EvidenceBadge strength={entry.strength} /></th>
              <td class="home-distribution-count">{entry.count}</td>
              <td>{STRENGTH_NOTES[entry.strength]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p><a href="/evidence/">Every topic, ranked by evidence strength →</a></p>
  </section>

  <section class="home-section" aria-labelledby="the-families">
    <SectionHeading
      id="the-families"
      heading="Where to start"
      subtitle="Seven families of material. Diagnose before you change; measure before you claim."
    />
    <div class="home-grid">
      {#each data.families as family (family.id)}
        <Card class="home-card" heading={family.title} href="/topics/#{family.id}">
          <p class="home-card-tagline">{family.tagline}</p>
          <p class="home-card-count">{family.count} topics</p>
          <ul class="home-card-list">
            {#each family.strongest as topic (topic.slug)}
              <li>
                <a href="/topics/{topic.slug}/">{topic.title}</a>
                {#if topic.evidence}
                  <EvidenceBadge strength={topic.evidence.strength} />
                {/if}
              </li>
            {/each}
          </ul>
        </Card>
      {/each}
    </div>
  </section>

  <section class="home-section" aria-labelledby="the-parts">
    <SectionHeading
      id="the-parts"
      heading="The guide, part by part"
      subtitle="Read it in order, or jump to the part you need."
    />
    <ol class="home-parts">
      {#each data.parts as part (part.slug)}
        <li>
          <a href="/guide/{part.slug}/"><span class="home-part-number">Part {part.number}</span>
            <span class="home-part-title">{part.title}</span></a>
        </li>
      {/each}
    </ol>
  </section>

  <section class="home-section" aria-labelledby="colophon">
    <SectionHeading id="colophon" heading="Colophon" />
    <p>
      The prose lives in <a href={SOURCE_REPO} rel="noopener">the source repository</a> and is
      vendored into this site, which is built with SvelteKit and the
      <a href="https://github.com/LilyDesignSystem" rel="noopener">Lily Design System™</a> and served
      as static files by GitHub Pages. Corrections and additions are welcome as pull requests
      against the source.
    </p>
  </section>
</ArticleLayout>
