<script lang="ts">
	import AddDayForm from '$lib/components/AddDayForm.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';
	import { db, type Day } from '../stores/db';
	import { format, getMonthCalendarByWeek } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import NavBar from '$lib/components/NavBar.svelte';

	const isSmallScreen = (width: number) => width < 768;
	let innerWidth = 0;

	const now = DateTime.now();
	let currentMonth = DateTime.now();
	let currentMonthIsNow = true;
	let isAddDayModalOpen = false;
	let selectedDay: Day | null;

	$: currentMonthIsNow = currentMonth.year == now.year && currentMonth.month == now.month;
	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(
			format(currentMonth.startOf('month')),
			format(currentMonth.endOf('month'))
		);

		return arrayToObject(days, 'date');
	});

	const changeSelectedDay = (day: Interval) => {
		if (day?.start && day.start > DateTime.now()) return;

		selectedDay = $days[format(day)];
		if (!selectedDay) {
			selectedDay = {
				date: format(day)
			};
		}
	};
</script>

<svelte:window bind:innerWidth />

<NavBar />

<div class="flex">
	<div class="drawer lg:drawer-open md:w-3/4 w-full">
		<input id="menu-sidebar" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content p-4">
			<Calendar on:change-day={(event) => changeSelectedDay(event.detail.day)} />
		</div>
		<div class="drawer-side">
			<label for="menu-sidebar" class="drawer-overlay" />
			<ul class="w-64 h-full bg-base-200 text-base-content p-4">
				<li><a>Sidebar Item 1</a></li>
				<li><a>Sidebar Item 2</a></li>
			</ul>
		</div>
	</div>

	{#if !isSmallScreen(innerWidth)}
		<div class="divider lg:divider-horizontal px-0 !m-0" />
		<div class="w-1/4 p-4">
			<AddDayForm
				date={selectedDay?.date}
				temperature={selectedDay?.temperature?.toString()}
				flow={selectedDay?.flow}
			/>
		</div>
	{/if}
</div>
