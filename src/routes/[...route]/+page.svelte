<script lang="ts">
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import CycleStats from '$lib/components/CycleStats.svelte';
	import Cycles from '$lib/components/Cycles.svelte';
	import GlobalStats from '$lib/components/GlobalStats.svelte';
	import Import from '$lib/components/Import.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import CycleCalendar from '$lib/components/cycle-calendar/Calendar.svelte';
	import NaturalCalendar from '$lib/components/natural-calendar/Calendar.svelte';
	import { calculateCycles } from '$lib/cycles';
	import type { Cycle } from '$lib/models/cycle.js';
	import { Day } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import { iso, now } from '$lib/utils/date';
	import { md5 } from '$lib/utils/md5.js';
	import { liveQuery } from 'dexie';
	import { DateTime, Interval } from 'luxon';
	import { db } from '../../stores/db.js';

	export let data;

	// 'Calendar' logic
	const today = now();
	let currentMonth: DateTime;
	$: currentMonth =
		data.view === 'month' ? DateTime.fromFormat(`${data.year}-${data.month}`, 'yyyy-M') : now();

	let currentCycle: Optional<Cycle>;
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
		currentCycle = $cycles && $cycles[$cycles.length - currentCycleIndex];
	} else {
		currentCycle = undefined;
	}

	$: days = liveQuery(async () => {
		if (data.view === 'cycles') {
			return await db.getAllDaysByDate();
		}

		const startDate: string =
			data.view === 'month'
				? iso(currentMonth.startOf('month'))
				: currentCycle?.start || iso(today);
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
	let currentCycleIsNow: Optional<boolean>;
	$: currentCycleIsNow = currentCycle && currentCycle?.number == $cycles[0]?.number;

	const handleChangeDay = () => (event: CustomEvent) => {
		changeSelectedDay(event.detail.day);
	};

	// Re-calculates cycles when days change
	$: db.cloud.events.syncComplete.subscribe(() => {
		refreshCycles();
	});

	const refreshCycles = async () => {
		const days = await db.getAllDays();
		if (!days) {
			return;
		}

		const savedCycles = await db.getAllCycles();
		const hash = md5(
			savedCycles.map((cycle) => {
				const { id, ...rest } = cycle;
				return rest;
			})
		);

		const newCycles = calculateCycles(days)?.reverse();
		if (!newCycles) {
			return;
		}

		if (hash === md5(newCycles)) {
			return;
		}

		try {
			await db.cycles.bulkPut(newCycles);
		} catch (error) {
			console.error(`Failed to store cycles: ${error}`);
		}
	};
</script>

<Navbar view={data.view} {currentCycleIndex} />

<div class="flex w-full">
	<div class="bg-accent w-full h-screen grid grid-cols-4 gap-4 p-4">
		<div class="col-span-4 md:col-span-3 rounded-xl">
			<div class="bg-base-100 px-4 pt-4 rounded-xl relative">
				{#if data.view === 'month'}
					<NaturalCalendar {currentMonth} days={$days} on:change-day={handleChangeDay()} />
				{:else if data.view === 'cycle' && currentCycle}
					<CycleCalendar
						{currentCycle}
						days={$days}
						cyclesLength={$cycles.length}
						on:change-day={handleChangeDay()}
					/>
				{:else if data.view === 'cycles'}
					<Cycles cycles={$cycles} days={$days} on:change-day={handleChangeDay()} />
				{/if}

				<div
					class:sticky={data.view === 'cycles'}
					class:bottom-0={data.view === 'cycles'}
					class:w-full={data.view === 'cycles'}
					class="bg-base-100 flex gap-2 justify-between py-4"
				>
					{#if currentCycleIndex !== undefined}
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

					{#if data.view === 'month' && !currentMonthIsNow}
						<a href="/" class="btn btn-sm btn-primary">Today</a>
					{/if}

					{#if data.view === 'cycle' && !currentCycleIsNow && $cycles}
						<a href="/cycle/{$cycles[0]?.number}" class="btn btn-sm btn-primary">Today</a>
					{/if}
				</div>
			</div>
		</div>

		<div class="col-span-4 md:col-span-1">
			<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
				<CycleStats cycle={currentCycle} />
				<GlobalStats cycles={$cycles} />

				<Import />
			</div>
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
		on:refresh-cycles={() => refreshCycles()}
	/>
{/if}
