<script lang="ts">
  // The evidence rating, shown as a Lily badge.
  //
  // `data-strength` carries the rating down to the stylesheet, which is where
  // the colour lives: the Lily components are headless, so nothing here styles
  // itself. Ratings are ordinal, not categorical, so `style.css` gives them a
  // single ramp from strong to very weak rather than seven unrelated colours.

  import Badge from '$lib/lily/Badge.svelte';
  import type { Strength } from '$lib/content';

  let {
    strength,
    label = undefined,
    class: className = ''
  }: {
    strength: Strength;
    /** The full label, when it is a split rating such as "Weak as a model, …". */
    label?: string;
    class?: string;
  } = $props();
</script>

<Badge
  class={`evidence-badge ${className}`}
  data-strength={strength}
  label={`Evidence: ${label ?? strength}`}
>
  {strength}
</Badge>
