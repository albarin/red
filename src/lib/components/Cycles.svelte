<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import type { Day, Days } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import { datesBetween, iso, now, toDateTime, toShortHumanFormat } from '$lib/utils/date';
	import type { DateTime } from 'luxon';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let cycles: Cycle[];
	export let days: Days;

	let filter: string = '';

	const dayColor = (day: Day, filter: string): string => {
		if (day?.flow) {
			const colors = ['bg-red-200', 'bg-red-300', 'bg-red-400'];
			return colors[day?.flow - 1];
		}

		if (filter && day && day.has(filter)) {
			return 'bg-neutral text-accent';
		}

		return 'bg-secondary';
	};

	const handleClick = (date: DateTime) => () => {
		dispatch('change-day', { day: date });
	};
</script>

{#if cycles}
	<div class="flex flex-col gap-4">
		<div class="text-primary flex justify-end gap-2">
			<p class="">Days with:</p>
			<div>
				<input
					bind:group={filter}
					name="filter"
					class="btn btn-xs border-none hover:bg-secondary bg-accent text-neutral"
					type="radio"
					aria-label="Temperature"
					value="temperature"
				/>
				<input
					bind:group={filter}
					name="filter"
					class="btn btn-xs border-none hover:bg-secondary bg-accent text-neutral"
					type="radio"
					aria-label="Notes"
					value="notes"
				/>
				<input
					bind:group={filter}
					name="filter"
					class="btn btn-xs border-none hover:bg-secondary bg-accent text-neutral"
					type="radio"
					aria-label="Cervical fluid"
					value="fluid"
				/>
				<input
					bind:group={filter}
					name="filter"
					class="btn btn-xs border-none hover:bg-secondary bg-accent text-neutral"
					type="radio"
					aria-label="Spotting"
					value="spotting"
				/>
			</div>
		</div>

		{#each cycles as cycle}
			<div class="text-primary bg-accent pt-2 pb-2 sm:pb-3 px-4 rounded-md">
				<div class="flex justify-between">
					<a href={`/cycle/${cycle.number}`} class="font-semibold">
						Cycle {cycle.number}
					</a>
					<span class="ml-2 text-neutral text-sm">
						<span>{toShortHumanFormat(cycle.start)}</span>
						- <span>{cycle.end ? toShortHumanFormat(cycle.end) : 'today'}</span>
					</span>
				</div>
				<div class="hidden sm:inline">
					<div class="flex flex-wrap gap-[4px] mt-1">
						{#each datesBetween(cycle.start, cycle.end || iso(now())) as d, i}
							{@const day = days[iso(d)]}
							{@const temperature = day?.hasTemperature() ? `- ${day?.temperature} ºC` : ''}
							{@const notes = day?.hasNotes() ? `- ${day?.notes}` : ''}
							<button
								class="lg:tooltip tooltip-primary hidden sm:inline min-w-[29px] py-[3px] rounded-md {dayColor(
									day,
									filter
								)}"
								data-tip={`${toShortHumanFormat(d)} ${temperature} ${notes}`}
								on:click={handleClick(toDateTime(d))}
							>
								<span class="text-center text-sm p-1">{i + 1}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
