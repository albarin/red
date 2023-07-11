<script lang="ts">
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';
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

	let isAddDayModalOpen = false;
	let selectedDay: Day | null;

	$: days = liveQuery(async () => {
		const days = await db.getDaysBetween(
			format(currentMonth.startOf('month')),
			format(currentMonth.endOf('month'))
		);

		return arrayToObject(days, 'date');
	});

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

	const handleBack = (event) => {
		currentMonth = currentMonth.minus({ [event.detail.interval]: 1 });
	};

	const handleForward = (event) => {
		currentMonth = currentMonth.plus({ [event.detail.interval]: 1 });
	};

	const goToToday = () => {
		currentMonth = now;
	};
</script>

{#if !currentMonthIsNow}
	<button class="btn absolute bottom-4 right-4" on:click={goToToday}>Today</button>
{/if}

{#if !($days && $days[format(now)])}
	<button
		class="btn btn-accent absolute bottom-4"
		on:click={openAddDayModal(Interval.fromDateTimes(now, now))}
	>
		Add<TempColdLine class="text-lg -ml-1" />
	</button>
{/if}

<MonthHeader month={currentMonth} on:back={handleBack} on:forward={handleForward} />

<div class="grid grid-cols-7 gap-2 text-center mb-4">
	<CalendarHeader week={calendar[0]} />
	{#each calendar as week}
		{#each week as day}
			<DayButton days={$days} {day} {now} {currentMonth} on:open-modal={openAddDayModal(day)} />
		{/each}
	{/each}
</div>

{#if isAddDayModalOpen}
	<AddDayForm {...selectedDay} on:close={closeAddDayModal} />
{/if}
