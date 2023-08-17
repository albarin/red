<script lang="ts">
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import CycleStats from '$lib/components/CycleStats.svelte';
	import GlobalStats from '$lib/components/GlobalStats.svelte';
	import CycleCalendar from '$lib/components/cycle-calendar/Calendar.svelte';
	import NaturalCalendar from '$lib/components/natural-calendar/Calendar.svelte';
	import { calculateCycles } from '$lib/cycles';
	import type { Cycle } from '$lib/models/cycle';
	import { Day } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import { iso, now } from '$lib/utils/date';
	import { liveQuery } from 'dexie';
	import { DateTime, Interval } from 'luxon';
	import { db } from '../stores/db';

	let showCalendarView = true;
	let isAddDayModalOpen = false;

	const today = now();
	let currentMonth = now();

	$: days = liveQuery(async () => {
		if (showCalendarView) {
			return await db.getDaysBetween(
				iso(currentMonth.startOf('month')),
				iso(currentMonth.endOf('month'))
			);
		}

		return await db.getDaysBetween(
			iso(currentCycle.start),
			currentCycle?.end ? iso(currentCycle?.end) : iso(today)
		);
	});

	$: cycles = liveQuery(async () => {
		return await db.cycles.toArray();
	});

	let currentCycle: Cycle;
	let currentCycleIndex: Optional<number>;
	$: if ($cycles?.length && currentCycleIndex === undefined) {
		currentCycleIndex = $cycles.length - 1;
	}

	$: {
		currentCycle = $cycles && $cycles[currentCycleIndex];
	}

	let selectedDay: Day = $days && $days[iso(today)] ? $days[iso(today)] : new Day(iso(today));
	const changeSelectedDay = (day: Interval) => {
		if (day?.start && day.start > DateTime.now()) return;

		selectedDay = $days[iso(day)];
		if (!selectedDay) {
			selectedDay = new Day(iso(day));
		}

		isAddDayModalOpen = true;
	};

	const handleMonthBack = (event: CustomEvent) => {
		currentMonth = currentMonth.minus({ [event.detail.interval]: 1 });
	};

	const handleMonthForward = (event: CustomEvent) => {
		currentMonth = currentMonth.plus({ [event.detail.interval]: 1 });
	};

	const handleCycleBack = () => {
		if (currentCycleIndex === 0) {
			return;
		}
		
		currentCycleIndex--;
	};

	const handleCycleForward = () => {
		if (currentCycleIndex == $cycles.length - 1) {
			return;
		}
		currentCycleIndex++;
	};

	const handleCycleFirst = () => {
		currentCycleIndex = 0;
	};

	const handleCycleLast = () => {
		currentCycleIndex = $cycles.length - 1;
		console.log('last', currentCycleIndex);
	};

	let currentMonthIsNow: boolean;
	$: currentMonthIsNow = currentMonth?.year == today.year && currentMonth?.month == today.month;
	const goToToday = () => {
		currentMonth = today;
	};
</script>

<div class="flex bg-accent h-screen">
	<div class="sm:p-4 w-full md:w-3/4">
		{#if showCalendarView}
			<NaturalCalendar
				{currentMonth}
				days={$days}
				on:change-day={(event) => changeSelectedDay(event.detail.day)}
				on:back={handleMonthBack}
				on:forward={handleMonthForward}
			/>
		{:else if currentCycle}
			<CycleCalendar
				{currentCycle}
				days={$days}
				on:change-day={(event) => changeSelectedDay(event.detail.day)}
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

		{#if !currentMonthIsNow}
			<button class="btn absolute right-4" on:click={goToToday}>Today</button>
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
