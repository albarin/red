<script lang="ts">
	import type { Day } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import { isCurrentMonth, isFuture, isPast, isToday, toDateTime } from '$lib/utils/date';
	import type { DateTime, Interval } from 'luxon';
	import { createEventDispatcher } from 'svelte';
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';

	const dispatch = createEventDispatcher();

	export let day: Optional<Day>;
	export let date: Interval;
	export let month: DateTime;

	const dayColor = (day: Optional<Day>): string => {
		if (day?.flow) {
			const colors = ['bg-red-200 ', 'bg-red-300 ', 'bg-red-400 '];
			return colors[day.flow - 1] + ' text-primary';
		}

		if (day && isCurrentMonth(toDateTime(day.date), month)) {
			return 'bg-accent';
		}

		return '';
	};

	const handleClick = () => {
		if (!isCurrentMonth(date, month)) {
			return;
		}
		dispatch('change-day', { day: date });
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={handleClick}
	class={`rounded-lg py-[0.6em] px-3 sm:pr-4 sm:h-[5.5em] flex flex-col justify-between ${dayColor(
		day
	)}`}
	class:cursor-pointer={isPast(date) && isCurrentMonth(date, month)}
	class:bg-accent={!day?.flow && isCurrentMonth(date, month)}
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
