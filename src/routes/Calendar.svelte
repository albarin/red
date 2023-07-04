<script lang="ts">
	import { DateTime, Interval } from 'luxon';
	import { liveQuery } from 'dexie';

	import { arrayToObject } from '$lib/utils';
	import { db } from '../stores/db';

	const startOfMonth = DateTime.now().startOf('month');
	const endOfMonth = DateTime.now().endOf('month');

	$: days = liveQuery(async () => {
		const days = await db.days
			.where('date')
			.between(startOfMonth.toFormat('yyyy-MM-dd'), endOfMonth.toFormat('yyyy-MM-dd'))
			.toArray();

		return arrayToObject(days, 'date');
	});

	const month = DateTime.now().month;

	const weeks = Interval.fromDateTimes(
		startOfMonth.startOf('week'),
		endOfMonth.endOf('week')
	).splitBy({ weeks: 1 });

	const calendar = weeks.map((week) => week.splitBy({ days: 1 }));
</script>

<div class="grid grid-cols-7 gap-2 text-center mb-4">
	{#each calendar as week}
		{#each week as weekday}
			<span
				class="badge badge-lg py-5"
				class:badge-error={$days && $days[weekday.start?.toFormat('yyyy-MM-dd')]}
				class:px-4={weekday.start?.day < 10}
				class:text-base-300={weekday.start?.month !== month}
			>
				{weekday.start?.day}
			</span>
		{/each}
	{/each}
</div>
