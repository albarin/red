<script lang="ts">
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import CycleStats from '$lib/components/CycleStats.svelte';
	import GlobalStats from '$lib/components/GlobalStats.svelte';
	import CycleCalendar from '$lib/components/cycle-calendar/Calendar.svelte';
	import CycleHeader from '$lib/components/cycle-calendar/Header.svelte';
	import NaturalCalendar from '$lib/components/natural-calendar/Calendar.svelte';
	import MonthHeader from '$lib/components/natural-calendar/Header.svelte';
	import { calculateCycles } from '$lib/cycles';
	import type { Cycle } from '$lib/models/cycle';
	import { Day } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import { iso, now } from '$lib/utils/date';
	import { liveQuery } from 'dexie';
	import { DateTime, Interval } from 'luxon';
	import { db } from '../stores/db';

	// 'Calendar' logic
	let showCalendarView = true;

	const today = now();
	let currentMonth = now();

	let currentCycle: Cycle;
	let currentCycleIndex: Optional<number>;
	$: if ($cycles?.length && currentCycleIndex === undefined) {
		currentCycleIndex = $cycles.length - 1;
	}
	$: if ($cycles && currentCycleIndex !== undefined) {
		currentCycle = $cycles && $cycles[currentCycleIndex];
	}

	$: days = liveQuery(async () => {
		const startDate: string = showCalendarView
			? iso(currentMonth.startOf('month'))
			: currentCycle?.start;
		const endDate: string = showCalendarView
			? iso(currentMonth.endOf('month'))
			: currentCycle?.end || iso(today);

		return await db.getDaysBetween(startDate, endDate);
	});

	$: cycles = liveQuery(async () => {
		return await db.getAllCycles();
	});

	// 'Add day' modal logic
	let isAddDayModalOpen = false;

	let selectedDay: Day = $days && $days[iso(today)] ? $days[iso(today)] : new Day(iso(today));
	const changeSelectedDay = (day: Interval) => {
		if (day?.start && day.start > DateTime.now()) return;

		selectedDay = $days[iso(day)];
		if (!selectedDay) {
			selectedDay = new Day(iso(day));
		}

		isAddDayModalOpen = true;
	};

	// 'Go to current' button logic
	let currentMonthIsNow: boolean;
	$: currentMonthIsNow = currentMonth?.year == today.year && currentMonth?.month == today.month;
	let currentCycleIsNow: boolean;
	$: currentCycleIsNow =
		currentCycle && currentCycle?.number == $cycles[$cycles.length - 1]?.number;

	// Handlers to navigate the calendar
	const goToCurrent = () => {
		currentMonth = today;
		currentCycleIndex = $cycles.length - 1;
	};

	const handleMonthBack = (event: CustomEvent) => {
		currentMonth = currentMonth.minus({ [event.detail.interval]: 1 });
	};

	const handleMonthForward = (event: CustomEvent) => {
		currentMonth = currentMonth.plus({ [event.detail.interval]: 1 });
	};

	const handleCycleBack = () => {
		if (!currentCycleIndex) {
			return;
		}
		currentCycleIndex--;
	};

	const handleCycleForward = () => {
		if (!currentCycleIndex || currentCycleIndex == $cycles.length - 1) {
			return;
		}
		currentCycleIndex++;
	};

	const handleCycleFirst = () => {
		currentCycleIndex = 0;
	};

	const handleCycleLast = () => {
		if (!$cycles.length) {
			return;
		}
		currentCycleIndex = $cycles.length - 1;
	};

	const handleChangeDay = () => (event: CustomEvent) => {
		changeSelectedDay(event.detail.day);
	};
</script>

<div class="flex bg-accent h-screen">
	<div class="sm:p-4 w-full md:w-3/4">
		{#if showCalendarView}
			<NaturalCalendar
				{currentMonth}
				days={$days}
				on:change-day={handleChangeDay()}
				on:back={handleMonthBack}
				on:forward={handleMonthForward}
			/>
		{:else if currentCycle}
			<CycleCalendar
				{currentCycle}
				days={$days}
				on:change-day={handleChangeDay()}
				on:back={handleCycleBack}
				on:forward={handleCycleForward}
				on:first={handleCycleFirst}
				on:last={handleCycleLast}
			/>
		{/if}

		<button class="btn absolute right-4" on:click={() => (showCalendarView = !showCalendarView)}>
			{#if showCalendarView}
				Show cycle view
			{:else}
				Show calendar view
			{/if}
		</button>

		{#if !currentMonthIsNow || !currentCycleIsNow}
			<button class="btn absolute right-4" on:click={goToCurrent}>Today</button>
		{/if}
	</div>

	<div class="py-4 pr-4 md:w-1/4">
		<CycleStats cycle={currentCycle} />
		<GlobalStats cycles={$cycles} />

		{#await db.getAllDays() then days}
			<button
				class="btn btn-primary mt-2"
				on:click={async () => {
					db.cycles.clear();

					const cycles = calculateCycles(days);

					if (!cycles) {
						return;
					}

					try {
						await db.cycles.bulkPut(cycles);
					} catch (error) {
						console.error(`Failed to store cycles: ${error}`);
					}
				}}
			>
				Re-calculate
			</button>
		{/await}
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
