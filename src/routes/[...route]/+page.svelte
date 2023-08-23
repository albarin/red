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
	import Import from '$lib/components/Import.svelte';
	import Cycles from '$lib/components/Cycles.svelte';

	export let data;

	// 'Calendar' logic
	const today = now();
	let currentMonth: DateTime;
	$: currentMonth =
		data.view === 'month' ? DateTime.fromFormat(`${data.year}-${data.month}`, 'yyyy-M') : now();

	let currentCycle: Cycle;
	let currentCycleIndex: Optional<number>;
	$: {
		currentCycleIndex = data.view === 'cycle' ? data.cycle : undefined;
		if (currentCycleIndex && $cycles && currentCycleIndex > $cycles.length) {
			currentCycleIndex = $cycles.length;
		}
	}

	$: if ($cycles?.length && currentCycleIndex === undefined) {
		currentCycleIndex = $cycles.length;
	}
	$: if ($cycles && currentCycleIndex !== undefined) {
		currentCycle = $cycles && $cycles[currentCycleIndex - 1];
	}

	$: days = liveQuery(async () => {
		const startDate: string =
			data.view === 'month' ? iso(currentMonth.startOf('month')) : currentCycle?.start;
		const endDate: string =
			data.view === 'month' ? iso(currentMonth.endOf('month')) : currentCycle?.end || iso(today);

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

	const handleChangeDay = () => (event: CustomEvent) => {
		changeSelectedDay(event.detail.day);
	};
</script>

<div class="bg-accent h-screen grid grid-cols-4 gap-4 p-4">
	<div class="col-span-4 md:col-span-3 max-h-screen overflow-scroll relative">
		<div class="bg-base-100 p-4 rounded-xl relative">
			{#if data.view === 'month'}
				<NaturalCalendar {currentMonth} days={$days} on:change-day={handleChangeDay()} />
			{:else if data.view === 'cycle' && currentCycle}
				<CycleCalendar
					{currentCycle}
					days={$days}
					lastCycleIndex={$cycles.length}
					on:change-day={handleChangeDay()}
				/>
			{:else if data.view === 'cycles'}
				<Cycles cycles={$cycles} />
			{/if}

			<div
				class:sticky={data.view === 'cycles'}
				class:bottom-0={data.view === 'cycles'}
				class:w-full={data.view === 'cycles'}
				class:py-4={data.view === 'cycles'}
				class="bg-base-100 flex gap-2 mt-4 justify-between"
			>
				{#if currentCycleIndex}
					<div class="join">
						<a href="/" class:btn-primary={data.view === 'month'} class="btn btn-sm join-item">
							Calendar
						</a>
						<a
							href={`/cycle/${currentCycleIndex}`}
							class:btn-primary={data.view === 'cycle'}
							class="btn btn-sm join-item">Cycle</a
						>
						<a
							href="/cycles"
							class:btn-primary={data.view === 'cycles'}
							class="btn btn-sm join-item"
						>
							All cycles
						</a>
					</div>
				{/if}

				{#if !currentMonthIsNow || !currentCycleIsNow}
					<a href="/" class="btn btn-sm btn-primary">Today</a>
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

				<Import />
			{/await}
		</div>
	</div>
</div>

{#if isAddDayModalOpen}
	<AddDayForm
		id={selectedDay?.id}
		date={selectedDay?.date}
		temperature={selectedDay?.temperature}
		flow={selectedDay?.flow}
		fluid={selectedDay?.fluid}
		notes={selectedDay?.notes}
		on:close={() => (isAddDayModalOpen = false)}
	/>
{/if}
