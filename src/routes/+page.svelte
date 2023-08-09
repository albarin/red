<script lang="ts">
	import type { Fluid } from '$lib/components/attributes/cervicalFluid';
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';
	import { db, type Day } from '../stores/db';
	import { toISOformat } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';

	const now = DateTime.now();
	let currentMonth = DateTime.now();

	$: currentMonthIsNow = currentMonth.year == now.year && currentMonth.month == now.month;
	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(
			toISOformat(currentMonth.startOf('month')),
			toISOformat(currentMonth.endOf('month'))
		);

		return arrayToObject(days, 'date');
	});

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
			fluid={selectedDayFluid}
			notes={selectedDay?.notes}
			on:close={() => (isAddDayModalOpen = false)}
		/>
	{/if}
</div>
