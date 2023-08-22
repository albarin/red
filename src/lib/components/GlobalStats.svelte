<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import type { Optional } from '$lib/models/optional';
	import { getStats, type CyclesStats } from '$lib/models/stats';

	import { toHuman } from '$lib/utils/date';

	export let cycles: Cycle[] = [];

	let stats: Optional<CyclesStats>;
	$: if (cycles.length) {
		stats = getStats(cycles);
	}
</script>

<div class="bg-white rounded-lg p-4 text-primary">
	{#if stats !== undefined}
		<p class="font-bold text-xl">{stats.cyclesLength} cycles</p>
		<p class="mb-2">
			with an average length of
			<span class="text-neutral text-2xl">
				{stats.averageCycleLength}±{stats.standardDeviationCycleLength}
			</span> days
		</p>

		<div class="grid grid-cols-2 gap-2">
			<div>
				<h4>Shortest cycle</h4>
				<div
					class="lg:tooltip tooltip-primary hidden sm:inline"
					data-tip="{toHuman(stats.shortestCycle.start)} - {toHuman(stats.shortestCycle.end)}"
				>
					<p class="text-left text-neutral text-2xl">{stats.shortestCycle.duration} days</p>
				</div>
			</div>
			<div>
				<h4>Longest cycle</h4>
				<div
					class="lg:tooltip tooltip-primary hidden sm:inline"
					data-tip="{toHuman(stats.longestCycle.start)} - {toHuman(stats.longestCycle.end)}"
				>
					<p class="text-left text-neutral text-2xl">{stats.longestCycle.duration} days</p>
				</div>
			</div>
		</div>
	{:else}
		No data available, start filling some days to see the global cycle stats.
	{/if}
</div>
