<script lang="ts">
	export let title: string = '';
	export let align: string = 'left';

	let alignClass: string;
	$: alignClass = `text-${align}`;
</script>

<div class="bg-white rounded-xl text-center pt-2 pb-3 px-3 mb-4">
	{#if title}
		<div class="text-lg font-semibold">
			<p class="text-primary ml-1">{title}</p>
		</div>
	{/if}
	<div class={`${alignClass} mt-2`}>
		<slot />
	</div>
</div>
