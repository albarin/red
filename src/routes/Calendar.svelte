<script lang="ts">
	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';

	import { format, getCurrentMonthCalendar } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import { db } from '../stores/db';
	import AddDayForm from './AddDayForm.svelte';

	let selectedDate: string;
	let selectedTemperature: number;

	const now = DateTime.now();

	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(format(now.startOf('month')), format(now.endOf('month')));

		return arrayToObject(days, 'date');
	});

	const dayHasTemperature = (days, day: Interval) => {
		return days && days[format(day)];
	};

	const openAddDayModal = (day: Interval) => () => {
		if (day.start > now) return;

		selectedDate = format(day);
		selectedTemperature = $days[selectedDate]?.temperature;

		window.add_day_modal.showModal();
	};

	const calendar = getCurrentMonthCalendar();
</script>

<div class="grid grid-cols-7 gap-2 text-center mb-4">
	{#each calendar as week}
		{#each week as day}
			<button
				on:click={openAddDayModal(day)}
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

<AddDayForm date={selectedDate} temperature={selectedTemperature} />
