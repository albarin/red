<script lang="ts">
	import { iso } from '$lib/utils/date';
	import type { DateTime } from 'luxon';
	import ArrowLeftDoubleLine from 'svelte-remixicon/lib/icons/ArrowLeftDoubleLine.svelte';
	import ArrowLeftSLine from 'svelte-remixicon/lib/icons/ArrowLeftSLine.svelte';
	import ArrowRightDoubleLine from 'svelte-remixicon/lib/icons/ArrowRightDoubleLine.svelte';
	import ArrowRightSLine from 'svelte-remixicon/lib/icons/ArrowRightSLine.svelte';

	export let month: DateTime;
</script>

<div class="bg-primary p-1 mb-2 text-white rounded-lg flex justify-between align-middle">
	<a href={`/${month.minus({ year: 1 }).toFormat('yyyy/M')}`}>
		<ArrowLeftDoubleLine class="text-3xl hover:cursor-pointer" />
	</a>

	<a href={`/${month.minus({ month: 1 }).toFormat('yyyy/M')}`}>
		<ArrowLeftSLine class="text-3xl hover:cursor-pointer" />
	</a>

	<h1 class="text-center text-xl">{month.toFormat('MMMM')} {month.year}</h1>

	<a href={`/${month.plus({ month: 1 }).toFormat('yyyy/M')}`}>
		<ArrowRightSLine class="text-3xl hover:cursor-pointer" />
	</a>

	<a href={`/${month.plus({ year: 1 }).toFormat('yyyy/M')}`}>
		<ArrowRightDoubleLine class="text-3xl hover:cursor-pointer" />
	</a>
</div>
