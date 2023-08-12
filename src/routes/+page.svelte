<script lang="ts">
	import type { Fluid } from '$lib/components/attributes/cervicalFluid';
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';
	import { db, type Day } from '../stores/db';
	import { toDateTime, toHumanFormat, toISOformat } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import { getStats, type CyclesStats, type Cycle } from '$lib/period';

	const now = DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
	let currentMonth = DateTime.now();

	$: currentMonthIsNow = currentMonth.year == now.year && currentMonth.month == now.month;
	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(
			toISOformat(currentMonth.startOf('month')),
			toISOformat(currentMonth.endOf('month'))
		);

		return arrayToObject(days, 'date');
	});
	
	$: cycles = liveQuery(async ()=>{
			return await db.cycles.toArray();
	});


	$: currentCycleDays = liveQuery(async () => {
		if (!currentCycle) return null;

		const days = await db.getDaysBetween(
			toISOformat(currentCycle.start),
			toISOformat(now)
		);

		return arrayToObject(days, 'date');
	});
	
	let currentCyclePeriodDays: Day[] = [];
	let currentCycleSpottingDays: Day[] = [];
	let currentCycleTemperatureDays: Day[] = [];
	$: if ($currentCycleDays) {
		currentCyclePeriodDays = Object.values($currentCycleDays).filter((day) => day.flow && day.flow > 0);
		currentCycleSpottingDays = Object.values($currentCycleDays).filter((day) => day.flow !== undefined && day.flow == 0);
		currentCycleTemperatureDays = Object.values($currentCycleDays).filter((day) => day.temperature);
	}

	let isAddDayModalOpen = false;

	let selectedDay: Day | null =
		$days && $days[toISOformat(now)] ? $days[toISOformat(now)] : { date: toISOformat(now) };

	const changeSelectedDay = (day: Interval) => {
		if (day?.start && day.start > DateTime.now()) return;

		selectedDay = $days[toISOformat(day)];
		if (!selectedDay) {
			selectedDay = {
				date: toISOformat(day)
			};
		}

		isAddDayModalOpen = true;
	};

	const handleBack = (event) => {
		currentMonth = currentMonth.minus({ [event.detail.interval]: 1 });
	};

	const handleForward = (event) => {
		currentMonth = currentMonth.plus({ [event.detail.interval]: 1 });
	};

	let selectedDayFluid: Fluid | undefined = undefined;
	$: selectedDayFluid = selectedDay?.fluid as Fluid;

	let stats: CyclesStats;
	$: if ($cycles?.length) {
		const lastFullCycleIndex = $cycles[$cycles.length - 1]?.end === undefined ? $cycles.length - 1 : $cycles.length;

		stats = getStats($cycles.slice(0, lastFullCycleIndex));
	}

	let currentCycle: Cycle;
	$: if ($cycles?.length) {
		currentCycle = $cycles[$cycles.length - 1];
	}
</script>

<div class="flex bg-accent h-screen">
	<div class="sm:p-4 w-full md:w-3/4">
		<Calendar
			{selectedDay}
			{currentMonth}
			days={$days}
			on:change-day={(event) => changeSelectedDay(event.detail.day)}
			on:back={handleBack}
			on:forward={handleForward}
		/>
	</div>
	<div class="py-4 pr-4 md:w-1/4">
		<div class="bg-white rounded-lg p-4 mb-4">
			{#if currentCycle}
				<p>Current cycle: {toHumanFormat(currentCycle.start)}</p>
				<p>Current cycle length: {now.diff(toDateTime(currentCycle.start), 'days').days + 1} days</p>
				<p>Period days: {currentCyclePeriodDays.length}</p>
				<p>Spotting days: {currentCycleSpottingDays.length}</p>
				<p>Temperature days: {currentCycleTemperatureDays.length}</p>
			{/if}
		</div>

		<div class="bg-white rounded-lg p-4">
			{#if stats}
				<p>Cycles: {stats.cyclesLength}</p>
				<p>Average length: {stats.averageCycleLength}±{stats.standardDeviationCycleLength} days</p>

				<p>{stats.shortesCycle.duration} days - from {toHumanFormat(stats.shortesCycle.start)} to {toHumanFormat(stats.shortesCycle.end)}</p>
				<p>{stats.longestCycle.duration} days - from {toHumanFormat(stats.longestCycle.start)} to {toHumanFormat(stats.longestCycle.end)} </p>
			{/if}
		</div>
	</div>

	{#if isAddDayModalOpen}
		<AddDayForm
			date={selectedDay?.date}
			temperature={selectedDay?.temperature}
			flow={selectedDay?.flow}
			fluid={selectedDayFluid}
			notes={selectedDay?.notes}
			on:close={() => (isAddDayModalOpen = false)}
		/>
	{/if}
</div>
