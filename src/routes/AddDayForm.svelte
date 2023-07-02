<script>
	import dayjs from 'dayjs';
	let today = dayjs().format('YYYY-MM-DD');
</script>

<div class="bg-slate-300 p-2">
	<input
		class="mb-2 p-2 border-gray-200 border rounded-lg w-full"
		type="number"
		step="0.01"
		min="30"
		max="40"
		placeholder="Temperature"
	/>
	<input class="mb-2 p-2 border-gray-200 border rounded-lg w-full" type="date" value={today} />

	<button class="bg-blue-500 text-white rounded-lg px-3 py-1">Save</button>
</div>
