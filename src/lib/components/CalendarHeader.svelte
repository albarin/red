<script lang="ts">
	import type { Interval } from 'luxon';

	export let week: Interval[];
</script>

{#each week as day}
	<p class="text-xl text-neutral my-2">{day?.start?.toFormat('ccc')}</p>
{/each}
