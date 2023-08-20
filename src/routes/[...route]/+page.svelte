<script lang="ts">
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import CycleStats from '$lib/components/CycleStats.svelte';
	import GlobalStats from '$lib/components/GlobalStats.svelte';
	import CycleCalendar from '$lib/components/cycle-calendar/Calendar.svelte';
	import NaturalCalendar from '$lib/components/natural-calendar/Calendar.svelte';
	import { calculateCycles } from '$lib/cycles';
	import type { Cycle } from '$lib/models/cycle.js';
	import { Day } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import { iso, now } from '$lib/utils/date';
	import { liveQuery } from 'dexie';
	import { DateTime, Interval } from 'luxon';
	import { db } from '../../stores/db.js';

	export let data;

	// 'Calendar' logic
	let showCalendarView: boolean = true;
	$: showCalendarView = data.type === 'month';

	const today = now();
	let currentMonth: DateTime;
	$: currentMonth =
		data.type === 'month' ? DateTime.fromFormat(`${data.year}-${data.month}`, 'yyyy-M') : now();

	let currentCycle: Cycle;
	let currentCycleIndex: Optional<number>;
	$: currentCycleIndex = data.type === 'cycle' ? data.cycle : undefined;

	$: if ($cycles?.length && currentCycleIndex === undefined) {
		currentCycleIndex = $cycles.length - 1;
	}
	$: if ($cycles && currentCycleIndex !== undefined) {
		currentCycle = $cycles && $cycles[currentCycleIndex - 1];
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

<div class="bg-accent h-screen grid grid-cols-4 gap-4 p-4">
	<div class="col-span-4 md:col-span-3">
		<div class="bg-base-100 p-4 rounded-xl">
			{#if showCalendarView}
				<NaturalCalendar {currentMonth} days={$days} on:change-day={handleChangeDay()} />
			{:else if currentCycle}
				<CycleCalendar {currentCycle} days={$days} lastCycleIndex={$cycles.length} on:change-day={handleChangeDay()} />
			{/if}

			<div class="flex gap-2 mt-4 justify-between">
				<div class="form-control">
					<label class="label cursor-pointer p-0">
						<span class="label-text mr-2">Cycle view</span>
						<input
							type="checkbox"
							class="toggle toggle-primary toggle-md !bg-opacity-100 !bg-primary"
							on:change={() => (showCalendarView = !showCalendarView)}
							checked
						/>
						<span class="label-text ml-2">Calendar view</span>
					</label>
				</div>

				{#if !currentMonthIsNow || !currentCycleIsNow}
					<a href="/" class="btn btn-xs btn-primary">Today</a>
				{/if}
			</div>
		</div>
	</div>

	<div class="col-span-4 md:col-span-1">
		<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
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
