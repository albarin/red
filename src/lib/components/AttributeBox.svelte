<script lang="ts">
	export let title: string = '';
	export let align: string = 'left';

	let alignClass: string;
	$: alignClass = `text-${align}`;
</script>

<div class="bg-white rounded-xl p-5 mb-4">
	{#if title}
		<p class="text-primary text-xl">{title}</p>
	{/if}
	<div class={`${alignClass} mt-4`}>
		<slot />
	</div>
</div>
