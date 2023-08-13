<script lang="ts">
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';
	import type { Day } from '../../stores/day';
	import type { Optional } from '$lib/models/models';
	import type { DateTime, Interval } from 'luxon';
	import { isFuture, isPast, isToday } from '$lib/utils/date';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let day: Optional<Day>;
	export let date: Interval;
	export let month: DateTime;

	const isCurrentMonth = (day: Interval): boolean => {
		return day.start?.month === month.month;
	};

	const flowColor = (day: Optional<Day>): string => {
		// include bg-red-200, bg-red-300, and bg-red-400
		return day && day.flow ? `bg-red-${day.flow + 1}00 text-primary` : '';
	};

	const handleClick = () => {
		if (!isCurrentMonth(date)) {
			return;
		}
		dispatch('change-day', { day: date });
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={handleClick}
	class={`rounded-lg py-[0.6em] px-3 sm:pr-4 sm:h-[5.5em] flex flex-col justify-between ${flowColor(
		day
	)}`}
	class:cursor-pointer={isPast(date) && isCurrentMonth(date)}
	class:bg-accent={!day?.flow && isCurrentMonth(date)}
>
	<div class="sm:text-right text-center text-lg">
		<span
			class={isToday(date) ? `sm:badge sm:badge-primary sm:px-2 sm:py-3` : ''}
			class:text-secondary={isFuture(date)}
			class:invisible={date.start?.month !== month.month}
		>
			{date.start?.day}
		</span>
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
		{/if}
	</div>
</div>
