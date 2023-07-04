<script lang="ts">
	import { format } from '$lib/utils/date';
	import { DateTime } from 'luxon';

	import { db } from '../stores/db';

	let defaultDay = format(DateTime.now());

	export let date: string = defaultDay;
	export let temperature: number;

	async function addDay() {
		try {
			await db.days.put({
				date: date,
				temperature: temperature
			});

			date = defaultDay;
		} catch (error) {
			console.log(`Failed to add ${date}-${temperature}: ${error}`);
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
			placeholder="36"
			bind:value={temperature}
		/>
		<input class="input input-bordered w-full mb-2" type="date" bind:value={date} />

		<div class="w-full text-right">
			<button class="btn btn-ghost">Cancel</button>
			<button on:click={addDay} class="btn btn-primary">Save</button>
		</div>
	</form>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
