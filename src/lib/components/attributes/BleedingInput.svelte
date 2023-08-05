<script lang="ts">
	import { db } from '../../../stores/db';
	import { toISOformat, toDateTime } from '$lib/utils/date';
	import type { DateTime } from 'luxon';

	const PERIOD = 'period';
	const SPOTTING = 'spotting';

	const FLOW_SPOTTING = 0;
	const FLOW_LIGHT = 1;
	const FLOW_MEDIUM = 2;
	const FLOW_HEAVY = 3;

	const isPeriod = (flow: number | undefined): boolean => {
		if (flow === undefined) {
			return false;
		}

		return flow !== FLOW_SPOTTING;
	};

	const flowToPeriod = (flow: number | undefined): string | undefined => {
		if (flow === undefined) {
			return undefined;
		}

		return flow === FLOW_SPOTTING ? SPOTTING : PERIOD;
	};

	export let date: string | undefined = undefined;
	export let flow: number | undefined = undefined;
	export let fillGaps: boolean = false;

	let bleeding: string | undefined = flowToPeriod(flow);
	let prevFlow: number | undefined = FLOW_MEDIUM;

	$: if (bleeding === PERIOD && !flow) {
		flow = prevFlow || FLOW_MEDIUM;
	}

	$: if (bleeding === SPOTTING) {
		prevFlow = flow;
		flow = FLOW_SPOTTING;
	}

	$: if (!bleeding) {
		flow = undefined;
	}

	const periodLastDay = async (date: string | undefined): Promise<DateTime | undefined> => {
		if (!date) {
			return undefined;
		}

		const prevWeekDays = await db.getPreviousWeekDays(date);
		const prevWeekPeriodDays = prevWeekDays.filter((day) => day.flow);
		const closestPeriodDay = prevWeekPeriodDays[prevWeekPeriodDays.length - 1];

		return closestPeriodDay ? toDateTime(closestPeriodDay.date) : undefined;
	};
</script>

<div class="text-center">
	<input
		class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mr-2"
		type="radio"
		aria-label="Period"
		bind:group={bleeding}
		value={PERIOD}
	/>
	<input
		class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral"
		type="radio"
		aria-label="Spotting"
		bind:group={bleeding}
		value={SPOTTING}
	/>
	{#if bleeding}
		<input
			class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral"
			type="radio"
			aria-label="None"
			bind:group={bleeding}
			value={undefined}
		/>
	{/if}
</div>

{#if isPeriod(flow)}
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
		{#if periodLastDay && date !== toISOformat(periodLastDay.plus({ days: 1 }))}
			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-2">
					<input type="checkbox" class="checkbox checkbox-primary" bind:checked={fillGaps} />
					<span class="label-text">
						Set days from <strong class="font-semibold text-primary">
							{periodLastDay.plus({ days: 1 }).toLocaleString({
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
