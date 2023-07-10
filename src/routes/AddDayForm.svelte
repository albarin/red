<script lang="ts">
	import MaskInput from 'svelte-input-mask/MaskInput.svelte';

	import { createEventDispatcher } from 'svelte';
	import { DateTime } from 'luxon';

	import { validateTemperature } from '$lib/utils/validation';
	import { db } from '../stores/db';

	const dispatch = createEventDispatcher();

	export let date: string | undefined = undefined;
	export let temperature: number | undefined = undefined;
	export let flow: number | undefined = undefined;

	let addDayDialog: HTMLDialogElement;
	let wasSubmitted: boolean = false;
	let temperatureError: string | undefined;
	let isBleeding: boolean | null = !!flow;

	$: if (wasSubmitted) {
		temperatureError = validateTemperature(temperature);
	}

	$: if (isBleeding && !flow) {
		flow = 2; //set default flow to medium
	}

	$: addDayDialog?.showModal();

	const handleSubmit = async () => {
		wasSubmitted = true;

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

		wasSubmitted = false;
		dispatch('close');
	};

	const handleDelete = async () => {
		try {
			await db.days.delete(date);
		} catch (error) {
			console.error(`Failed to delete ${date}: ${error}`);
		}

		wasSubmitted = false;
		dispatch('close');
	};

	const handleClose = () => {
		wasSubmitted = false;
		temperatureError = '';

		dispatch('close');
	};

	const handleTemperatureChange = ({ detail }) => {
		temperature = Number(detail.inputState.visibleValue);
	};

	const handleTemperatureFocus = (e) => {
		const length = temperature ? String(temperature).length : 0;
		e.detail.target.setSelectionRange(length, length);
	};
</script>

<dialog
	bind:this={addDayDialog}
	class="modal modal-bottom sm:modal-middle"
	on:close|preventDefault={handleClose}
>
	<div class="modal-box text-center">
		<p class="text-gray-400 mb-1">{DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED)}</p>
		<div class="mb-4">
			<div
				class="text-center"
				class:text-error={temperatureError}
				class:focus:text-error={temperatureError}
			>
				<MaskInput
					style="width:100px"
					class="input input-ghost text-center text-3xl focus:outline-none p-0"
					alwaysShowMask
					maskChar="_"
					mask="00.00"
					value={String(temperature)}
					on:change={handleTemperatureChange}
					on:focus={handleTemperatureFocus}
				/>

				<span
					class="text-3xl relative -left-3"
					class:text-gray-400={!temperature}
					class:text-error={temperatureError}
				>
					ºC
				</span>
			</div>

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
