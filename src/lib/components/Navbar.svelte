<script lang="ts">
	import type { Optional } from '$lib/models/optional';
	import { db } from '../../stores/db.js';

	export let view: string;
	export let syncing: boolean = false;
	export let currentCycleIndex: Optional<number>;

	const login = async () => {
		await db.cloud.login();
	};

	const logout = async () => {
		await db.delete();
		await db.open();
	};

	const initials = (username: Optional<string>) => {
		if (!username) {
			return '';
		}

		const [first, last] = username.split('@');

		return `${first[0]}${last[0]}`.toUpperCase();
	};

	let user = db.cloud.currentUser;
</script>

<div class="navbar bg-neutral text-white px-5">
	<div class="navbar-start">
		<a href="/" class="normal-case font-semibold text-xl">Red</a>
	</div>
	<div class="navbar-center hidden sm:flex">
		{#if currentCycleIndex}
			<div class="flex gap-2">
				<a
					href="/"
					class:btn-primary={view === 'month'}
					class:bg-neutral={view !== 'month'}
					class:border-neutral={view !== 'month'}
					class:text-accent={view !== 'month'}
					class="btn btn-sm hover:bg-neutral-focus hover:border-neutral"
				>
					Calendar
				</a>
				<a
					href={`/cycle/${currentCycleIndex}`}
					class:btn-primary={view === 'cycle'}
					class:bg-neutral={view !== 'cycle'}
					class:border-neutral={view !== 'cycle'}
					class:text-accent={view !== 'cycle'}
					class="btn btn-sm hover:bg-neutral-focus hover:border-neutral">Cycle</a
				>
				<a
					href="/cycles"
					class:btn-primary={view === 'cycles'}
					class:bg-neutral={view !== 'cycles'}
					class:border-neutral={view !== 'cycles'}
					class:text-accent={view !== 'cycles'}
					class="btn btn-sm hover:bg-neutral-focus hover:border-neutral"
				>
					All cycles
				</a>
			</div>
		{/if}
	</div>
	<div class="navbar-end">
		{#if syncing}
			<span class="loading loading-spinner text-primary mr-4" />
		{/if}
		<div>
			{#if $user.isLoggedIn}
				<button on:click={logout}>Logout</button>
				<div class="avatar placeholder ml-2">
					<div class="bg-primary text-neutral-content rounded-full w-9">
						<a href="/" class="text-xs" title={$user.name}>{initials($user.name)}</a>
					</div>
				</div>
			{:else}
				<button on:click={login}>Login</button>
			{/if}
		</div>
	</div>
</div>
