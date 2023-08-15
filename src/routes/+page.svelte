<script lang="ts">
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import CycleStats from '$lib/components/CycleStats.svelte';
	import { Day } from '$lib/models/day';
	import { iso, now } from '$lib/utils/date';
	import { liveQuery } from 'dexie';
	import { DateTime, Interval } from 'luxon';
	import type { Cycle } from '../lib/models/cycle';
	import { db } from '../stores/db';
	import GlobalStats from '$lib/components/GlobalStats.svelte';

	const today = now();
	let currentMonth = now();

	let isAddDayModalOpen = false;

	$: days = liveQuery(async () => {
		return await db.getDaysBetween(
			iso(currentMonth.startOf('month')),
			iso(currentMonth.endOf('month'))
		);
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

	const handleBack = (event) => {
		currentMonth = currentMonth.minus({ [event.detail.interval]: 1 });
	};

	const handleForward = (event) => {
		currentMonth = currentMonth.plus({ [event.detail.interval]: 1 });
	};

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
		<CycleStats cycle={currentCycle} />
		<GlobalStats cycles={$cycles} />
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
