<script lang="ts">
	import ArrowLeftSLine from 'svelte-remixicon/lib/icons/ArrowLeftSLine.svelte';
	import ArrowRightSLine from 'svelte-remixicon/lib/icons/ArrowRightSLine.svelte';
	import ArrowLeftDoubleLine from 'svelte-remixicon/lib/icons/ArrowLeftDoubleLine.svelte';
	import ArrowRightDoubleLine from 'svelte-remixicon/lib/icons/ArrowRightDoubleLine.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { DateTime } from 'luxon';

	const dispatch = createEventDispatcher();

	export let month: DateTime;
</script>

<div class="bg-accent p-2 mb-2 text-white rounded-lg flex justify-between align-middle">
	<ArrowLeftDoubleLine
		class="text-3xl bg-accent hover:cursor-pointer"
		on:click={() => dispatch('back', { interval: 'year' })}
	/>
	<ArrowLeftSLine
		class="text-3xl bg-accent hover:cursor-pointer"
		on:click={() => dispatch('back', { interval: 'month' })}
	/>

	<h1 class="text-center text-2xl">{month.toFormat('MMMM')} {month.year}</h1>

	<ArrowRightSLine
		class="text-3xl bg-accent hover:cursor-pointer"
		on:click={() => dispatch('forward', { interval: 'month' })}
	/>
	<ArrowRightDoubleLine
		class="text-3xl bg-accent hover:cursor-pointer"
		on:click={() => dispatch('forward', { interval: 'year' })}
	/>
</div>
