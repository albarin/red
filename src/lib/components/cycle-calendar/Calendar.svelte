<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import { Day, type Days } from '$lib/models/day';
	import { getCalendarByWeek, iso, now, toDateTime } from '$lib/utils/date';
	import { DateTime, Interval } from 'luxon';
	import DayButton from '../DayButton.svelte';
	import WeekHeader from '../WeekHeader.svelte';
	import CycleHeader from './Header.svelte';

	export let cycles: Cycle[];
	export let days: Days;

	let currentCycleIndex: number;
	export let currentCycle: Cycle;

	let currentCycleEnd: DateTime;
	let currentCycleStart: DateTime;
	$: if (currentCycle) {
		currentCycleEnd = currentCycle?.end ? toDateTime(currentCycle?.end) : now();
		currentCycleEnd = currentCycleEnd.plus({ days: 1 });
		currentCycleStart = toDateTime(currentCycle?.start);
	}

	let calendar: Interval[][];
	$: calendar = getCalendarByWeek(toDateTime(currentCycle?.start), currentCycleEnd);

	let interval: Interval;
	$: interval = Interval.fromDateTimes(currentCycleStart, currentCycleEnd);

	$: if (cycles?.length) {
		currentCycleIndex = cycles.length - 1;
		currentCycle = cycles[currentCycleIndex];
	}
</script>

<div class="bg-base-100 p-4 rounded-xl">
	<CycleHeader cycle={currentCycle} on:back on:forward />

	<div class="grid grid-cols-7 gap-2 text-center text-neutral">
		<WeekHeader week={calendar[0]} />

		{#each calendar as week}
			{#each week as date}
				<DayButton
					date={date.start}
					{interval}
					day={days && days[iso(date)] ? days[iso(date)] : undefined}
					on:change-day
				/>
			{/each}
		{/each}
	</div>
</div>
