<script lang="ts">
	import { DateTime, Interval } from 'luxon';

	const month = DateTime.now().month;

	const weeks = Interval.fromDateTimes(
		DateTime.now().startOf('month').startOf('week'),
		DateTime.now().endOf('month').endOf('week')
	).splitBy({ weeks: 1 });

	const calendar = weeks.map((week) => week.splitBy({ days: 1 }));
</script>

<div class="grid grid-cols-7 gap-2 text-center mb-4">
	{#each calendar as week}
		{#each week as weekday}
			<span class:text-base-300={weekday.start?.month !== month}>
				{weekday.start?.day}
			</span>
		{/each}
	{/each}
</div>
