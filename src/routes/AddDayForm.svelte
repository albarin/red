<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { validateTemperature } from '$lib/utils/validation';
	import { db } from '../stores/db';

	const dispatch = createEventDispatcher();

	export let isOpen = false;
	export let date: string | null;
	export let temperature: number | null;

	let temperatureError: string | null;
	let addDayDialog: HTMLDialogElement;

	$: {
		if (addDayDialog && isOpen) {
			addDayDialog.showModal();
		} else if (addDayDialog) {
			addDayDialog.close();
		}
	}

	const handleSubmit = async () => {
		temperatureError = validateTemperature(temperature);
		if (temperatureError) {
			return;
		}

		try {
			if (!(date && temperature)) return;
			await db.days.put({ date, temperature });
		} catch (error) {
			console.log(`Failed to add ${date}-${temperature}: ${error}`);
		}

		temperature = null;

		dispatch('close');
	};

	const handleDelete = async () => {
		try {
			await db.days.delete(date);
		} catch (error) {
			console.log(`Failed to delete ${date}: ${error}`);
		}

		dispatch('close');
	};

	const handleClose = () => {
		temperature = null;
		temperatureError = '';

		dispatch('close');
	};
</script>

<dialog
	bind:this={addDayDialog}
	class="modal modal-bottom sm:modal-middle"
	on:close|preventDefault={handleClose}
>
	<div class="modal-box">
		<input
			class="input input-bordered w-full"
			class:input-error={temperatureError}
			type="number"
			step="0.01"
			placeholder="36"
			bind:value={temperature}
		/>
		{#if temperatureError}
			<span class="mb-2 text-sm text-error">{temperatureError}</span>
		{/if}

		<div class="flex mt-4">
			{#if temperature}
				<button class="btn btn-error" on:click|preventDefault={handleDelete}>Delete</button>
			{/if}

			<div class="w-full text-right">
				<button class="btn btn-ghost" on:click|preventDefault={handleClose}>Cancel</button>
				<button class="btn btn-primary" on:click|preventDefault={handleSubmit}>Save</button>
			</div>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
