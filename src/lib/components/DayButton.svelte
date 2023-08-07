<script lang="ts">
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';
	import type { Day } from '../../stores/db';
	import { toISOformat } from '$lib/utils/date';
	import type { DateTime, Interval } from 'luxon';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	interface Days {
		[key: string]: Day;
	}

	export let day: Interval;
	export let days: Days;
	export let now: DateTime;
	export let currentMonth: DateTime;
	export let selectedDay: string | undefined = undefined;

	const daySpotting = (days: Days, day: Interval): boolean => {
		return days && days[toISOformat(day)]?.flow === 0;
	};

	const dayFlow = (days: Days, day: Interval): number => {
		return (days && days[toISOformat(day)]?.flow) || 0;
	};

	const dayFlowText = (days: Days, day: Interval): string => {
		const flow = days && days[toISOformat(day)]?.flow;

		switch (flow) {
			case 1:
				return 'light';
			case 2:
				return 'medium';
			case 3:
				return 'heavy';
			default:
				return '';
		}
	};

	const dayHasPeriod = (days: Days, day: Interval): boolean => {
		const flow = days && days[toISOformat(day)]?.flow;
		return flow ? flow > 0 : false;
	};

	const dayHasTemperature = (days: Days, day: Interval): boolean => {
		return !!(days && days[toISOformat(day)]?.temperature);
	};

	const dayTemperature = (days: Days, day: Interval): number | undefined => {
		return days && days[toISOformat(day)]?.temperature;
	};

	let isCurrentDay: boolean = toISOformat(day.start) === selectedDay;
	$: isCurrentDay = toISOformat(day.start) === selectedDay;
</script>

<div
	on:click={() => dispatch('change-day', { day })}
	on:keydown={() => dispatch('change-day', { day })}
	class="bg-accent rounded-lg py-[0.6em] px-3 pr-4 h-[5.5em] flex flex-col justify-between"
	class:cursor-default={day.start && day.start > now}
>
	<div class="text-right text-lg">
		<span
			class={isCurrentDay ? `badge badge-primary px-2 py-3` : ''}
			class:text-secondary={day.start && day.start > now}
			class:cursor-default={day.start && day.start > now}
			class:invisible={day.start?.month !== currentMonth.month}
		>
			{day.start?.day}
		</span>
	</div>
	<div class="text-left flex">
		{#if daySpotting(days, day)}
			<div class="lg:tooltip tooltip-primary" data-tip={`Spotting`}>s</div>
		{/if}
		{#if dayHasPeriod(days, day)}
			<div
				class="lg:tooltip tooltip-primary"
				data-tip={`Period day: ${dayFlowText(days, day)} flow`}
			>
				<div
					class="badge badge-primary badge-md align-text-bottom mr-1"
					class:bg-red-200={dayFlow(days, day) === 1}
					class:border-red-200={dayFlow(days, day) === 1}
					class:bg-red-300={dayFlow(days, day) === 2}
					class:border-red-300={dayFlow(days, day) === 2}
					class:bg-red-400={dayFlow(days, day) === 3}
					class:border-red-400={dayFlow(days, day) === 3}
				/>
			</div>
		{/if}

		{#if dayHasTemperature(days, day)}
			<div class="lg:tooltip tooltip-primary" data-tip={`${dayTemperature(days, day)} ºC`}>
				<span class="text-2xl text-primary text-right">
					<TempColdLine />
				</span>
			</div>
		{/if}
	</div>
</div>
