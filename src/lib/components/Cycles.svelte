<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import type { Day, Days } from '$lib/models/day';
	import { datesBetween, iso, now, toDateTime, toShortHumanFormat } from '$lib/utils/date';
	import type { DateTime } from 'luxon';
	import { createEventDispatcher } from 'svelte';
	import Chart from './Chart.svelte';

	const dispatch = createEventDispatcher();

	export let days: Days;
	export let cycles: Cycle[];

	let filters: string[];
	let chartsToShow: { [key: string]: boolean } = {};

	const dayColor = (day: Day, filters: string[]): string => {
		if (day?.flow) {
			const colors = ['bg-red-200', 'bg-red-300', 'bg-red-400'];
			return colors[day?.flow - 1];
		}

		if (filters && day) {
			const found = filters.find((filter) => day?.has(filter));
			return found ? 'bg-neutral text-accent' : 'bg-secondary';
		}

		return 'bg-secondary';
	};

	const handleClick = (date: DateTime) => () => {
		dispatch('change-day', { day: date });
	};

	const toggleChart = (i: number) => () => {
		if (chartsToShow[i] === undefined) {
			chartsToShow[i] = true;
			return;
		}

		chartsToShow[i] = !chartsToShow[i];
	};
</script>

{#if cycles}
	<div class="flex flex-col gap-4">
		<div class="text-primary justify-end gap-2 hidden sm:flex">
			<p class="">Days with:</p>
			<div>
				<input
					bind:group={filters}
					name="filter"
					class="btn btn-xs border-none hover:bg-secondary bg-accent text-neutral"
					type="checkbox"
					aria-label="Temperature"
					value="temperature"
				/>
				<input
					bind:group={filters}
					name="filter"
					class="btn btn-xs border-none hover:bg-secondary bg-accent text-neutral"
					type="checkbox"
					aria-label="Notes"
					value="notes"
				/>
				<input
					bind:group={filters}
					name="filter"
					class="btn btn-xs border-none hover:bg-secondary bg-accent text-neutral"
					type="checkbox"
					aria-label="Cervical fluid"
					value="fluid"
				/>
				<input
					bind:group={filters}
					name="filter"
					class="btn btn-xs border-none hover:bg-secondary bg-accent text-neutral"
					type="checkbox"
					aria-label="Spotting"
					value="spotting"
				/>
			</div>
		</div>

		{#each cycles as cycle, i}
			{@const cycleDays = datesBetween(cycle.start, cycle.end || iso(now()))}
			<div class="text-primary bg-accent pt-2 pb-2 sm:pb-3 px-4 rounded-md">
				<div class="flex justify-between">
					<a href={`/cycle/${cycle.number}`} class="font-semibold">
						Cycle {cycle.number}
					</a>
					<div>
						<span class="mx-2 text-neutral text-sm">
							<span>{toShortHumanFormat(cycle.start)}</span>
							- <span>{cycle.end ? toShortHumanFormat(cycle.end) : 'today'}</span>
						</span>
						<button class="btn btn-xs btn-link !px-0" on:click={toggleChart(i)}>
							{chartsToShow[i] ? 'Hide' : 'Show'} chart
						</button>
					</div>
				</div>
				<div class="hidden sm:inline">
					<div class="flex flex-wrap gap-[4px] mt-1">
						{#each cycleDays as d, i}
							{@const day = days[iso(d)]}
							{@const temperature = day?.hasTemperature() ? `- ${day?.temperature} ºC` : ''}
							{@const notes = day?.hasNotes() ? `- ${day?.notes}` : ''}
							<button
								class="lg:tooltip tooltip-primary hidden sm:inline min-w-[29px] py-[3px] rounded-md {dayColor(
									day,
									filters
								)}"
								data-tip={`${toShortHumanFormat(d)} ${temperature} ${notes}`}
								on:click={handleClick(toDateTime(d))}
							>
								<span class="text-center text-sm p-1">{i + 1}</span>
							</button>
						{/each}
					</div>
				</div>
				{#if chartsToShow[i]}
					<div class="mt-4 mb-1 h-80">
						<Chart {days} {cycleDays} />
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
