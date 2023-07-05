<script lang="ts">
	import { db } from '../stores/db';
	import { DateTime } from 'luxon';

	export let date: string;
	export let temperature: number;

	let dateError: string;
	let temperatureError: string;

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		dateError = '';
		temperatureError = '';

		if (!date) {
			dateError = 'Date is required';
		}

		if (DateTime.fromISO(date) > DateTime.now()) {
			dateError = 'Date cannot be in the future';
		}

		if (!temperature) {
			temperatureError = 'Temperature is required';
		}

		if (dateError || temperatureError) {
			return;
		}

		try {
			await db.days.put({ date, temperature });
		} catch (error) {
			console.log(`Failed to add ${date}-${temperature}: ${error}`);
		}

		window.add_day_modal.close();
	};

	const handleDelete = async (e: Event) => {
		e.preventDefault();

		try {
			await db.days.delete(date);
		} catch (error) {
			console.log(`Failed to delete ${date}: ${error}`);
		}

		window.add_day_modal.close();
	};

	const handleClose = () => {
		dateError = '';
		temperatureError = '';
	};
</script>

<dialog id="add_day_modal" class="modal modal-bottom sm:modal-middle" on:close={handleClose}>
	<form class="modal-box" on:submit={handleSubmit}>
		<input
			class="input input-bordered w-full"
			class:input-error={temperatureError}
			type="number"
			step="0.01"
			min="30"
			max="40"
			placeholder="36"
			bind:value={temperature}
		/>
		{#if temperatureError}
			<span class="mb-2 text-sm text-error">{temperatureError}</span>
		{/if}

		<input
			class="input input-bordered w-full mt-2"
			class:input-error={dateError}
			type="date"
			bind:value={date}
		/>
		{#if dateError}
			<span class="mb-2 text-sm text-error">{dateError}</span>
		{/if}

		<div class="flex mt-2">
			{#if temperature}
				<form on:submit={handleDelete}>
					<button class="btn btn-error" type="submit">Delete</button>
				</form>
			{/if}

			<div class="w-full text-right">
				<button class="btn btn-ghost" onclick="add_day_modal.close()">Cancel</button>
				<button class="btn btn-primary" type="submit">Save</button>
			</div>
		</div>
	</form>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
