<script lang="ts">
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';
	import Download2Line from 'svelte-remixicon/lib/icons/Download2Line.svelte';
	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';
	import { format, getMonthCalendarByWeek } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import { db, type Day } from '../../stores/db';
	import AddDayForm from './AddDayForm.svelte';
	import CalendarHeader from './CalendarHeader.svelte';
	import MonthHeader from './MonthHeader.svelte';
	import DayButton from './DayButton.svelte';

	const now = DateTime.now();
	let currentMonth = DateTime.now();
	let currentMonthIsNow = true;

	$: calendar = getMonthCalendarByWeek(currentMonth);
	$: currentMonthIsNow = currentMonth.year == now.year && currentMonth.month == now.month;

	let selectedDay: Day | null;

	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(
			format(currentMonth.startOf('month')),
			format(currentMonth.endOf('month'))
		);

		return arrayToObject(days, 'date');
	});

	const changeSelectedDay = (day: Interval) => () => {
		if (day?.start && day.start > DateTime.now()) return;

		selectedDay = $days[format(day)];
		if (!selectedDay) {
			selectedDay = {
				date: format(day)
			};
		}
	};

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

	const handleBack = (event) => {
		currentMonth = currentMonth.minus({ [event.detail.interval]: 1 });
	};

	const handleForward = (event) => {
		currentMonth = currentMonth.plus({ [event.detail.interval]: 1 });
	};

	const goToToday = () => {
		currentMonth = now;
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
</script>

<!-- <div class="absolute bottom-4"> -->
<!-- <button class="btn btn-accent" on:click={changeSelectedDay(Interval.fromDateTimes(now, now))}>
		Add<TempColdLine class="text-lg -ml-1" />
	</button> -->
<!-- <button class="btn btn-primary" on:click={exportDays}>
		Export<Download2Line class="text-lg -ml-1" />
	</button> -->
<!-- </div> -->

<MonthHeader month={currentMonth} on:back={handleBack} on:forward={handleForward} />

<div class="grid grid-cols-7 gap-2 text-center mb-4">
	<CalendarHeader week={calendar[0]} />
	{#each calendar as week}
		{#each week as day}
			<span>
				<DayButton days={$days} {day} {now} {currentMonth} on:change-day />
			</span>
		{/each}
	{/each}
</div>

{#if !currentMonthIsNow}
	<button class="btn absolute right-4" on:click={goToToday}>Today</button>
{/if}

<!-- <input
	type="file"
	class="file-input file-input-bordered file-input-primary w-full max-w-xs"
	bind:this={uploader}
	on:change|preventDefault={upload}
/> -->
