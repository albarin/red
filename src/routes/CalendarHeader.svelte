<script lang="ts">
	import type { Interval } from 'luxon';

	export let week: Interval[];
</script>

{#each week as day}
	<p class="text-sm text-gray-600">{day?.start?.toFormat('ccc')}</p>
{/each}
