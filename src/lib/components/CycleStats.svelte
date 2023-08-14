<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import { Day } from '$lib/models/day';
	import { iso, now, toDateTime, toShortHumanFormat } from '$lib/utils/date';
	import { liveQuery } from 'dexie';
	import { db } from '../../stores/db';

	export let cycle: Cycle;

	$: cycleDays = liveQuery(async () => {
		if (!cycle) return null;
		const days = await db.getDaysBetween(iso(cycle.start), iso(now()));

		return days.reduce((days: Day[], item: Day) => {
			days[item.date] = new Day(item.date, item.temperature, item.flow, item.fluid, item.notes);
			return days;
		}, []);
	});

	let periodDays: Day[] = [];
	let spottingDays: Day[] = [];
	let temperatureDays: Day[] = [];
	$: if ($cycleDays) {
		periodDays = Object.values($cycleDays).filter((day) => day.hasPeriod());
		spottingDays = Object.values($cycleDays).filter((day) => day.hasSpotting());
		temperatureDays = Object.values($cycleDays).filter((day) => day.temperature);
	}
</script>

<div class="card bg-white text-primary rounded-lg mb-4">
	<div class="card-body !p-5">
		<h2 class="text-xl font-bold">Cycle {cycle.number}</h2>
		<p class="my-2">
			<strong class="text-neutral">{toShortHumanFormat(cycle.start)}</strong> -
			<strong class="text-neutral">{toShortHumanFormat(now())}</strong>
		</p>

		<div class="grid grid-cols-2 gap-2">
			<div>
				<h4>Cycle days</h4>
				<p class="text-neutral text-2xl">
					{now().diff(toDateTime(cycle.start), 'days').days + 1} days
				</p>
			</div>
			<div>
				<h4>Period days</h4>
				<p class="text-neutral text-2xl">
					{periodDays.length} days
				</p>
			</div>
			<div>
				<h4>Spotting days</h4>
				<p class="text-neutral text-2xl">
					{spottingDays.length} days
				</p>
			</div>
			<div>
				<h4>Temperature days</h4>
				<p class="text-neutral text-2xl">
					{temperatureDays.length} days
				</p>
			</div>
		</div>
	</div>
</div>