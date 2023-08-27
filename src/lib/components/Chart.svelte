<script lang="ts">
	import type { Days } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import {
		BarElement,
		CategoryScale,
		Chart,
		LineElement,
		LinearScale,
		PointElement,
		Title,
		Tooltip
	} from 'chart.js';
	import { Line } from 'svelte-chartjs';

	Chart.register(Title, Tooltip, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

	export let days: Days;
	export let cycleDays: string[];

	const min = cycleDays.reduce((acc, date) => {
		if (days[date] && days[date].temperature && days[date].temperature > 0) {
			return Math.min(acc, days[date].temperature);
		}
		return acc;
	}, Number.MAX_VALUE);

	const max = cycleDays.reduce((acc, date) => {
		if (days[date] && days[date].temperature && days[date].temperature > 0) {
			return Math.max(acc, days[date].temperature);
		}
		return acc;
	}, 0);

	const skipped = (ctx, value) => (ctx.p0.skip || ctx.p1.skip ? value : undefined);
	const data = (days: Days, cycleDays: string[]) => {
		let labels: string[] = [];
		let temperatures: Optional<number>[] = [];

		for (const date of cycleDays) {
			labels.push(date);
			temperatures.push(days[date]?.hasTemperature() ? days[date].temperature : undefined);
		}

		return {
			labels,
			datasets: [
				{
					data: temperatures,
					borderColor: 'rgb(45, 22, 95)',
					pointStyle: 'circle',
					pointRadius: 5,
					pointHoverRadius: 8,
					tension: 0.25,
					segment: {
						borderColor: (ctx) => skipped(ctx, 'rgb(45, 22, 95, 0.6)'),
						borderDash: (ctx) => skipped(ctx, [6, 6])
					},
					spanGaps: true
				}
			]
		};
	};
	const options = {
		responsive: true,
		scales: {
			y: {
				min: min - 0.1,
				max: max + 0.1,
				ticks: {
					stepSize: 0.1
				}
			}
		}
	};
</script>

{#if days}
	<Line data={data(days, cycleDays)} {options} />
{/if}
