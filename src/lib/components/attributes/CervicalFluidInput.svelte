<script lang="ts">
	export let fluid: string | undefined = undefined;
</script>

{#each ['dry', 'sticky', 'creamy', 'watery', 'egg white'] as fluidKey}
	<input
		name="cervical-fluid"
		type="radio"
		aria-label={fluidKey.toLowerCase()}
		bind:group={fluid}
		value={fluidKey}
		class="btn btn-sm border-none hover:bg-secondary bg-accent text-neutral mr-2 mb-2"
	/>
{/each}
