<script lang="ts">
  import ArticleLayout from '$lib/lily/ArticleLayout.svelte';
  import BreadcrumbNav from '$lib/lily/BreadcrumbNav.svelte';
  import BreadcrumbList from '$lib/lily/BreadcrumbList.svelte';
  import BreadcrumbListItem from '$lib/lily/BreadcrumbListItem.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>The guide — Organizational Development</title>
  <meta name="description" content={data.guide.summary} />
</svelte:head>

<ArticleLayout class="page page-contents">
  <BreadcrumbNav label="Breadcrumb" class="page-breadcrumb">
    <BreadcrumbList>
      <BreadcrumbListItem><a href="/">Home</a></BreadcrumbListItem>
      <BreadcrumbListItem current>Guide</BreadcrumbListItem>
    </BreadcrumbList>
  </BreadcrumbNav>

  <header class="page-header">
    <p class="page-eyebrow">The guide</p>
    <h1>{data.guide.title}</h1>
  </header>

  <div class="prose">
    <!-- Rendered at build time from the guide's own markdown; not user input. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html data.overview.html}
  </div>

  <nav class="contents" aria-label="Contents">
    <ol class="contents-parts">
      {#each data.parts as part (part.slug)}
        <li class="contents-part">
          <h2 class="contents-part-heading">
            <a href="/guide/{part.slug}/">
              {#if part.number}<span class="contents-part-number">Part {part.number}</span>{/if}
              <span class="contents-part-title">{part.title}</span>
            </a>
          </h2>
          {#if part.sections.length}
            <ul class="contents-sections">
              {#each part.sections.filter((section) => section.depth === 3) as section (section.id)}
                <li>
                  <a href="/guide/{part.slug}/#{section.id}">{section.text}</a>
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
</ArticleLayout>
