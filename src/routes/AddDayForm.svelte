<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { validateTemperature } from '$lib/utils/validation';
	import { db } from '../stores/db';

	const dispatch = createEventDispatcher();

	export let date: string | undefined = undefined;
	export let temperature: number | undefined = undefined;
	export let flow: number | undefined = undefined;

	let addDayDialog: HTMLDialogElement;
	let temperatureError: string | undefined;
	let isBleeding: boolean | null = !!flow;

	$: {
		if (isBleeding && !flow) {
			flow = 2; //set default flow to medium
		}
	}

	$: addDayDialog?.showModal();

	const handleSubmit = async () => {
		temperatureError = validateTemperature(temperature);
		if (temperatureError) {
			return;
		}

		try {
			await db.days.put({
				date,
				temperature,
				...(isBleeding && { flow: flow })
			});
		} catch (error) {
			console.error(`Failed to add ${date}-${temperature}: ${error}`);
		}

		dispatch('close');
	};

	const handleDelete = async () => {
		try {
			await db.days.delete(date);
		} catch (error) {
			console.error(`Failed to delete ${date}: ${error}`);
		}

		dispatch('close');
	};

	const handleClose = () => {
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
				style="width:110px"
				class="input input-ghost text-center text-3xl focus:outline-none"
				class:text-error={temperatureError}
				type="number"
				step="0.01"
				placeholder="36"
				bind:value={temperature}
			/>
			{#if temperatureError}
				<p class="text-sm text-error">{temperatureError}</p>
			{/if}
		</div>

		<div class="mb-4">
			<input
				class="btn btn-sm mb-2"
				type="checkbox"
				aria-label={!isBleeding ? 'Period?' : 'Flow'}
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
			{#if temperature || flow}
				<button class="btn btn-sm btn-error" on:click|preventDefault={handleDelete}>Delete</button>
			{/if}

			<div class="w-full text-right">
				<button class="btn btn-sm btn-ghost" on:click|preventDefault={handleClose}>Cancel</button>
				<button class="btn btn-sm btn-accent" on:click|preventDefault={handleSubmit}>Save</button>
			</div>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
