<script>
	import AddDayForm from './AddDayForm.svelte';
	import Calendar from './Calendar.svelte';
</script>

<div>
	<Calendar />

	<AddDayForm />

	<button class="btn" onclick="add_day_modal.showModal()">Add day</button>
</div>
