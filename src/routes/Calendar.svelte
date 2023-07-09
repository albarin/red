<script lang="ts">
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';
	import ArrowLeftSLine from 'svelte-remixicon/lib/icons/ArrowLeftSLine.svelte';
	import ArrowRightSLine from 'svelte-remixicon/lib/icons/ArrowRightSLine.svelte';
	import ArrowLeftDoubleLine from 'svelte-remixicon/lib/icons/ArrowLeftDoubleLine.svelte';
	import ArrowRightDoubleLine from 'svelte-remixicon/lib/icons/ArrowRightDoubleLine.svelte';

	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';

	import { format, getCurrentMonthCalendar } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import { db, type Day } from '../stores/db';
	import AddDayForm from './AddDayForm.svelte';

	const now = DateTime.now();
	const calendar = getCurrentMonthCalendar();

	let isAddDayModalOpen = false;
	let selectedDay: Day | null;

	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(format(now.startOf('month')), format(now.endOf('month')));

		return arrayToObject(days, 'date');
	});

	$: console.table($days);

	const dayFlow = (days: Day[], day: Interval) => {
		return days && format(day) in $days && $days[format(day)].flow;
	};

	const dayHasPeriod = (days: Day[], day: Interval) => {
		return (
			days &&
			format(day) in days &&
			(days[format(day)] as unknown as boolean) &&
			days[format(day)].flow
		);
	};

	const dayHasTemperature = (days: Day[], day: Interval) => {
		return (
			days &&
			format(day) in days &&
			(days[format(day)] as unknown as boolean) &&
			days[format(day)].temperature
		);
	};

	const openAddDayModal = (day: Interval) => () => {
		if (day?.start && day.start > DateTime.now()) return;

		selectedDay = $days[format(day)];
		if (!selectedDay) {
			selectedDay = {
				date: format(day)
			};
		}

		isAddDayModalOpen = true;
	};

	const closeAddDayModal = () => {
		isAddDayModalOpen = false;
		selectedDay = null;
	};
</script>

<div class="bg-gray-200 rounded-md flex justify-between py-2 px-2 mb-2">
	<ArrowLeftDoubleLine class="mt-1" />
	<ArrowLeftSLine class="mt-1" />

	<h1 class="text-center font-bold">June 2023</h1>

	<ArrowRightSLine class="mt-1" />
	<ArrowRightDoubleLine class="mt-1" />
</div>
<div class="grid grid-cols-7 gap-2 text-center mb-4">
	{#each calendar[0] as day}
		<p class="text-sm text-gray-600">{day.start.toFormat('ccc')}</p>
	{/each}
	{#each calendar as week}
		{#each week as day}
			<button
				on:click|preventDefault={openAddDayModal(day)}
				class="badge badge-lg py-5 border-none font-bold"
				class:bg-blue-200={dayHasTemperature($days, day) && !dayHasPeriod($days, day)}
				class:bg-red-200={dayFlow($days, day) === 1}
				class:bg-red-300={dayFlow($days, day) === 2}
				class:bg-red-400={dayFlow($days, day) === 3}
				class:text-base-300={day.start > now}
				class:cursor-default={day.start > now}
				class:px-4={day.start?.day < 10}
				class:invisible={day.start?.month !== now.month}
			>
				{day.start?.day}
				{#if dayHasTemperature($days, day)}
					<span
						class="icon"
						class:icon-left={day.start?.day >= 10}
						class:text-blue-600={!dayHasPeriod($days, day)}
						class:text-red-700={dayHasPeriod($days, day)}
						style=""
					>
						<TempColdLine />
					</span>
				{/if}
			</button>
		{/each}
	{/each}
</div>

{#if isAddDayModalOpen}
	<AddDayForm {...selectedDay} on:close={closeAddDayModal} />
{/if}

<style>
	.icon {
		position: relative;
		top: 20px;
		margin-top: -20px;
		left: 19px;
		margin-left: -16px;
	}

	.icon-left {
		left: 14px;
	}
</style>
