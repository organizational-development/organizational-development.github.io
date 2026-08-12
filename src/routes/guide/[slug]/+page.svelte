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

  let { data } = $props();

  /** Only `###` sections go in the on-page contents; `####` would crowd it. */
  const sections = $derived(data.doc.headings.filter((heading) => heading.depth === 3));

  const label = (ref: { number: string; title: string }) =>
    ref.number ? `Part ${ref.number}: ${ref.title}` : ref.title;
</script>

<svelte:head>
  <title>{label(data.ref)} — Organizational Development</title>
  <meta name="description" content={data.ref.summary || data.ref.title} />
</svelte:head>

<ArticleLayout class="page page-part">
  <BreadcrumbNav label="Breadcrumb" class="page-breadcrumb">
    <BreadcrumbList>
      <BreadcrumbListItem><a href="/">Home</a></BreadcrumbListItem>
      <BreadcrumbListItem><a href="/guide/">Guide</a></BreadcrumbListItem>
      <BreadcrumbListItem current>
        {data.ref.number ? `Part ${data.ref.number}` : data.ref.title}
      </BreadcrumbListItem>
    </BreadcrumbList>
  </BreadcrumbNav>

  <header class="page-header">
    {#if data.ref.number}
      <p class="page-eyebrow">Part {data.ref.number}</p>
    {/if}
    <h1>{data.ref.title}</h1>
  </header>

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

  <PaginationNav label="Guide" class="page-pagination">
    <PaginationList>
      <PaginationListItem class="page-pagination-previous">
        {#if data.previous}
          <a href="/guide/{data.previous.slug}/" rel="prev">
            <span class="page-pagination-direction">Previous</span>
            <span class="page-pagination-label">{label(data.previous)}</span>
          </a>
        {/if}
      </PaginationListItem>
      <PaginationListItem class="page-pagination-next">
        {#if data.next}
          <a href="/guide/{data.next.slug}/" rel="next">
            <span class="page-pagination-direction">Next</span>
            <span class="page-pagination-label">{label(data.next)}</span>
          </a>
        {/if}
      </PaginationListItem>
    </PaginationList>
  </PaginationNav>
</ArticleLayout>
