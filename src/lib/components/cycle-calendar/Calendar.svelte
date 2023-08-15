<script lang="ts">
	import type { Cycle } from '$lib/models/cycle';
	import CycleHeader from './Header.svelte';

	export let cycle: Cycle;
</script>

<div class="bg-base-100 p-4 rounded-xl">
	<CycleHeader {cycle} />
</div>
