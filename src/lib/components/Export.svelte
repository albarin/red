<script lang="ts">
	import { db } from '../../stores/db';

	export let enabled: boolean = false;

	const exportDays = async () => {
		const days = await db.getAllDays();
		if (!days) {
			return;
		}

		const dataRows = days.map((day) => {
			return [day.date, day.temperature, day.flow, day.fluid, day.notes];
		});

		const rows = [Object.keys(days[0]).slice(1), ...dataRows];
		let csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', 'days.csv');
		document.body.appendChild(link); // Required for FF

		link.click();
	};
</script>

<div class="flex gap-4 items-center">
	<button class="btn btn-primary btn-sm" disabled={!enabled} on:click={exportDays}>Export</button>
	{#if !enabled}
		<span class="text-neutral">You still don't have any available data to export!</span>
	{/if}
</div>
