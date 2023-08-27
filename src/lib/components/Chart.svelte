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

	const min = (): Optional<number> => {
		if (!cycleDays) {
			return undefined;
		}
		return cycleDays.reduce((acc, date) => {
			if (days[date] && days[date].temperature && days[date].temperature > 0) {
				return Math.min(acc, days[date].temperature);
			}
			return acc;
		}, 40);
	};

	const max = (): Optional<number> => {
		if (!cycleDays) {
			return undefined;
		}
		return cycleDays.reduce((acc, date) => {
			if (days[date] && days[date].temperature && days[date].temperature > 0) {
				return Math.max(acc, days[date].temperature);
			}
			return acc;
		}, 0);
	};

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

	const yMin = min();
	const yMax = max();

	const options = {
		responsive: true,
		scales: {
			x: {
				ticks: {
					color: 'rgb(45, 22, 95)'
				}
			},
			y: {
				min: yMin ? yMin - 0.02 : 35,
				max: yMax ? yMax + 0.02 : 40,
				ticks: {
					stepSize: 0.1,
					color: 'rgb(45, 22, 95)'
				}
			}
		},
		maintainAspectRatio: false
	};
</script>

{#if days}
	<Line data={data(days, cycleDays)} {options} />
{/if}
