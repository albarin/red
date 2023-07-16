<script lang="ts">
	import MaskInput from 'svelte-input-mask/MaskInput.svelte';

	import { createEventDispatcher } from 'svelte';
	import { DateTime, Interval } from 'luxon';

	import { validateTemperature } from '$lib/utils/validation';
	import { db, type Day } from '../../stores/db';
	import { format } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';

	const dispatch = createEventDispatcher();

	export let date: string | undefined = undefined;
	export let temperature: string | undefined = undefined;
	export let flow: number | undefined = undefined;

	let wasSubmitted: boolean = false;
	let temperatureError: string | undefined;

	let shouldFillPeriodGaps: boolean = true;

	$: temperature = updateTemperature(temperature);

	$: if (wasSubmitted) {
		temperatureError = validateTemperature(temperature);
	}

	$: if (typeof flow == 'boolean') {
		flow = 2;
	}

	const handleSubmit = async () => {
		wasSubmitted = true;

		temperatureError = validateTemperature(temperature);
		if (temperatureError) {
			return;
		}

		if (!date) {
			return;
		}

		if (!temperature && !flow) {
			dispatch('close');
			return;
		}

		try {
			console.log('Adding day', {
				date,
				...(temperature && { temperature: Number(temperature) }),
				flow
			});
			await db.days.put({
				date,
				...(temperature && { temperature: Number(temperature) }),
				...(flow && { flow: flow })
			});
		} catch (error) {
			console.error(`Failed to add ${date}-${temperature}: ${error}`);
		}

		if (shouldFillPeriodGaps) {
			fillPeriodGaps(date);
		}

		wasSubmitted = false;
		dispatch('close');
	};

	const periodLastDay = async (date: string): Promise<string | undefined> => {
		const prevWeekDays = await db.getPreviousWeekDays(date);
		const prevWeekPeriodDays = prevWeekDays.filter((day) => day.flow);
		const closestPeriodDay = prevWeekPeriodDays[prevWeekPeriodDays.length - 1];

		return closestPeriodDay ? closestPeriodDay.date : undefined;
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
			if (prevWeekDaysByDate[format(day)]) {
				prevWeekDaysByDate[format(day)].flow = flow;
				return prevWeekDaysByDate[format(day)];
			}
			return { date: format(day), flow } as Day;
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

	const updateTemperature = (t: string | undefined): string | undefined => {
		if (t === '' || t === undefined) {
			return undefined;
		}

		const value = parseFloat(t);

		if (isNaN(value) || value === 0) {
			return undefined;
		}

		if (value > 10) {
			return value.toFixed(2);
		}

		return String(value);
	};

	const handleTemperatureChange = ({ detail }) => {
		temperature = updateTemperature(detail.inputState.visibleValue);
	};

	const handleTemperatureFocus = (e) => {
		const length = temperature ? String(temperature).length : 0;
		e.detail.target.setSelectionRange(length, length);
	};
</script>

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
			value={temperature ? String(temperature) : ''}
			on:change={handleTemperatureChange}
			on:focus={handleTemperatureFocus}
		/>

		<span class="text-3xl relative -left-3" class:text-error={temperatureError}> ºC </span>
	</div>

	{#if temperatureError}
		<p class="text-sm text-error">{temperatureError}</p>
	{/if}
</div>

<div class="mb-4">
	<input
		class="btn btn-sm mb-2"
		type="checkbox"
		aria-label={!flow ? 'Period?' : 'Flow'}
		bind:checked={flow}
	/>

	{#if flow}
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

		{#await periodLastDay(date) then periodLastDay}
			{#if periodLastDay && date !== format(DateTime.fromISO(periodLastDay).plus({ days: 1 }))}
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-2">
						<input
							type="checkbox"
							class="checkbox checkbox-primary"
							bind:checked={shouldFillPeriodGaps}
						/>
						<span class="label-text">
							Set days from <strong class="font-semibold text-primary">
								{DateTime.fromISO(periodLastDay).plus({ days: 1 }).toLocaleString({
									month: 'long',
									day: 'numeric'
								})}
							</strong> as period days
						</span>
					</label>
				</div>
			{/if}
		{/await}
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
