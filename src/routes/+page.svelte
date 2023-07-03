<script>
	import AddDayForm from './AddDayForm.svelte';
	import Calendar from './Calendar.svelte';

	import { db } from '../stores/db';
	import { liveQuery } from 'dexie';

	let days = liveQuery(() => db.days.toArray());
</script>

<div>
	<Calendar />

	<AddDayForm />

	<button class="btn" onclick="add_day_modal.showModal()">Add day</button>

	<!-- <ul>
		{#if $days}
			{#each $days as day}
				<li>{day.date}, {day.temperature}</li>
			{/each}
		{/if}
	</ul> -->
</div>
