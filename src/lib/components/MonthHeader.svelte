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

<div class="bg-gray-200 rounded-md flex justify-between py-2 px-2 mb-2">
	<ArrowLeftDoubleLine
		class="mt-1 bg-gray-300 rounded-md"
		on:click={() => dispatch('back', { interval: 'year' })}
	/>
	<ArrowLeftSLine
		class="mt-1 bg-gray-300 rounded-md"
		on:click={() => dispatch('back', { interval: 'month' })}
	/>

	<h1 class="text-center font-semibold">{month.toFormat('MMMM')} {month.year}</h1>

	<ArrowRightSLine
		class="mt-1 bg-gray-300 rounded-md"
		on:click={() => dispatch('forward', { interval: 'month' })}
	/>
	<ArrowRightDoubleLine
		class="mt-1 bg-gray-300 rounded-md"
		on:click={() => dispatch('forward', { interval: 'year' })}
	/>
</div>
