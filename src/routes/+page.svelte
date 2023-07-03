<script>
	import AddDayForm from './AddDayForm.svelte';

	import { db } from '../stores/db';
	import { liveQuery } from 'dexie';

	let days = liveQuery(() => db.days.toArray());
</script>

<div>
	<button class="btn" onclick="add_day_modal.showModal()">Add day</button>

	<AddDayForm />

	<ul>
		{#if $days}
			{#each $days as day}
				<li>{day.date}, {day.temperature}</li>
			{/each}
		{/if}
	</ul>
</div>
