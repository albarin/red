<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import { db } from '../../stores/db';

	let user = db.cloud.currentUser;

	const login = async () => {
		await db.cloud.login();
	};
</script>

<div class="flex flex-col h-screen bg-accent text-primary">
	<Navbar view="account" />

	<div class="p-4 mx-auto w-1/2">
		<div class="bg-base-100 rounded-xl p-4">
			{#if $user.isLoggedIn}
				Welcome <strong>{$user.name}</strong>
			{:else}
				Hi! 👋 <button class="btn-link" on:click={login}>Login</button> to make your data available on
				all your devices.
			{/if}
		</div>
	</div>
</div>
