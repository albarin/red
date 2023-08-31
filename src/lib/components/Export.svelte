<script lang="ts">
	import { db } from '../../stores/db';

	const exportDays = async () => {
		const days = await db.getAllDays();

		if (!days) {
			return;
		}

		const dataRows = days.map((day) => {
			return [day.date, day.temperature, day.flow];
		});

		const rows = [Object.keys(days[0]), ...dataRows];
		let csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');

		var encodedUri = encodeURI(csvContent);
		var link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', 'days.csv');
		document.body.appendChild(link); // Required for FF

		link.click();
	};
</script>

<button class="btn btn-primary btn-sm" on:click={exportDays}> Export </button>
