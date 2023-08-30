<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import { db } from '../../stores/db';

	let user = db.cloud.currentUser;

	const login = async () => {
		await db.cloud.login();
	};
</script>

<div class="flex flex-col h-screen bg-accent">
	<Navbar view="account" />

	<div class="p-4">
		<div class="bg-base-100 rounded-xl p-4">
			{#if $user.isLoggedIn}
				Welcome {$user.name}
			{:else}
				<button on:click={login}>Login</button>
			{/if}
		</div>
	</div>
</div>
