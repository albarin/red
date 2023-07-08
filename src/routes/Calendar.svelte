<script lang="ts">
	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';

	import { format, getCurrentMonthCalendar } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import { db, type Day } from '../stores/db';
	import AddDayForm from './AddDayForm.svelte';

	const now = DateTime.now();
	const calendar = getCurrentMonthCalendar();

	let isAddDayModalOpen = false;
	let selectedDate: string | null;
	let selectedTemperature: number | null;

	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(format(now.startOf('month')), format(now.endOf('month')));

		return arrayToObject(days, 'date');
	});

	const dayHasTemperature = (days: Day[], day: Interval) => {
		return days && format(day) in days && (days[format(day)] as unknown as boolean);
	};

	const openAddDayModal = (day: Interval) => () => {
		if (day?.start && day.start > DateTime.now()) return;

		selectedDate = format(day);
		selectedTemperature = $days[selectedDate]?.temperature;

		isAddDayModalOpen = true;
	};

	const closeAddDayModal = () => {
		isAddDayModalOpen = false;

		selectedDate = null;
		selectedTemperature = null;
	};
</script>

<div class="grid grid-cols-7 gap-2 text-center mb-4">
	{#each calendar as week}
		{#each week as day}
			<button
				on:click|preventDefault={openAddDayModal(day)}
				class="badge badge-lg py-5 border-none font-bold"
				class:badge-primary={dayHasTemperature($days, day)}
				class:text-base-300={day.start > now}
				class:cursor-default={day.start > now}
				class:px-4={day.start?.day < 10}
				class:invisible={day.start?.month !== now.month}
			>
				{day.start?.day}
			</button>
		{/each}
	{/each}
</div>

<AddDayForm
	date={selectedDate}
	temperature={selectedTemperature}
	isOpen={isAddDayModalOpen}
	on:close={closeAddDayModal}
/>
