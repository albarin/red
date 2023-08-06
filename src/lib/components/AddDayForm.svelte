<script lang="ts">
	import AttributeWrapper from './attributes/AttributeWrapper.svelte';
	import BleedingInput from './attributes/BleedingInput.svelte';
	import TemperatureInput from './attributes/TemperatureInput.svelte';

	import { createEventDispatcher } from 'svelte';
	import { DateTime, Interval } from 'luxon';

	import { validateTemperature } from '$lib/utils/validation';
	import { db, type Day } from '../../stores/db';
	import { toISOformat } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import CervicalFluidInput from './attributes/CervicalFluidInput.svelte';
	import type { Fluid } from '$lib/utils/models';
	import NotesInput from './attributes/NotesInput.svelte';

	const dispatch = createEventDispatcher();

	export let date: string | undefined = undefined;
	export let temperature: number | undefined = undefined;
	export let flow: number | undefined = undefined;
	export let fluid: Fluid | undefined = undefined;
	export let notes: string | undefined = undefined;

	let wasSubmitted: boolean = false;
	let temperatureError: string | undefined;
	let notesError: string | undefined;

	let fillGaps: boolean = false;

	let addDayDialog: HTMLDialogElement;
	$: addDayDialog?.showModal();

	$: if (wasSubmitted) {
		temperatureError = validateTemperature(temperature);
	}

	$: if (typeof flow == 'boolean') {
		flow = 2;
	}

	const handleSubmit = async () => {
		wasSubmitted = true;

		notesError = notes?.length > 100 ? 'Notes must be less than 100 characters' : undefined;
		if (notesError) {
			return;
		}

		temperatureError = validateTemperature(temperature);
		if (temperatureError) {
			return;
		}

		if (!date) {
			return;
		}

		try {
			await db.days.put({
				date,
				...(temperature && { temperature: Number(temperature) }),
				flow,
				...(fluid && { fluid }),
				...(notes && { notes })
			});
		} catch (error) {
			console.error(`Failed to add ${date}-${temperature}: ${error}`);
		}

		if (fillGaps) {
			fillPeriodGaps(date);
		}

		wasSubmitted = false;
		dispatch('close');
	};

	const fillPeriodGaps = async (date: string) => {
		const prevWeekDays = await db.getPreviousWeekDays(date);
		const prevWeekDaysByDate = arrayToObject(prevWeekDays, 'date');
		const prevWeekPeriodDays = prevWeekDays.filter((day) => day.flow);
		const closestPeriodDay = prevWeekPeriodDays[prevWeekPeriodDays.length - 1];
		if (!closestPeriodDay) {
			return;
		}

		const prevWeek = Interval.fromDateTimes(
			DateTime.fromISO(closestPeriodDay.date).plus({ days: 1 }),
			DateTime.fromISO(date)
		).splitBy({ days: 1 });

		const prevWeekWithPeriod = prevWeek.map((day) => {
			if (prevWeekDaysByDate[toISOformat(day)]) {
				prevWeekDaysByDate[toISOformat(day)].flow = flow;
				return prevWeekDaysByDate[toISOformat(day)];
			}
			return { date: toISOformat(day), flow } as Day;
		});

		try {
			await db.days.bulkPut(prevWeekWithPeriod);
		} catch (error) {
			console.error(`Failed to add ${prevWeekWithPeriod}: ${error}`);
		}
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
</script>

<dialog bind:this={addDayDialog} class="modal text-center" on:close|preventDefault={handleClose}>
	<div
		style="max-height: 100%;"
		class="modal-box w-full max-w-[24rem] h-full sm:w-96 sm:h-[90%] !p-0 overflow-y-auto no-scrollbar rounded-xl"
	>
		<div class="bg-accent p-4">
			<p class="text-primary text-2xl mb-4">
				{#if date === toISOformat(DateTime.now())}Today,{/if}
				{DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
			</p>

			<AttributeWrapper title="Temperature" error={temperatureError}>
				<TemperatureInput bind:temperature />
			</AttributeWrapper>

			<AttributeWrapper title="Bleeding">
				<BleedingInput bind:flow bind:fillGaps {date} />
			</AttributeWrapper>

			<AttributeWrapper title="Cervical fluid">
				<CervicalFluidInput bind:fluid />
			</AttributeWrapper>

			<AttributeWrapper title="Notes" error={notesError}>
				<NotesInput bind:notes />
			</AttributeWrapper>
		</div>
		<div class="flex bottom-0 sticky bg-secondary px-4 py-3">
			{#if temperature || flow}
				<button class="btn btn-sm btn-error" on:click|preventDefault={handleDelete}>Delete</button>
			{/if}

			<div class="w-full text-right">
				<button class="btn btn-sm btn-link text-secondary" on:click|preventDefault={handleClose}
					>Cancel</button
				>
				<button class="btn btn-sm btn-primary" on:click|preventDefault={handleSubmit}>Save</button>
			</div>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
