<script lang="ts">
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';
	import { db } from '../stores/db';
	import { now, toDateTime, toHumanFormat, iso } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import { getStats, type CyclesStats } from '$lib/period';
	import { Day } from '../stores/day';
	import type { Cycle } from '../stores/cycle';

	const today = now();
	let currentMonth = now();

	let isAddDayModalOpen = false;

	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(
			iso(currentMonth.startOf('month')),
			iso(currentMonth.endOf('month'))
		);

		return days.reduce((days, item: Day) => {
			days[item.date] = new Day(item.date, item.temperature, item.flow, item.fluid, item.notes);
			return days;
		}, []);
	});

	let selectedDay: Day = $days && $days[iso(today)] ? $days[iso(today)] : new Day(iso(today));
	const changeSelectedDay = (day: Interval) => {
		if (day?.start && day.start > DateTime.now()) return;

		selectedDay = $days[iso(day)];
		if (!selectedDay) {
			selectedDay = new Day(iso(day));
		}

		isAddDayModalOpen = true;
	};

	$: cycles = liveQuery(async () => {
		return await db.cycles.toArray();
	});

	$: currentCycleDays = liveQuery(async () => {
		if (!currentCycle) return null;
		const days = await db.getDaysBetween(iso(currentCycle.start), iso(today));
		return arrayToObject(days, 'date');
	});

	let currentCyclePeriodDays: Day[] = [];
	let currentCycleSpottingDays: Day[] = [];
	let currentCycleTemperatureDays: Day[] = [];
	$: if ($currentCycleDays) {
		currentCyclePeriodDays = Object.values($currentCycleDays).filter(
			(day) => day.flow && day.flow > 0
		);
		currentCycleSpottingDays = Object.values($currentCycleDays).filter(
			(day) => day.flow !== undefined && day.flow == 0
		);
		currentCycleTemperatureDays = Object.values($currentCycleDays).filter((day) => day.temperature);
	}

	const handleBack = (event) => {
		currentMonth = currentMonth.minus({ [event.detail.interval]: 1 });
	};

	const handleForward = (event) => {
		currentMonth = currentMonth.plus({ [event.detail.interval]: 1 });
	};

	let stats: CyclesStats;
	$: if ($cycles?.length) {
		const lastFullCycleIndex =
			$cycles[$cycles.length - 1]?.end === undefined ? $cycles.length - 1 : $cycles.length;

		stats = getStats($cycles.slice(0, lastFullCycleIndex));
	}

	let currentCycle: Cycle;
	$: if ($cycles?.length) {
		currentCycle = $cycles[$cycles.length - 1];
	}

	let currentMonthIsNow: boolean;
	$: currentMonthIsNow = currentMonth?.year == today.year && currentMonth?.month == today.month;
	const goToToday = () => {
		currentMonth = today;
	};
</script>

<div class="flex bg-accent h-screen">
	<div class="sm:p-4 w-full md:w-3/4">
		<Calendar
			{currentMonth}
			days={$days}
			on:change-day={(event) => changeSelectedDay(event.detail.day)}
			on:back={handleBack}
			on:forward={handleForward}
		/>

		{#if !currentMonthIsNow}
			<button class="btn absolute right-4" on:click={goToToday}>Today</button>
		{/if}
	</div>
	<div class="py-4 pr-4 md:w-1/4">
		<div class="bg-white rounded-lg p-4 mb-4">
			{#if currentCycle}
				<p>Current cycle: {toHumanFormat(currentCycle.start)}</p>
				<p>
					Current cycle length: {today.diff(toDateTime(currentCycle.start), 'days').days + 1} days
				</p>
				<p>Period days: {currentCyclePeriodDays.length}</p>
				<p>Spotting days: {currentCycleSpottingDays.length}</p>
				<p>Temperature days: {currentCycleTemperatureDays.length}</p>
			{/if}
		</div>

		<div class="bg-white rounded-lg p-4">
			{#if stats}
				<p>Cycles: {stats.cyclesLength}</p>
				<p>Average length: {stats.averageCycleLength}±{stats.standardDeviationCycleLength} days</p>

				<p>
					{stats.shortesCycle.duration} days - from {toHumanFormat(stats.shortesCycle.start)} to {toHumanFormat(
						stats.shortesCycle.end
					)}
				</p>
				<p>
					{stats.longestCycle.duration} days - from {toHumanFormat(stats.longestCycle.start)} to {toHumanFormat(
						stats.longestCycle.end
					)}
				</p>
			{/if}
		</div>
	</div>

	{#if isAddDayModalOpen}
		<AddDayForm
			date={selectedDay?.date}
			temperature={selectedDay?.temperature}
			flow={selectedDay?.flow}
			fluid={selectedDay?.fluid}
			notes={selectedDay?.notes}
			on:close={() => (isAddDayModalOpen = false)}
		/>
	{/if}
</div>
