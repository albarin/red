<script lang="ts">
	export let title: string = '';
	export let align: string = 'left';

	let alignClass: string;
	$: alignClass = `text-${align}`;
</script>

<div class="bg-white rounded-xl px-3 py-4 mb-4">
	{#if title}
		<div class="flex text-xl">
			<slot class="mt-[3px]" name="icon" />
			<p class="text-primary ml-1">{title}</p>
		</div>
	{/if}
	<div class={`${alignClass} mt-4`}>
		<slot />
	</div>
</div>
