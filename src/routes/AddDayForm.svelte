<script>
	import dayjs from 'dayjs';
	import { db } from '../stores/db';

	let today = dayjs().format('YYYY-MM-DD');

	let dayDate = today;
	let dayTemperature;

	async function addDay() {
		try {
			const id = await db.days.add({
				date: dayDate,
				temperature: dayTemperature
			});

			dayDate = '';
			dayTemperature = today;
		} catch (error) {
			console.log(`Failed to add ${dayDate}-${dayTemperature}: ${error}`);
		}
	}
</script>

<div class="bg-slate-300 p-2">
	<input
		class="mb-2 p-2 border-gray-200 border rounded-lg w-full"
		type="number"
		step="0.01"
		min="30"
		max="40"
		placeholder="Temperature"
		bind:value={dayTemperature}
	/>
	<input
		class="mb-2 p-2 border-gray-200 border rounded-lg w-full"
		type="date"
		bind:value={dayDate}
	/>

	<button on:click={addDay} class="bg-blue-500 text-white rounded-lg px-3 py-1">Save</button>
</div>
