<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import ArrowLeftDoubleLine from 'svelte-remixicon/lib/icons/ArrowLeftDoubleLine.svelte';
	import ArrowLeftSLine from 'svelte-remixicon/lib/icons/ArrowLeftSLine.svelte';
	import ArrowRightDoubleLine from 'svelte-remixicon/lib/icons/ArrowRightDoubleLine.svelte';
	import ArrowRightSLine from 'svelte-remixicon/lib/icons/ArrowRightSLine.svelte';

	export let cycle: Cycle;
	export let cyclesLength: number;
</script>

<div class="bg-primary p-1 mb-2 text-white rounded-lg flex justify-between align-middle">
	<a href="/cycle/1">
		<ArrowLeftDoubleLine class="text-3xl hover:cursor-pointer" />
	</a>
	<a href={`/cycle/${cycle.number <= 1 ? 1 : cycle.number - 1}`}>
		<ArrowLeftSLine class="text-3xl hover:cursor-pointer" />
	</a>

	<h1 class="text-center text-xl">Cycle {cycle.number}</h1>

	<a href={`/cycle/${cycle.number >= cyclesLength ? cyclesLength : cycle.number + 1}`}>
		<ArrowRightSLine class="text-3xl hover:cursor-pointer" />
	</a>
	<a href={`/cycle/${cyclesLength}`}>
		<ArrowRightDoubleLine class="text-3xl hover:cursor-pointer" />
	</a>
</div>
