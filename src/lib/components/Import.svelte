<script lang="ts">
	import { refreshCycles } from '$lib/cycles';
	import type { Day } from '$lib/models/day';
	import { db } from '../../stores/db';

	let uploader: HTMLInputElement;
	let uploading: boolean = false;
	let finishedUploading: boolean = false;
	let error: string = '';

	const setError = (msg) => {
		console.error(msg);
		error = msg;
		uploading = false;
		finishedUploading = true;
	};

	const upload = async (e) => {
		error = '';
		uploading = true;

		let maxFileSize = 3145728;
		const file = uploader.files[0];

		const fileExtensionArray = file.type.split('/');
		const fileExtension = fileExtensionArray[fileExtensionArray.length - 1];

		if (!fileExtension.includes('csv')) {
			setError('Wrong file type, should be CSV');
			return;
		}

		if (file.size > maxFileSize) {
			setError('The file is too big');
			return;
		}

		const fileContent = await file.text();
		const rows = fileContent.trim().split('\n');

		const headers = rows[0].split(',');
		if (headers.length != 5) {
			setError('Invalid CSV format');
			return;
		}

		const data = rows.slice(1).map((row) => {
			const values = row.split(',');
			return headers.reduce((obj, header, i) => {
				if (!values[i]) {
					return obj;
				}
				obj[header] = ['date', 'notes', 'fluid'].includes(header) ? values[i] : Number(values[i]);
				return obj;
			}, {});
		}) as Day[];

		try {
			const overridenDays = await overrideDays(data);
			await db.days.bulkPut(overridenDays);
		} catch (error) {
			setError(`Failed to import ${file.name}: ${error}`);
			return;
		}

		uploading = false;
		finishedUploading = true;
		refreshCycles();
	};

	const overrideDays = async (daysToImport: Day[]): Promise<Day[]> => {
		const days = await db.getAllDays();

		return daysToImport.map((dayToImport) => {
			const dayToOverride = days.find((d) => d.date === dayToImport.date);
			if (dayToOverride) {
				dayToImport.id = dayToOverride.id;
			}
			return dayToImport;
		});
	};
</script>

<div class="flex gap-4 items-center">
	<input
		type="file"
		class="file-input file-input-sm file-input-bordered file-input-primary w-full max-w-xs"
		bind:this={uploader}
		on:change|preventDefault={upload}
	/>

	{#if uploading}
		<span class="loading loading-spinner loading-md" />
	{:else if finishedUploading}
		{#if error}
			<span class="text-error">
				{error}
			</span>
		{:else}
			<span class="text-primary">
				Import finished go to <a class="btn-link" href="/">calendar</a>!
			</span>
		{/if}
	{/if}
</div>
