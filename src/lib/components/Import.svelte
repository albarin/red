<script lang="ts">
	import TempColdLine from 'svelte-remixicon/lib/icons/TempColdLine.svelte';
	import Download2Line from 'svelte-remixicon/lib/icons/Download2Line.svelte';
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

	let uploader: HTMLInputElement;
	const upload = async (e) => {
		let maxFileSize = 3145728;
		const file = uploader.files[0];

		const fileExtensionArray = file.type.split('/');
		const fileExtension = fileExtensionArray[fileExtensionArray.length - 1];

		if (!fileExtension.includes('csv')) {
			console.error('Wrong file type');
			return;
		}

		if (file.size > maxFileSize) {
			console.error('Above the max file size threshold');
			return;
		}

		const fileContent = await file.text();
		const rows = fileContent.trim().split('\n');

		const headers = rows[0].split(',');
		const data = rows.slice(1).map((row) => {
			const values = row.split(',');
			return headers.reduce((obj, header, i) => {
				if (!values[i]) {
					return obj;
				}
				obj[header] = header === 'date' ? values[i] : Number(values[i]);
				return obj;
			}, {});
		});

		try {
			await db.days.bulkPut(data);
		} catch (error) {
			console.error(`Failed to import ${file.name}: ${error}`);
		}
	};
</script>

<!-- <div class="absolute bottom-4">
	<button class="btn btn-accent" on:click={changeSelectedDay(Interval.fromDateTimes(now, now))}>
		Add<TempColdLine class="text-lg -ml-1" />
	</button>
	<button class="btn btn-primary" on:click={exportDays}>
		Export<Download2Line class="text-lg -ml-1" />
	</button>
</div>
 -->
<input
	type="file"
	class="file-input file-input-bordered file-input-primary w-full max-w-xs"
	bind:this={uploader}
	on:change|preventDefault={upload}
/>
