<script lang="ts">
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';
	import type { Day } from '../../stores/db';
	import { format } from '$lib/utils/date';
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

	const dayFlow = (days: Days, day: Interval): number => {
		return (days && days[format(day)]?.flow) || 0;
	};

	const dayFlowText = (days: Days, day: Interval): string => {
		const flow = days && days[format(day)]?.flow;

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
		return !!days[format(day)]?.flow;
	};

	const dayHasTemperature = (days: Days, day: Interval): boolean => {
		return !!(days && days[format(day)]?.temperature);
	};

	const dayTemperature = (days: Days, day: Interval): number | undefined => {
		return days && days[format(day)]?.temperature;
	};

	let isCurrentDay: boolean = format(day.start) === selectedDay;
	$: isCurrentDay = format(day.start) === selectedDay;
</script>

<!-- class:bg-blue-200={dayHasTemperature(days, day) && !dayHasPeriod(days, day)}
class:bg-red-200={dayFlow(days, day) === 1}
class:bg-red-300={dayFlow(days, day) === 2}
class:bg-red-400={dayFlow(days, day) === 3} -->
<!-- class:px-4={day.start && day.start?.day < 10} -->
<!-- style={isCurrentDay ? `box-shadow:0px 0px 0px 1px black inset` : ''} -->
<div
	on:click={() => dispatch('change-day', { day })}
	on:keydown={() => dispatch('change-day', { day })}
	role="button"
	tabindex="0"
	class="bg-accent rounded-lg py-[0.6em] px-3 h-[5.5em] flex flex-col justify-between"
	class:cursor-default={day.start && day.start > now}
>
	<div class="text-right text-lg">
		<span
			class:text-secondary={day.start && day.start > now}
			class:cursor-default={day.start && day.start > now}
			class:invisible={day.start?.month !== currentMonth.month}
		>
			{day.start?.day}
		</span>
	</div>
	<div class="text-left flex">
		{#if dayFlow(days, day)}
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
