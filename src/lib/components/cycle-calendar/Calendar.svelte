<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import type { Days } from '$lib/models/day';
	import { getCalendarByWeek, intervalToDate, iso, now, toDateTime } from '$lib/utils/date';
	import { DateTime, Interval } from 'luxon';
	import DayButton from '../DayButton.svelte';
	import WeekHeader from '../WeekHeader.svelte';
	import Header from './Header.svelte';

	export let days: Days;
	export let currentCycle: Cycle;
	export let cyclesLength: number;

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
</script>

<Header cycle={currentCycle} {cyclesLength} />

<div class="grid grid-cols-7 gap-2 text-center text-neutral">
	<WeekHeader />

	{#each calendar as week}
		{#each week as date}
			<DayButton
				day={days && days[iso(date)] ? days[iso(date)] : undefined}
				date={intervalToDate(date)}
				{interval}
				showCycleDay={true}
				on:change-day
			/>
		{/each}
	{/each}
</div>
