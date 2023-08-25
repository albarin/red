<script lang="ts">
	import type { Day } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import { isFuture, isPast, isToday, iso } from '$lib/utils/date';
	import type { DateTime, Interval } from 'luxon';
	import { createEventDispatcher } from 'svelte';
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';
	import StickyNoteLine from 'svelte-remixicon/lib/icons/StickyNoteLine.svelte';

	const dispatch = createEventDispatcher();

	export let day: Optional<Day>;
	export let date: DateTime;
	export let interval: Interval;
	export let showCycleDay: boolean = false;

	const dayColor = (day: Optional<Day>, date: DateTime): string => {
		if (day?.flow) {
			const colors = ['bg-red-200', 'bg-red-300', 'bg-red-400'];
			return colors[day.flow - 1] + ' text-primary';
		}

		return dateIsInInterval(date) ? 'bg-accent' : 'brr';
	};

	const cycleDay = (date: DateTime): number => {
		return interval.splitBy({ days: 1 }).findIndex((interval) => interval.contains(date)) + 1;
	};

	const dateIsInInterval = (date: DateTime): boolean => {
		return date && interval && interval.contains(date);
	};

	const handleClick = () => {
		if (isFuture(date) || !dateIsInInterval(date)) {
			return;
		}
		dispatch('change-day', { day: date });
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={handleClick}
	class={`${dayColor(
		day,
		date
	)} rounded-lg py-[0.6em] px-3 sm:pr-4 sm:h-[6em] flex flex-col justify-between`}
	class:cursor-pointer={isPast(date) && dateIsInInterval(date)}
>
	<div class="sm:text-right text-center text-lg">
		<span
			class:font-extrabold={isToday(date)}
			class:text-secondary={isFuture(date)}
			class:invisible={!dateIsInInterval(date)}
		>
			{#if showCycleDay}
				<span class="hidden sm:inline">CD</span> {cycleDay(date)}
			{:else}
				{date.day}
			{/if}
		</span>
		{#if showCycleDay}
			<p class="text-xs hidden sm:block" class:invisible={!dateIsInInterval(date)}>
				{date.toFormat('dd MMM yy')}
			</p>
		{/if}
	</div>

	<div class="text-left flex">
		{#if day}
			{#if day.hasSpotting()}
				<div class="lg:tooltip tooltip-primary hidden sm:inline" data-tip="Spotting">s</div>
			{/if}

			{#if day.temperature}
				<div class="lg:tooltip tooltip-primary hidden sm:inline" data-tip={`${day.temperature} ºC`}>
					<span class="text-2xl text-primary text-right">
						<TempColdLine />
					</span>
				</div>
			{/if}
			{#if day.notes}
				<div class="lg:tooltip tooltip-primary hidden sm:inline" data-tip={day.notes}>
					<span class="text-2xl text-primary text-right">
						<StickyNoteLine />
					</span>
				</div>
			{/if}
		{/if}
	</div>
</div>
