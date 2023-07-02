<script>
	import AddDayForm from './AddDayForm.svelte';

	import { db } from '../stores/db';
	import { liveQuery } from 'dexie';

	let days = liveQuery(() => db.days.toArray());
</script>

<div>
	<AddDayForm />

	<ul>
		{#if $days}
			{#each $days as day (day.id)}
				<li>{day.date}, {day.temperature}</li>
			{/each}
		{/if}
	</ul>
</div>
