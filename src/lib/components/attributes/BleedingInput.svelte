<script lang="ts">
	import { db } from '../../../stores/db';
	import { toISOformat, toDateTime } from '$lib/utils/date';
	import type { DateTime } from 'luxon';

	const LIGHT = 1;
	const MEDIUM = 2;
	const HEAVY = 3;

	export let date: string | undefined = undefined;
	export let bleeding: string | undefined = undefined;
	export let flow: number | undefined = bleeding ? MEDIUM : undefined;

	$: console.log({ bleeding, bleedingFlow: flow });

	let shouldFillPeriodGaps: boolean = true;

	$: if (bleeding === 'period' && !flow) {
		flow = MEDIUM;
	}

	$: if (bleeding === 'spotting') {
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
		aria-label={bleeding ? 'Period?' : 'Flow'}
		bind:group={bleeding}
		value="period"
	/>
	<input
		class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral"
		type="radio"
		aria-label="Spotting"
		bind:group={bleeding}
		value="spotting"
	/>
</div>

{#if bleeding === 'period'}
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
					<input
						type="checkbox"
						class="checkbox checkbox-primary"
						bind:checked={shouldFillPeriodGaps}
					/>
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
