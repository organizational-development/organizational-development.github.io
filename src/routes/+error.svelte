<script lang="ts">
  import { page } from '$app/state';
  import ArticleLayout from '$lib/lily/ArticleLayout.svelte';
</script>

<svelte:head>
  <title>{page.status} — Organizational Development</title>
</svelte:head>

<ArticleLayout class="page">
  <header class="page-header">
    <p class="page-eyebrow">Error {page.status}</p>
    <h1>{page.status === 404 ? 'That page is not here' : 'Something went wrong'}</h1>
    <p class="page-lead">{page.error?.message ?? 'Unknown error'}</p>
  </header>

  <p>
    Try <a href="/guide/">the guide</a>, the <a href="/topics/">topics</a>, or the
    <a href="/evidence/">evidence table</a>.
  </p>
</ArticleLayout>
