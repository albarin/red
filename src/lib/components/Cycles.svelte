<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import type { Days } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import { getLongestCycle } from '$lib/models/stats';

	export let cycles: Cycle[];
	export let days: Days;

	let longestCycle: Optional<Cycle>;
	$: longestCycle = cycles?.length ? getLongestCycle(cycles) : undefined;
</script>

{#if cycles}
	{#each cycles as cycle}
		<div class="mb-4 text-primary">
			<a href={`/cycle/${cycle.number}`} class="font-semibold">
				Cycle {cycle.number}
			</a>
			<div class="flex flex-wrap gap-1 mt-1">
				{#each Array(cycle.duration) as _, row}
					<span class="text-center text-sm bg-secondary min-w-[30px] p-1">{row + 1}</span>
				{/each}
			</div>
		</div>
	{/each}
{/if}
