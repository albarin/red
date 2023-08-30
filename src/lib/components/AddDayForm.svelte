<script lang="ts">
	import { Day, byDate } from '$lib/models/day';
	import type { Optional } from '$lib/models/optional';
	import { iso, toDateTime } from '$lib/utils/date';
	import { validateTemperature } from '$lib/utils/validation';
	import { DateTime, Interval } from 'luxon';
	import { createEventDispatcher } from 'svelte';
	import { db } from '../../stores/db';
	import AttributeWrapper from './attributes/AttributeWrapper.svelte';
	import BleedingInput from './attributes/BleedingInput.svelte';
	import CervicalFluidInput from './attributes/CervicalFluidInput.svelte';
	import NotesInput from './attributes/NotesInput.svelte';
	import TemperatureInput from './attributes/TemperatureInput.svelte';

	const dispatch = createEventDispatcher();

	export let id: Optional<number> = undefined;
	export let date: Optional<string> = undefined;
	export let temperature: Optional<number> = undefined;
	export let flow: Optional<number> = undefined;
	export let fluid: Optional<string> = undefined;
	export let notes: Optional<string> = undefined;

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

		notesError = notes && notes.length > 100 ? 'Notes must be less than 100 characters' : undefined;
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

		if (!temperature && flow === undefined && !fluid && !notes) {
			if (id) {
				await db.days.delete(id);
			} else {
				await db.days.delete(date);
			}
			wasSubmitted = false;
			dispatch('close');
			return;
		}

		const day = new Day(date, temperature, flow, fluid, notes, id);

		try {
			await db.days.put(day);
		} catch (error) {
			console.error(`Failed to add ${date}-${temperature}: ${error}`);
		}

		if (fillGaps) {
			fillPeriodGaps(date);
		}

		wasSubmitted = false;
		dispatch('refresh-cycles');
		dispatch('close');
	};

	const fillPeriodGaps = async (date: string) => {
		const prevWeekDays = await db.getPreviousWeekDays(iso(toDateTime(date).minus({ days: 1 })));
		const prevWeekDaysByDate = byDate(prevWeekDays);
		const prevWeekPeriodDays = prevWeekDays.filter((day) => day.flow);
		const closestPeriodDay = prevWeekPeriodDays[prevWeekPeriodDays.length - 1];
		if (!closestPeriodDay) {
			return;
		}

		const prevWeek = Interval.fromDateTimes(
			toDateTime(closestPeriodDay.date).plus({ days: 1 }),
			toDateTime(date)
		).splitBy({ days: 1 });

		const prevWeekWithPeriod = prevWeek.map((day) => {
			if (prevWeekDaysByDate[iso(day)]) {
				prevWeekDaysByDate[iso(day)].flow = flow;
				return prevWeekDaysByDate[iso(day)];
			}
			return { date: iso(day), flow } as Day;
		});

		try {
			await db.days.bulkPut(prevWeekWithPeriod);
		} catch (error) {
			console.error(`Failed to add ${prevWeekWithPeriod}: ${error}`);
		}
	};

	const handleDelete = async () => {
		try {
			if (id) {
				await db.days.delete(id);
			} else {
				await db.days.delete(date);
			}
		} catch (error) {
			console.error(`Failed to delete ${date}: ${error}`);
		}

		wasSubmitted = false;
		dispatch('refresh-cycles');
		dispatch('close');
	};

	const handleClose = () => {
		wasSubmitted = false;
		temperatureError = '';

		dispatch('close');
	};
</script>

<dialog
	bind:this={addDayDialog}
	class="modal modal-bottom sm:modal-middle text-center"
	on:close|preventDefault={handleClose}
>
	<div class="modal-box w-full sm:w-96 !p-0">
		<div class="bg-accent p-4">
			{#if date}
				<p class="text-primary text-2xl mb-4">
					{#if date === iso(DateTime.now())}Today,{/if}
					{toDateTime(date).toLocaleString(DateTime.DATE_FULL)}
				</p>
			{/if}

			<AttributeWrapper title="Temperature" error={temperatureError}>
				<TemperatureInput bind:temperature />
			</AttributeWrapper>

			<AttributeWrapper title="Bleeding">
				<BleedingInput bind:flow bind:fillGaps {date} />
			</AttributeWrapper>

			<AttributeWrapper title="Cervical fluid">
				<div class="mx-5">
					<CervicalFluidInput bind:fluid />
				</div>
			</AttributeWrapper>

			<AttributeWrapper title="Notes" error={notesError}>
				<NotesInput bind:notes />
			</AttributeWrapper>
		</div>

		<div class="flex sticky bottom-0 bg-secondary px-4 py-3">
			{#if temperature || flow !== undefined || fluid || notes}
				<button class="btn btn-sm btn-error" on:click|preventDefault={handleDelete}>Delete</button>
			{/if}

			<div class="w-full text-right">
				<button class="btn btn-sm btn-link text-primary" on:click|preventDefault={handleClose}>
					Cancel
				</button>
				<button class="btn btn-sm btn-primary" on:click|preventDefault={handleSubmit}>Save</button>
			</div>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
