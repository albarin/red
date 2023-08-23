<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import type { Optional } from '$lib/models/optional';
	import { getLongestCycle } from '$lib/models/stats';

	export let cycles: Cycle[];

	let longestCycle: Optional<Cycle>;
	$: longestCycle = cycles?.length ? getLongestCycle(cycles) : undefined;
</script>

{#if cycles}
	<div>
		{#each cycles as cycle}
			<a href={`/cycle/${cycle.number}`}>{cycle.number}</a>
			<div class="flex flex-wrap gap-1">
				{#each Array(cycle.duration) as _, row}
					<span class="text-center text-sm bg-amber-200 min-w-[30px] p-1">{row + 1}</span>
				{/each}
			</div>
		{/each}
	</div>
{/if}
