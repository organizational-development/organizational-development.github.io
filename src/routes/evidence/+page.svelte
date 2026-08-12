<script lang="ts">
  import ArticleLayout from '$lib/lily/ArticleLayout.svelte';
  import BreadcrumbNav from '$lib/lily/BreadcrumbNav.svelte';
  import BreadcrumbList from '$lib/lily/BreadcrumbList.svelte';
  import BreadcrumbListItem from '$lib/lily/BreadcrumbListItem.svelte';
  import SectionHeading from '$lib/lily/SectionHeading.svelte';
  import EvidenceBadge from '$lib/EvidenceBadge.svelte';
  import { STRENGTH_NOTES } from '$lib/content';

  let { data } = $props();
</script>

<svelte:head>
  <title>Evidence — Organizational Development</title>
  <meta
    name="description"
    content="Every organizational development model in this collection, ranked by how strong the evidence behind it actually is, with the specific methodological objection named."
  />
</svelte:head>

<ArticleLayout class="page page-evidence">
  <BreadcrumbNav label="Breadcrumb" class="page-breadcrumb">
    <BreadcrumbList>
      <BreadcrumbListItem><a href="/">Home</a></BreadcrumbListItem>
      <BreadcrumbListItem current>Evidence</BreadcrumbListItem>
    </BreadcrumbList>
  </BreadcrumbNav>

  <header class="page-header">
    <p class="page-eyebrow">The honest table</p>
    <h1>What the evidence actually says</h1>
    <p class="page-lead">
      {data.labelled} of the {data.labelled + data.unlabelled} topics carry an evidence label, ranked
      here from strongest to weakest. Most published OD writing presents every framework as equally
      sound. This distribution is unflattering to the field, and it is the accurate picture.
    </p>
  </header>

  <div class="prose">
    <p>
      Read a weak rating as a warning about what a model can be <em>used for</em>, not as a reason to
      throw it away. Several weak models are excellent shared vocabulary and terrible measurement
      instruments; the label and its justification say which. Where a better-evidenced alternative
      exists, the topic links to it.
    </p>
  </div>

  {#each data.groups as group (group.strength)}
    <section class="evidence-group" id={group.strength.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
      <SectionHeading
        heading={group.strength}
        subtitle={STRENGTH_NOTES[group.strength]}
        eyebrow={`${group.topics.length} ${group.topics.length === 1 ? 'topic' : 'topics'}`}
      />

      <!--
        A scrollable region must be keyboard reachable (WCAG 2.1.1), which is
        exactly what `tabindex` does here; the `region` role gives it the
        accessible name a tab stop needs.
      -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="prose-scroll" role="region" aria-label={`${group.strength} topics`} tabindex="0">
        <table class="evidence-table">
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Rating as written</th>
              <th scope="col">Why</th>
            </tr>
          </thead>
          <tbody>
            {#each group.topics as topic (topic.slug)}
              <tr>
                <th scope="row"><a href="/topics/{topic.slug}/">{topic.title}</a></th>
                <td>
                  <EvidenceBadge
                    strength={topic.evidence!.strength}
                    label={topic.evidence!.label}
                  />
                  {#if topic.evidence!.label !== topic.evidence!.strength}
                    <span class="evidence-table-label">{topic.evidence!.label}</span>
                  {/if}
                </td>
                <td class="evidence-table-detail">{topic.evidence!.detail}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/each}
</ArticleLayout>
