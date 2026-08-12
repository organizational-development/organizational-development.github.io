<script lang="ts">
  import ArticleLayout from '$lib/lily/ArticleLayout.svelte';
  import BreadcrumbNav from '$lib/lily/BreadcrumbNav.svelte';
  import BreadcrumbList from '$lib/lily/BreadcrumbList.svelte';
  import BreadcrumbListItem from '$lib/lily/BreadcrumbListItem.svelte';
  import ContentsNav from '$lib/lily/ContentsNav.svelte';
  import ContentsLink from '$lib/lily/ContentsLink.svelte';
  import Card from '$lib/lily/Card.svelte';
  import SectionHeading from '$lib/lily/SectionHeading.svelte';
  import EvidenceBadge from '$lib/EvidenceBadge.svelte';

  let { data } = $props();

  /**
   * Questionnaires are listed on their model's card rather than as cards of
   * their own. Pairing is the point: an instrument separated from the model it
   * operationalizes invites confident misreading of the scores.
   */
  const models = (topics: typeof data.families[number]['topics']) =>
    topics.filter((topic) => !topic.model);

  const titleOf = (topics: typeof data.families[number]['topics'], slug: string) =>
    topics.find((topic) => topic.slug === slug)?.title ?? 'Questionnaire';
</script>

<svelte:head>
  <title>Topics — Organizational Development</title>
  <meta
    name="description"
    content={`All ${data.topicCount} organizational development topics: models, frameworks, methods, and systems, each with an evidence rating.`}
  />
</svelte:head>

<ArticleLayout class="page page-topics">
  <BreadcrumbNav label="Breadcrumb" class="page-breadcrumb">
    <BreadcrumbList>
      <BreadcrumbListItem><a href="/">Home</a></BreadcrumbListItem>
      <BreadcrumbListItem current>Topics</BreadcrumbListItem>
    </BreadcrumbList>
  </BreadcrumbNav>

  <header class="page-header">
    <p class="page-eyebrow">Reference</p>
    <h1>Topics</h1>
    <p class="page-lead">
      {data.topicCount} reference files, one per model, framework, method, and system. Each says what
      the thing is, where it came from, when to use it, when not to, what the evidence supports, and
      what it costs to run. Diagnostic models carry a paired questionnaire.
    </p>
  </header>

  <ContentsNav label="Families" class="page-toc">
    <h2 class="page-toc-heading">Families</h2>
    {#each data.families as family (family.id)}
      <ContentsLink class="page-toc-item">
        <a href="#{family.id}">{family.title}</a>
      </ContentsLink>
    {/each}
  </ContentsNav>

  {#each data.families as family (family.id)}
    <section class="topic-family" id={family.id}>
      <SectionHeading
        heading={family.title}
        subtitle={family.tagline}
        eyebrow={`${models(family.topics).length} topics`}
      />

      <div class="topic-grid">
        {#each models(family.topics) as topic (topic.slug)}
          <Card class="topic-card" heading={topic.title} href="/topics/{topic.slug}/">
            {#if topic.evidence}
              <p class="topic-card-evidence">
                <EvidenceBadge strength={topic.evidence.strength} label={topic.evidence.label} />
                {#if topic.evidence.label !== topic.evidence.strength}
                  <span class="topic-card-evidence-label">{topic.evidence.label}</span>
                {/if}
              </p>
            {/if}
            <p class="topic-card-summary">{topic.summary}</p>
            {#if topic.questionnaire}
              <p class="topic-card-questionnaire">
                <a href="/topics/{topic.questionnaire}/">
                  {titleOf(family.topics, topic.questionnaire)}
                </a>
              </p>
            {/if}
          </Card>
        {/each}
      </div>
    </section>
  {/each}
</ArticleLayout>
