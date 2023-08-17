<script lang="ts">
	import { now } from '$lib/utils/date';
	import { Interval } from 'luxon';

	export let week: Interval[] = Interval.fromDateTimes(
		now().startOf('week'),
		now().endOf('week')
	).splitBy({ days: 1 });
</script>

{#each week as day}
	<p class="text-lg text-neutral">{day?.start?.toFormat('ccc')}</p>
{/each}
