<script lang="ts">
	import { db } from '../stores/db';

	export let date: string;
	export let temperature: number;

	const addDay = (date: string, temperature: number) => async () => {
		try {
			await db.days.put({ date, temperature });
		} catch (error) {
			console.log(`Failed to add ${date}-${temperature}: ${error}`);
		}
	};

	const deleteDay = (date: string) => async () => {
		try {
			await db.days.delete(date);
		} catch (error) {
			console.log(`Failed to delete ${date}: ${error}`);
		}
	};
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

		<div class="flex">
			<button class="btn btn-error" on:click={deleteDay(date)}>Delete</button>
			<div class="w-full text-right">
				<button class="btn btn-ghost">Cancel</button>
				<button class="btn btn-primary" on:click={addDay(date, temperature)}>Save</button>
			</div>
		</div>
	</form>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
