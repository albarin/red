<script lang="ts">
	import { DateTime, Interval } from 'luxon';

	const start = DateTime.now().startOf('month').startOf('week');
	const end = DateTime.now().endOf('month').endOf('week');
	const weeks = Interval.fromDateTimes(start, end).splitBy({ weeks: 1 });

	const calendar = weeks.map((week) => {
		return week.splitBy({ days: 1 });
	});
	console.log(calendar);
</script>

<div class="grid grid-cols-7 gap-2 text-center">
	{#each calendar as week}
		{#each week as day}
			<div class="font-semibold">
				{day.start?.day}
			</div>
		{/each}
	{/each}
</div>
