<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import type { Day, Days } from '$lib/models/day';
	import { datesBetween, iso, now, toDateTime, toShortHumanFormat } from '$lib/utils/date';
	import type { DateTime } from 'luxon';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let cycles: Cycle[];
	export let days: Days;

	const dayColor = (day: Day): string => {
		if (day?.flow) {
			const colors = ['bg-red-200', 'bg-red-300', 'bg-red-400'];
			return colors[day?.flow - 1];
		}

		return 'bg-secondary';
	};

	const handleClick = (date: DateTime) => () => {
		dispatch('change-day', { day: date });
	};
</script>

{#if cycles}
	<div class="flex flex-col gap-4">
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
							{@const temperature = day?.temperature ? `- ${day?.temperature} ºC` : ''}
							<button
								class="lg:tooltip tooltip-primary hidden sm:inline min-w-[29px] py-[3px] rounded-md {dayColor(
									day
								)}"
								data-tip={`${toShortHumanFormat(d)} ${temperature}`}
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
