<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { DateTime, Interval } from 'luxon';

	import { validateTemperature } from '$lib/utils/validation';
	import { db, type Day } from '../../stores/db';
	import { format } from '$lib/utils/date';
	import { arrayToObject } from '$lib/utils/array';
	import AttributeWrapper from './attributes/AttributeWrapper.svelte';
	import TemperatureInput from './attributes/TemperatureInput.svelte';

	const dispatch = createEventDispatcher();

	export let date: string | undefined = undefined;
	export let temperature: number | undefined = undefined;
	export let flow: number | undefined = undefined;

	let wasSubmitted: boolean = false;
	let temperatureError: string | undefined;

	let shouldFillPeriodGaps: boolean = true;

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
</script>

<dialog bind:this={addDayDialog} class="modal text-center" on:close|preventDefault={handleClose}>
	<div
		style="max-height: 100%;"
		class="modal-box w-full max-w-[24rem] h-full sm:w-96 sm:h-[90%] !p-0 overflow-y-auto no-scrollbar rounded-xl"
	>
		<div class="bg-accent p-4">
			<p class="text-primary text-2xl mb-4">
				{#if date === format(DateTime.now())}Today,{/if}
				{DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
			</p>

			<AttributeWrapper title="Temperature" error={temperatureError}>
				<TemperatureInput bind:temperature />
			</AttributeWrapper>

			<AttributeWrapper title="Bleeding">
				<div class="text-center">
					<input
						class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mr-2"
						type="checkbox"
						aria-label={!flow ? 'Period?' : 'Flow'}
						bind:checked={flow}
					/>
					<input
						class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral"
						type="checkbox"
						aria-label="Spotting"
					/>
				</div>
				{#if flow}
					<div class="form-control w-full mt-2">
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
						{#if periodLastDay && date !== format(DateTime.fromISO(periodLastDay).plus( { days: 1 } ))}
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
			</AttributeWrapper>

			<AttributeWrapper title="Cervical fluid">
				<input
					name="cervical-fluid"
					type="radio"
					aria-label="Dry"
					class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mr-2 mb-2"
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
			</AttributeWrapper>

			<AttributeWrapper title="Notes">
				<textarea name="notes" class="textarea textarea-secondary w-full h-full text-primary" />
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
