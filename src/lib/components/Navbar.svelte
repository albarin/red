<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Optional } from '$lib/models/optional';
	import { liveQuery } from 'dexie';
	import { db } from '../../stores/db.js';

	export let view: string;
	export let syncing: boolean = false;
	export let currentCycleIndex: Optional<number> = undefined;

	let user = db.cloud.currentUser;

	$: cycles = liveQuery(async () => {
		return await db.getAllCycles();
	});

	const login = async () => {
		await db.cloud.login();
	};

	const logout = async () => {
		await db.delete();
		await db.open();
		goto('/');
	};

	const initials = (username: Optional<string>) => {
		if (!username) {
			return '';
		}

		const [first, last] = username.split('@');

		return `${first[0]}${last[0]}`.toUpperCase();
	};
</script>

<div class="navbar bg-neutral text-white px-5">
	<div class="navbar-start">
		<a href="/" class="normal-case font-semibold text-xl">Red</a>
	</div>
	<div class="navbar-center hidden sm:flex">
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
			{#if $cycles && currentCycleIndex}
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
			{/if}
		</div>
	</div>
	<div class="navbar-end">
		{#if syncing}
			<span class="loading loading-spinner text-primary mr-4" />
		{/if}
		<div>
			{#if $user.isLoggedIn}
				<button on:click={logout}>Logout</button>
				<a href="/account" class="text-xs" title={$user.name}>
					<div class="avatar placeholder ml-2">
						<div class="bg-primary text-neutral-content rounded-full w-9">
							{initials($user.name)}
						</div>
					</div>
				</a>
			{:else if !syncing}
				<button on:click={login}>Login</button>
				<a href="/account">
					<div class="avatar placeholder ml-2">
						<div class="bg-primary text-neutral-content rounded-full w-9">?</div>
					</div>
				</a>
			{/if}
		</div>
	</div>
</div>
