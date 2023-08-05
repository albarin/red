<script lang="ts">
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';
	import { db, type Day } from '../stores/db';
	import { format } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';

	const isSmallScreen = (width: number) => width < 768;
	let innerWidth: number;
	$: innerWidth > 768 && (isAddDayModalOpen = false);

	const now = DateTime.now();
	let currentMonth = DateTime.now();

	$: currentMonthIsNow = currentMonth.year == now.year && currentMonth.month == now.month;
	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(
			format(currentMonth.startOf('month')),
			format(currentMonth.endOf('month'))
		);

		return arrayToObject(days, 'date');
	});

	let isAddDayModalOpen = false;

	let selectedDay: Day | null =
		$days && $days[format(now)] ? $days[format(now)] : { date: format(now) };

	const changeSelectedDay = (day: Interval) => {
		if (day?.start && day.start > DateTime.now()) return;

		selectedDay = $days[format(day)];
		if (!selectedDay) {
			selectedDay = {
				date: format(day)
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
</script>

<svelte:window bind:innerWidth />

<div class="flex bg-accent h-screen">
	<div class="drawer lg:drawer-open md:w-3/4 w-full">
		<input id="menu-sidebar" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content p-4">
			<Calendar
				{selectedDay}
				{currentMonth}
				days={$days}
				on:change-day={(event) => changeSelectedDay(event.detail.day)}
				on:back={handleBack}
				on:forward={handleForward}
			/>
		</div>
		<!-- <div class="drawer-side bg-red-200">
			<label for="menu-sidebar" class="drawer-overlay" />
			<ul class="w-64 h-full text-base-content p-4" />
		</div> -->
	</div>
	<!-- 
	{#if !isSmallScreen(innerWidth)}
		<div class="w-1/4 py-4 pr-4">
			<AddDayForm
				date={selectedDay?.date}
				temperature={selectedDay?.temperature?.toString()}
				flow={selectedDay?.flow}
			/>
		</div>
	{:else if isAddDayModalOpen} -->

	{#if isAddDayModalOpen}
		<AddDayForm
			date={selectedDay?.date}
			temperature={selectedDay?.temperature}
			flow={selectedDay?.flow}
			on:close={() => (isAddDayModalOpen = false)}
		/>
	{/if}
</div>
