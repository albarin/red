<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import { createEventDispatcher } from 'svelte';
	import ArrowLeftDoubleLine from 'svelte-remixicon/lib/icons/ArrowLeftDoubleLine.svelte';
	import ArrowLeftSLine from 'svelte-remixicon/lib/icons/ArrowLeftSLine.svelte';
	import ArrowRightDoubleLine from 'svelte-remixicon/lib/icons/ArrowRightDoubleLine.svelte';
	import ArrowRightSLine from 'svelte-remixicon/lib/icons/ArrowRightSLine.svelte';

	const dispatch = createEventDispatcher();

	export let cycle: Cycle;
</script>

<div class="bg-primary p-1 mb-2 text-white rounded-lg flex justify-between align-middle">
	<ArrowLeftDoubleLine class="text-3xl hover:cursor-pointer" on:click={() => dispatch('first')} />
	<ArrowLeftSLine class="text-3xl hover:cursor-pointer" on:click={() => dispatch('back')} />

	<h1 class="text-center text-xl">Cycle {cycle.number}</h1>

	<ArrowRightSLine class="text-3xl hover:cursor-pointer" on:click={() => dispatch('forward')} />
	<ArrowRightDoubleLine class="text-3xl hover:cursor-pointer" on:click={() => dispatch('last')} />
</div>
