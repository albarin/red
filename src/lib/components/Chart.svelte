<script lang="ts">
	import type { Days } from '$lib/models/day';
	import { Chart, LineSeries } from 'svelte-lightweight-charts';

	export let days: Days;
	export let cycleDays: string[];

	interface ChartValue {
		time: string;
		value?: number;
	}

	const data = (days: Days, cycleDays: string[]): ChartValue[] => {
		return cycleDays.reduce((result: ChartValue[], date: string) => {
			const value = days[date]?.hasTemperature() ? days[date].temperature : 0;
			result.push({
				time: date,
				...(value && { value: value })
			});
			return result;
		}, [] as ChartValue[]);
	};
</script>

{#if days}
	<Chart width={990} height={200}>
		<LineSeries data={data(days, cycleDays)} />
	</Chart>
{/if}
