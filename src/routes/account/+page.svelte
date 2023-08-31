<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import { db } from '../../stores/db';

	let user = db.cloud.currentUser;

	const login = async () => {
		await db.cloud.login();
	};

	const handleDelete = async () => {
		if (
			!confirm("Are you sure you want to delete all your data? You won't be able to recover it!!!")
		) {
			return;
		}

		await db.days.clear();
    await db.cycles.clear();
	};
</script>

<div class="flex flex-col h-screen bg-accent text-primary">
	<Navbar view="account" />

	<div class="p-4 mx-auto w-1/2">
		<div class="bg-base-100 rounded-xl p-6">
			<p>
				{#if $user.isLoggedIn}
					Welcome <strong>{$user.name}</strong>
				{:else}
					Hi! 👋 <button class="btn-link" on:click={login}>Login</button> to make your data available
					on all your devices.
				{/if}
			</p>

			<div class="divider" />

			<div>
				<p>Remove all your period data</p>
				<button class="btn btn-error btn-sm mt-2" on:click={handleDelete}>Delete</button>
			</div>
		</div>
	</div>
</div>
