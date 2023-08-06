<script lang="ts">
	export let notes: string | undefined = undefined;
</script>

<textarea class="textarea textarea-secondary w-full h-full text-primary" bind:value={notes} />
