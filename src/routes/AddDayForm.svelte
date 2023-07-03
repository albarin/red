<script lang="ts">
	import { DateTime } from 'luxon';

	import { db } from '../stores/db';

	let defaultDay = DateTime.now().toFormat('yyyy-MM-dd');
	let defaultTemperature = 36.0;

	let dayDate = defaultDay;
	let dayTemperature: number = defaultTemperature;

	async function addDay() {
		try {
			const id = await db.days.add({
				date: dayDate,
				temperature: dayTemperature
			});

			dayDate = defaultDay;
			dayTemperature = defaultTemperature;
		} catch (error) {
			console.log(`Failed to add ${dayDate}-${dayTemperature}: ${error}`);
		}
	}
</script>

<dialog id="add_day_modal" class="modal modal-bottom sm:modal-middle">
	<form method="dialog" class="modal-box">
		<input
			class="input input-bordered w-full mb-2"
			type="number"
			step="0.01"
			min="30"
			max="40"
			placeholder="Temperature"
			bind:value={dayTemperature}
		/>
		<input class="input input-bordered w-full mb-2" type="date" bind:value={dayDate} />

		<div class="w-full text-right">
			<button class="btn btn-ghost">Cancel</button>
			<button on:click={addDay} class="btn btn-primary">Save</button>
		</div>
	</form>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
