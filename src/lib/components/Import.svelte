<script lang="ts">
	import { db } from '../../stores/db';

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
				obj[header] = ['date', 'notes', 'fluid'].includes(header) ? values[i] : Number(values[i]);
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

<input
	type="file"
	class="file-input file-input-sm file-input-bordered file-input-primary w-full max-w-xs"
	bind:this={uploader}
	on:change|preventDefault={upload}
/>
