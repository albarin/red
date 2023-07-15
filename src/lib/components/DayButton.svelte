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

	const dayFlow = (days: Days, day: Interval): number => {
		return (days && days[format(day)]?.flow) || 0;
	};

	const dayHasPeriod = (days: Days, day: Interval): boolean => {
		return !!days[format(day)]?.flow;
	};

	const dayHasTemperature = (days: Days, day: Interval): boolean => {
		return !!(days && days[format(day)]?.temperature);
	};
</script>

<button
	on:click={() => dispatch('change-day', { day })}
	class="badge badge-lg py-5 border-none"
	class:bg-blue-200={dayHasTemperature(days, day) && !dayHasPeriod(days, day)}
	class:bg-red-200={dayFlow(days, day) === 1}
	class:bg-red-300={dayFlow(days, day) === 2}
	class:bg-red-400={dayFlow(days, day) === 3}
	class:text-base-300={day.start && day.start > now}
	class:cursor-default={day.start && day.start > now}
	class:px-4={day.start && day.start?.day < 10}
	class:invisible={day.start?.month !== currentMonth.month}
>
	{day.start?.day}
	{#if dayHasTemperature(days, day)}
		<span
			class="icon"
			class:icon-left={day.start && day.start?.day >= 10}
			class:text-blue-600={!dayHasPeriod(days, day)}
			class:text-red-700={dayHasPeriod(days, day)}
			style=""
		>
			<TempColdLine />
		</span>
	{/if}
</button>

<style>
	.icon {
		position: relative;
		top: 20px;
		margin-top: -20px;
		left: 19px;
		margin-left: -16px;
	}

	.icon-left {
		left: 14px;
	}
</style>
