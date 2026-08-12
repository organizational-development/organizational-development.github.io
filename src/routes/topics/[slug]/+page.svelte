<script lang="ts">
  import ArticleLayout from '$lib/lily/ArticleLayout.svelte';
  import BreadcrumbNav from '$lib/lily/BreadcrumbNav.svelte';
  import BreadcrumbList from '$lib/lily/BreadcrumbList.svelte';
  import BreadcrumbListItem from '$lib/lily/BreadcrumbListItem.svelte';
  import ContentsNav from '$lib/lily/ContentsNav.svelte';
  import ContentsLink from '$lib/lily/ContentsLink.svelte';
  import PaginationNav from '$lib/lily/PaginationNav.svelte';
  import PaginationList from '$lib/lily/PaginationList.svelte';
  import PaginationListItem from '$lib/lily/PaginationListItem.svelte';
  import EvidenceBadge from '$lib/EvidenceBadge.svelte';
  import { FAMILIES, UNFILED } from '$lib/content';

  let { data } = $props();

  const family = $derived(
    [...FAMILIES, UNFILED].find((candidate) => candidate.id === data.ref.family)
  );

  /** Only top-level sections go in the on-page contents; `###` would crowd it. */
  const sections = $derived(data.doc.headings.filter((heading) => heading.depth === 2));
</script>

<svelte:head>
  <title>{data.ref.title} — Organizational Development</title>
  <meta name="description" content={data.ref.summary || data.ref.title} />
</svelte:head>

<ArticleLayout class="page page-topic">
  <BreadcrumbNav label="Breadcrumb" class="page-breadcrumb">
    <BreadcrumbList>
      <BreadcrumbListItem><a href="/">Home</a></BreadcrumbListItem>
      <BreadcrumbListItem><a href="/topics/">Topics</a></BreadcrumbListItem>
      {#if family}
        <BreadcrumbListItem><a href="/topics/#{family.id}">{family.title}</a></BreadcrumbListItem>
      {/if}
      <BreadcrumbListItem current>{data.ref.title}</BreadcrumbListItem>
    </BreadcrumbList>
  </BreadcrumbNav>

  <header class="page-header">
    <p class="page-eyebrow">{data.ref.model ? 'Questionnaire' : 'Topic'}</p>
    <h1>{data.ref.title}</h1>

    {#if data.ref.evidence}
      <!--
        The rating is repeated here from the prose below on purpose: it is the
        first thing a reader should see about a model, and the one thing most
        published OD writing leaves out.
      -->
      <p class="topic-evidence">
        <EvidenceBadge
          strength={data.ref.evidence.strength}
          label={data.ref.evidence.label}
          class="topic-evidence-badge"
        />
        <span class="topic-evidence-label">{data.ref.evidence.label}</span>
      </p>
    {/if}
  </header>

  {#if data.ref.questionnaire}
    <p class="topic-pair">
      Paired instrument:
      <a href="/topics/{data.ref.questionnaire}/">{data.ref.title} questionnaire</a>
    </p>
  {:else if data.ref.model}
    <p class="topic-pair">
      Operationalizes the model: <a href="/topics/{data.ref.model}/">{data.ref.model}</a>
    </p>
  {/if}

  {#if sections.length > 1}
    <ContentsNav label="On this page" class="page-toc">
      <h2 class="page-toc-heading">On this page</h2>
      {#each sections as section (section.id)}
        <ContentsLink class="page-toc-item">
          <a href="#{section.id}">{section.text}</a>
        </ContentsLink>
      {/each}
    </ContentsNav>
  {/if}

  <div class="prose">
    <!-- Rendered at build time from the guide's own markdown; not user input. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html data.doc.html}
  </div>

  <PaginationNav label="Topic" class="page-pagination">
    <PaginationList>
      <PaginationListItem class="page-pagination-previous">
        {#if data.previous}
          <a href="/topics/{data.previous.slug}/" rel="prev">
            <span class="page-pagination-direction">Previous</span>
            <span class="page-pagination-label">{data.previous.title}</span>
          </a>
        {/if}
      </PaginationListItem>
      <PaginationListItem class="page-pagination-next">
        {#if data.next}
          <a href="/topics/{data.next.slug}/" rel="next">
            <span class="page-pagination-direction">Next</span>
            <span class="page-pagination-label">{data.next.title}</span>
          </a>
        {/if}
      </PaginationListItem>
    </PaginationList>
  </PaginationNav>
</ArticleLayout>
