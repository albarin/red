<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { validateTemperature } from '$lib/utils/validation';
	import { db } from '../stores/db';

	const dispatch = createEventDispatcher();

	export let isOpen = false;
	export let date: string | null = null;
	export let temperature: number | null = null;
	export let flow: number = 0;

	let addDayDialog: HTMLDialogElement;
	let temperatureError: string | null;
	let isBleeding: boolean | null = false;

	$: isBleeding = flow > 0;
	$: console.log({ date, temperature, flow, isBleeding });

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
			console.log('handleSubmit', date, temperature, flow);
			if (!(date && temperature)) return;
			console.log('handleSubmit');

			await db.days.put({
				date,
				temperature,
				...(isBleeding && { flow: flow })
			});
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
		flow = 0;

		temperatureError = '';

		dispatch('close');
	};
</script>

<dialog
	bind:this={addDayDialog}
	class="modal modal-bottom sm:modal-middle"
	on:close|preventDefault={handleClose}
>
	<div class="modal-box text-center">
		<div class="mb-4">
			<input
				class="input input-bordered w-full"
				class:input-error={temperatureError}
				type="number"
				step="0.01"
				placeholder="36"
				bind:value={temperature}
			/>
			{#if temperatureError}
				<span class="text-sm text-error">{temperatureError}</span>
			{/if}
		</div>

		<div class="mb-4">
			<input
				class="btn btn-sm mb-2"
				type="checkbox"
				aria-label={!isBleeding ? 'Bleeding?' : 'Flow'}
				bind:checked={isBleeding}
			/>

			{#if isBleeding}
				<div class="form-control w-full">
					<input
						id="bleeding"
						type="range"
						min="1"
						max="3"
						class="range range-primary"
						bind:value={flow}
					/>
					<div class="w-full flex justify-between text-xs px-2">
						<span>Low</span>
						<span>Medium</span>
						<span>High</span>
					</div>
				</div>
			{/if}
		</div>

		<div class="flex mt-4">
			{#if temperature}
				<button class="btn btn-error" on:click|preventDefault={handleDelete}>Delete</button>
			{/if}

			<div class="w-full text-right">
				<button class="btn btn-ghost" on:click|preventDefault={handleClose}>Cancel</button>
				<button class="btn btn-accent" on:click|preventDefault={handleSubmit}>Save</button>
			</div>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
