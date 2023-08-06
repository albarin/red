<script lang="ts">
	import { FluidKeys, type Fluid } from '$lib/utils/models';

	export let fluid: Fluid | undefined = undefined;
</script>

{#each FluidKeys as fluidKey}
	<input
		name="cervical-fluid"
		type="radio"
		aria-label={fluidKey.toLowerCase()}
		bind:group={fluid}
		value={fluidKey}
		class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mr-2 mb-2"
	/>
{/each}
