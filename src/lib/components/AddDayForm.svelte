<script lang="ts">
	import ContrastDropFill from 'svelte-remixicon/lib/icons/ContrastDropFill.svelte';
	import ContrastDropLine from 'svelte-remixicon/lib/icons/ContrastDropLine.svelte';
	import Edit2Line from 'svelte-remixicon/lib/icons/Edit2Line.svelte';
	import MaskInput from 'svelte-input-mask/MaskInput.svelte';
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';

	import { createEventDispatcher } from 'svelte';
	import { DateTime, Interval } from 'luxon';

	import { validateTemperature } from '$lib/utils/validation';
	import { db, type Day } from '../../stores/db';
	import { format } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import AttributeBox from './AttributeBox.svelte';

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

<div class="py-4 overflow-y-auto max-h-screen no-scrollbar">
	<div class="flex justify-between">
		<p class="text-primary text-2xl mb-4">
			{#if date === format(DateTime.now())}Today,{/if}
			{DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
		</p>
		<button class="btn btn-sm btn-secondary text-primary">Clear</button>
	</div>

	<AttributeBox title="Temperature" align="center">
		<span class="mt-[3px]" slot="icon"><TempColdLine /></span>
		<MaskInput
			style="width:100px"
			class="input input-ghost text-center text-3xl text-secondary focus:outline-none p-0"
			alwaysShowMask
			maskChar="_"
			mask="00.00"
			value={temperature ? String(temperature) : ''}
			on:change={handleTemperatureChange}
			on:focus={handleTemperatureFocus}
		/>

		<span class="text-3xl text-secondary relative -left-3" class:text-error={temperatureError}>
			ºC
		</span>
		<!-- 
		<div
			class="bg-white rounded-xl py-5 px-5"
			class:text-error={temperatureError}
			class:focus:text-error={temperatureError}
		>
			<p class="text-primary text-xl">Temperature</p>
		</div> -->

		{#if temperatureError}
			<p class="text-sm text-error">{temperatureError}</p>
		{/if}
	</AttributeBox>

	<AttributeBox title="Bleeding">
		<span class="mt-[3px]" slot="icon"><ContrastDropLine /></span>
		<div class="flex justify-between">
			<input
				class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mb-2"
				type="checkbox"
				aria-label={!flow ? 'Period?' : 'Flow'}
				bind:checked={flow}
			/>
			<input
				class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mb-2"
				type="checkbox"
				aria-label="Spotting"
			/>
		</div>

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
					<span>Light</span>
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
	</AttributeBox>

	<AttributeBox title="Cervical fluid">
		<span class="mt-[3px]" slot="icon"><ContrastDropFill /></span>
		<input
			name="cervical-fluid"
			type="radio"
			aria-label="Dry"
			class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mr-2 mb-3"
		/>
		<input
			name="cervical-fluid"
			type="radio"
			aria-label="Sticky"
			class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mr-2"
		/>
		<input
			name="cervical-fluid"
			type="radio"
			aria-label="Creamy"
			class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mr-2"
		/>
		<input
			name="cervical-fluid"
			type="radio"
			aria-label="Watery"
			class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mr-2"
		/>
		<input
			name="cervical-fluid"
			type="radio"
			aria-label="Egg white"
			class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral"
		/>
	</AttributeBox>

	<AttributeBox title="Notes">
		<span slot="icon"><Edit2Line /></span>
		<textarea name="notes" class="textarea textarea-secondary w-full h-full text-primary" />
	</AttributeBox>

	<div class="flex">
		{#if temperature || flow}
			<button class="btn btn-sm btn-error" on:click|preventDefault={handleDelete}>Delete</button>
		{/if}

		<div class="w-full text-right">
			<button class="btn btn-sm btn-ghost" on:click|preventDefault={handleClose}>Cancel</button>
			<button class="btn btn-sm btn-accent" on:click|preventDefault={handleSubmit}>Save</button>
		</div>
	</div>
</div>
