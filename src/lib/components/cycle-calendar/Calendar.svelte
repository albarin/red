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

<div class="bg-base-100 p-4 rounded-xl">
	<Header cycle={currentCycle} on:back on:forward on:first on:last />

	<div class="grid grid-cols-7 gap-2 text-center text-neutral">
		<WeekHeader />

		{#each calendar as week}
			{#each week as date}
				<DayButton
					day={days && days[iso(date)] ? days[iso(date)] : undefined}
					date={intervalToDate(date)}
					{interval}
					on:change-day
				/>
			{/each}
		{/each}
	</div>
</div>
