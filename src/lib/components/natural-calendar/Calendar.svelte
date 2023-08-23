<script lang="ts">
	import type { Days } from '$lib/models/day';
	import { getMonthCalendarByWeek, intervalToDate, iso, now } from '$lib/utils/date';
	import { Interval, type DateTime } from 'luxon';
	import DayButton from '../DayButton.svelte';
	import WeekHeader from '../WeekHeader.svelte';
	import Header from './Header.svelte';

	export let days: Days;
	export let currentMonth: DateTime = now();

	let calendar: Interval[][];
	$: calendar = getMonthCalendarByWeek(currentMonth);

	let interval: Interval;
	$: interval = Interval.fromDateTimes(currentMonth.startOf('month'), currentMonth.endOf('month'));
</script>

<Header month={currentMonth} />

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
