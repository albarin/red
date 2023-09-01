<script lang="ts">
	import Export from '$lib/components/Export.svelte';
	import Import from '$lib/components/Import.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { liveQuery } from 'dexie';
	import { db } from '../../stores/db';

	let user = db.cloud.currentUser;

	let dataAvailable: boolean = false;
	$: dataAvailable = $days && $days.length > 0;

	$: days = liveQuery(async () => {
		return await db.getAllDays();
	});

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

	let syncState = 'in-sync';
	db.cloud.syncState.subscribe((state) => {
		syncState = state.phase;
	});

	const syncing = (syncState: string): boolean => {
		return syncState !== 'in-sync';
	};
</script>

<div class="flex flex-col h-screen bg-accent text-primary">
	<Navbar view="account" syncing={syncing(syncState)} />

	<div class="p-4 mx-auto w-full md:w-3/4 lg:w-1/2">
		{#if syncState === 'initial'}
			<div class="bg-accent-focus animate-pulse rounded-xl p-6 h-[408px]" />
		{:else}
			<div class="bg-base-100 rounded-xl p-6">
				<div>
					{#if $user.isLoggedIn}
						Welcome <strong>{$user.name}</strong>
					{:else}
						<p>Hi! 👋</p>
						<p>
							<button class="btn-link" on:click={login}>Login</button> to make your data available on
							all your devices.
						</p>
					{/if}
				</div>

				<div class="divider" />

				<div>
					<p class="mb-2">Import your period data from a CSV backup file</p>
					<Import />
				</div>

				<div class="divider" />

				<div>
					<p class="mb-2">Export your period data as a CSV file</p>
					<Export enabled={dataAvailable} />
				</div>

				<div class="divider" />

				<div>
					<p class="mb-2">Remove all your period data</p>
					<div class="flex gap-4 items-center">
						<button class="btn btn-error btn-sm" on:click={handleDelete} disabled={!dataAvailable}>
							Delete
						</button>
						{#if !dataAvailable}
							<span class="text-neutral">You still don't have any available data to delete!</span>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
