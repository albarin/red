<script lang="ts">
	import type { DateTime, Interval } from 'luxon';
	import { getMonthCalendarByWeek, iso, now } from '$lib/utils/date';
	import { db } from '../../stores/db';
	import type { Optional } from '$lib/models/models';
	import CalendarHeader from './CalendarHeader.svelte';
	import MonthHeader from './MonthHeader.svelte';
	import DayButton from './DayButton.svelte';
	import { calculateCycles } from '$lib/period';
	import type { Day } from '../../stores/day';

	const today = now();

	let currentMonthIsNow: boolean;
	$: currentMonthIsNow = currentMonth?.year == today.year && currentMonth?.month == today.month;

	interface Days {
		[key: string]: Day;
	}

	export let days: Days;
	export let selectedDay: Optional<Day>;
	export let currentMonth: DateTime = now();

	let calendar: Interval[][];
	$: calendar = getMonthCalendarByWeek(currentMonth);

	const exportDays = async () => {
		const days = await db.getAllDays();

		if (!days) {
			return;
		}

		const dataRows = days.map((day) => {
			return [day.date, day.temperature, day.flow];
		});

		const rows = [Object.keys(days[0]), ...dataRows];
		let csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', 'days.csv');
		document.body.appendChild(link); // Required for FF

		link.click();
	};

	const goToToday = () => {
		currentMonth = today;
	};

	let uploader: HTMLInputElement;
	const upload = async (e) => {
		let maxFileSize = 3145728;
		const file = uploader.files[0];

		const fileExtensionArray = file.type.split('/');
		const fileExtension = fileExtensionArray[fileExtensionArray.length - 1];

		if (!fileExtension.includes('csv')) {
			console.error('Wrong file type');
			return;
		}

		if (file.size > maxFileSize) {
			console.error('Above the max file size threshold');
			return;
		}

		const fileContent = await file.text();
		const rows = fileContent.trim().split('\n');

		const headers = rows[0].split(',');
		const data = rows.slice(1).map((row) => {
			const values = row.split(',');
			return headers.reduce((obj, header, i) => {
				if (!values[i]) {
					return obj;
				}
				obj[header] = header === 'date' ? values[i] : Number(values[i]);
				return obj;
			}, {});
		});

		try {
			await db.days.bulkPut(data);
		} catch (error) {
			console.error(`Failed to import ${file.name}: ${error}`);
		}
	};

	const allDays = db.getAllDays();
</script>

<div class="bg-base-100 p-4 rounded-xl">
	<MonthHeader month={currentMonth} on:back on:forward />

	<div class="grid grid-cols-7 gap-2 text-center text-neutral">
		<CalendarHeader week={calendar[0]} />
		{#each calendar as week}
			{#each week as date}
				<DayButton
					day={days && days[iso(date)] ? days[iso(date)] : undefined}
					{date}
					month={currentMonth}
					on:change-day
				/>
			{/each}
		{/each}
	</div>

	{#if !currentMonthIsNow}
		<button class="btn absolute right-4" on:click={goToToday}>Today</button>
	{/if}
</div>

{#await allDays then allDays}
	<button
		class="btn btn-primary mt-2"
		on:click={async () => {
			db.cycles.clear();

			const cycles = calculateCycles(allDays);

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
<!-- <div class="absolute bottom-4"> -->
<!-- <button class="btn btn-accent" on:click={changeSelectedDay(Interval.fromDateTimes(now, now))}>
		Add<TempColdLine class="text-lg -ml-1" />
	</button> -->
<!-- <button class="btn btn-primary" on:click={exportDays}>
		Export<Download2Line class="text-lg -ml-1" />
	</button> -->
<!-- </div> -->

<!-- <input
	type="file"
	class="file-input file-input-bordered file-input-primary w-full max-w-xs"
	bind:this={uploader}
	on:change|preventDefault={upload}
/>
 -->
