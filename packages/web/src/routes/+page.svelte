<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { browser } from "$app/environment";
	import {
		fetchTattoos,
		fetchRunegrafts,
		getSnapshotInfo,
		type TattooResponse,
		type RunegraftResponse,
	} from "$lib/api";
	import * as Select from "$lib/components/ui/select";
	import { Badge } from "$lib/components/ui/badge";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { Button } from "$lib/components/ui/button";


	const LEAGUES = [
		{ value: "mirage", label: "Mirage" },
		{ value: "hardcore-mirage", label: "Hardcore Mirage" },
		{ value: "standard", label: "Standard" },
		{ value: "hardcore", label: "Hardcore" },
	];

	const ATTRIBUTE_COLORS: Record<string, string> = {
		INT: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
		DEX: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/25",
		STR: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
	};

	type Tab = "tattoos" | "runegrafts" | "cheatsheet" | "guide";

	let activeTab = $state<Tab>("tattoos");
	let league = $state("mirage");

	// Tattoo state
	let tattooData = $state<TattooResponse | null>(null);
	let tattooLoading = $state(false);
	let tattooError = $state<string | null>(null);

	// Runegraft state
	let runegraftData = $state<RunegraftResponse | null>(null);
	let runegraftLoading = $state(false);
	let runegraftError = $state<string | null>(null);

	// Snapshot state
	let snapshotActive = $state(false);
	let snapshotDate = $state<string | null>(null);
	let snapshotLeague = $state<string | null>(null);

	function checkSnapshot() {
		const info = getSnapshotInfo();
		snapshotActive = info.isSnapshot;
		snapshotDate = info.snapshotDate;
		snapshotLeague = info.snapshotLeague;
	}

	// Shared
	let cachedAt = $state<string | null>(null);
	let freshnessText = $state("");
	let freshnessInterval: ReturnType<typeof setInterval> | undefined;

	const chaosFmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const divineFmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

	const VISIBLE_TATTOOS = 8;
	const VISIBLE_RUNEGRAFTS = 4;
	const ITEM_ROW_HEIGHT = 46; // px per item row (name + description + padding)

	// Mobile collapsible cards
	let isMobile = $state(false);
	let expandedCards = $state<Record<string, boolean>>({});

	function toggleCard(key: string) {
		if (!isMobile) return;
		expandedCards[key] = !expandedCards[key];
	}

	function isCardExpanded(key: string): boolean {
		return !isMobile || !!expandedCards[key];
	}

	let freshnessExact = $state("");

	let loading = $derived(
		activeTab === "tattoos" ? tattooLoading
		: activeTab === "runegrafts" ? runegraftLoading
		: false
	);
	let warnings = $derived(
		activeTab === "tattoos" ? (tattooData?.warnings ?? []) : (runegraftData?.warnings ?? [])
	);
	let stale = $derived(
		activeTab === "tattoos" ? (tattooData?.stale ?? false) : (runegraftData?.stale ?? false)
	);

	function updateFreshness() {
		if (!cachedAt) {
			freshnessText = "";
			freshnessExact = "";
			return;
		}
		const date = new Date(cachedAt);
		freshnessExact = date.toLocaleTimeString(undefined, {
			hour: "numeric",
			minute: "2-digit",
			second: "2-digit",
		});
		const diff = Date.now() - date.getTime();
		const seconds = Math.floor(diff / 1000);
		if (seconds < 60) {
			freshnessText = "just now";
		} else if (seconds < 3600) {
			const mins = Math.floor(seconds / 60);
			freshnessText = `${mins}m ago`;
		} else {
			const hrs = Math.floor(seconds / 3600);
			freshnessText = `${hrs}h ago`;
		}
	}

	function updateCachedAt() {
		if (activeTab === "tattoos" && tattooData) {
			cachedAt = tattooData.cachedAt;
		} else if (activeTab === "runegrafts" && runegraftData) {
			cachedAt = runegraftData.cachedAt;
		} else {
			cachedAt = null;
		}
		updateFreshness();
	}

	async function loadTattoos(selectedLeague: string, force = false) {
		tattooLoading = true;
		tattooError = null;
		try {
			tattooData = await fetchTattoos(selectedLeague, force);
		} catch (err) {
			tattooError = err instanceof Error ? err.message : "Unknown error";
			tattooData = null;
		} finally {
			tattooLoading = false;
			checkSnapshot();
			updateCachedAt();
		}
	}

	async function loadRunegrafts(selectedLeague: string, force = false) {
		runegraftLoading = true;
		runegraftError = null;
		try {
			runegraftData = await fetchRunegrafts(selectedLeague, force);
		} catch (err) {
			runegraftError = err instanceof Error ? err.message : "Unknown error";
			runegraftData = null;
		} finally {
			runegraftLoading = false;
			checkSnapshot();
			updateCachedAt();
		}
	}

	function handleRefresh() {
		if (activeTab === "tattoos") {
			loadTattoos(league, true);
		} else if (activeTab === "runegrafts") {
			loadRunegrafts(league, true);
		}
	}

	function handleLeagueChange(value: string | undefined) {
		if (value) {
			league = value;
			loadTattoos(value);
			loadRunegrafts(value);
		}
	}

	function switchTab(tab: Tab) {
		activeTab = tab;
		if (browser) window.location.hash = tab;
		updateCachedAt();
	}

	onMount(() => {
		// Hash routing for tabs
		const hash = window.location.hash.replace("#", "");
		if (["tattoos", "runegrafts", "cheatsheet", "guide"].includes(hash)) {
			activeTab = hash as Tab;
		} else {
			window.location.hash = activeTab;
		}
		const handleHashChange = () => {
			const h = window.location.hash.replace("#", "");
			if (["tattoos", "runegrafts", "cheatsheet", "guide"].includes(h)) {
				activeTab = h as Tab;
				updateCachedAt();
			}
		};
		window.addEventListener("hashchange", handleHashChange);

		// Mobile detection for collapsible cards
		const mq = window.matchMedia("(max-width: 768px)");
		isMobile = mq.matches;
		const handleMq = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
		};
		mq.addEventListener("change", handleMq);

		loadTattoos(league);
		loadRunegrafts(league);
		freshnessInterval = setInterval(updateFreshness, 15_000);

		return () => {
			window.removeEventListener("hashchange", handleHashChange);
			mq.removeEventListener("change", handleMq);
		};
	});

	onDestroy(() => {
		clearInterval(freshnessInterval);
	});
</script>

<div class="min-h-screen bg-background text-foreground flex flex-col">
	<header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-3">
				<h1 class="text-xl font-semibold">exiled<span class="text-muted-foreground">.</span></h1>
			</div>
			<div class="flex items-center gap-3">
				{#if !["cheatsheet", "guide"].includes(activeTab) && !snapshotActive}
					<button
						onclick={handleRefresh}
						disabled={loading}
						class="inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
						aria-label="Refresh prices"
						title="Refresh prices"
					>
						<span class="{loading ? 'animate-spin' : ''}">&#8635;</span>
					</button>
					<Select.Root type="single" value={league} onValueChange={handleLeagueChange} disabled={loading}>
						<Select.Trigger class="w-[180px] min-h-[44px] sm:min-h-0">
							<span data-slot="select-value">
								{LEAGUES.find((l) => l.value === league)?.label ?? league}
							</span>
						</Select.Trigger>
						<Select.Content>
							{#each LEAGUES as l}
								<Select.Item value={l.value}>{l.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
			</div>
		</div>
	</header>

	{#if snapshotActive}
		<div class="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-700 dark:text-amber-400">
			Viewing snapshot from {snapshotDate ? new Date(snapshotDate).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "unknown date"}
			{#if snapshotLeague}
				<span class="text-amber-600/80 dark:text-amber-500/80">({snapshotLeague} league)</span>
			{/if}
		</div>
	{/if}

	<main class="mx-auto max-w-5xl px-4 py-6 flex-1 w-full">
		<!-- Tab switcher -->
		<div class="mb-6 flex gap-1 rounded-lg border border-border bg-muted p-1 w-fit">
			<button
				onclick={() => switchTab("tattoos")}
				class="rounded-md px-4 py-2 text-sm font-medium transition-colors {activeTab === 'tattoos' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
			>
				Tattoos
			</button>
			<button
				onclick={() => switchTab("runegrafts")}
				class="rounded-md px-4 py-2 text-sm font-medium transition-colors {activeTab === 'runegrafts' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
			>
				Runegrafts
			</button>
			<button
				onclick={() => switchTab("cheatsheet")}
				class="rounded-md px-4 py-2 text-sm font-medium transition-colors {activeTab === 'cheatsheet' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
			>
				Cheatsheet
			</button>
			<button
				onclick={() => switchTab("guide")}
				class="rounded-md px-4 py-2 text-sm font-medium transition-colors {activeTab === 'guide' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
			>
				Guide
			</button>
		</div>

		{#if freshnessText && !["cheatsheet", "guide"].includes(activeTab)}
			<p class="mb-4 text-xs text-muted-foreground">
				{#if snapshotActive}
					Prices snapshotted {freshnessExact} &middot; {freshnessText}
				{:else}
					Prices fetched at {freshnessExact} &middot; {freshnessText}
				{/if}
			</p>
		{/if}

		<!-- Tattoo tab -->
		{#if activeTab === "tattoos"}
			{#if tattooLoading}
				<div class="grid gap-4 md:grid-cols-3" aria-live="polite" aria-busy="true">
					{#each Array(3) as _}
						<div class="rounded-lg border border-border p-4 space-y-3">
							<div class="flex items-center justify-between">
								<Skeleton class="h-6 w-24" />
								<Skeleton class="h-5 w-12 rounded-full" />
							</div>
							<div class="space-y-1">
								<Skeleton class="h-8 w-32" />
								<Skeleton class="h-4 w-24" />
							</div>
							<div class="border-t border-border pt-3 space-y-2">
								{#each Array(6) as _}
									<div class="flex justify-between">
										<Skeleton class="h-4 w-40" />
										<Skeleton class="h-4 w-12" />
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{:else if tattooError}
				<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center" aria-live="polite">
					<p class="text-destructive text-lg font-medium mb-2">Failed to load tattoo prices</p>
					<p class="text-destructive/80 text-sm mb-4">{tattooError}</p>
					<Button variant="destructive" onclick={() => loadTattoos(league)}>Try Again</Button>
				</div>
			{:else if tattooData}
				{#if warnings.length > 0}
					<div class="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
						{#if stale}
							<p class="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Showing stale data</p>
						{/if}
						{#each warnings as warning}
							<p class="text-sm text-yellow-700 dark:text-yellow-400">{warning}</p>
						{/each}
					</div>
				{/if}

				<div class="grid gap-4 md:grid-cols-3">
					{#each tattooData.ports as port, rank}
						<div class="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
							<!-- svelte-ignore a11y_no_static_element_interactions a11y_no_noninteractive_tabindex -->
							<div
								class="p-4 space-y-3 {isMobile ? 'cursor-pointer active:bg-accent/50' : ''}"
								onclick={() => toggleCard(`tattoo-${rank}`)}
								onkeydown={(e) => e.key === 'Enter' && toggleCard(`tattoo-${rank}`)}
								role={isMobile ? 'button' : undefined}
								tabindex={isMobile ? 0 : undefined}
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium text-muted-foreground">#{rank + 1}</span>
										<h2 class="text-lg font-semibold">{port.label}</h2>
									</div>
									<div class="flex items-center gap-2">
										<Badge variant="outline" class={ATTRIBUTE_COLORS[port.attribute] ?? ""}>
											{port.attribute}
										</Badge>
										{#if isMobile}
											<span class="text-muted-foreground text-sm transition-transform duration-200 {isCardExpanded(`tattoo-${rank}`) ? 'rotate-90' : ''}" aria-hidden="true">▸</span>
										{/if}
									</div>
								</div>
								<div>
									{#if port.avg_chaos_per_tattoo !== null}
										<p class="text-2xl font-bold tabular-nums text-amber-500 dark:text-amber-400">{chaosFmt.format(port.avg_chaos_per_tattoo)} <span class="text-sm font-normal">chaos/tattoo</span></p>
										{#if port.avg_divine_per_tattoo !== null}
											<p class="text-sm text-amber-600/70 dark:text-amber-500/70 tabular-nums">{divineFmt.format(port.avg_divine_per_tattoo)} divine/tattoo</p>
										{/if}
									{:else}
										<p class="text-lg text-muted-foreground">No price data</p>
									{/if}
								</div>
							</div>

							{#if isCardExpanded(`tattoo-${rank}`)}
							<div class="border-t border-border flex-1 overflow-y-auto snap-y snap-mandatory" style="max-height: {Math.min(port.tattoos.length, VISIBLE_TATTOOS) * ITEM_ROW_HEIGHT}px">
								<div class="divide-y divide-border">
									{#each port.tattoos.toSorted((a, b) => (b.chaos_value ?? -1) - (a.chaos_value ?? -1)) as tattoo}
										<div class="px-4 py-2 text-sm snap-start">
											<div class="flex items-center justify-between">
												<span class="truncate pr-2">{tattoo.tattoo_name.replace("Tattoo of the ", "")}</span>
												{#if tattoo.chaos_value !== null}
													<span class="tabular-nums font-medium shrink-0 text-amber-500 dark:text-amber-400">{chaosFmt.format(tattoo.chaos_value)}c</span>
												{:else}
													<span class="text-muted-foreground italic shrink-0">negligible</span>
												{/if}
											</div>
											{#if tattoo.description}
												<p class="text-xs text-muted-foreground mt-0.5 truncate">{tattoo.description}</p>
											{/if}
										</div>
									{/each}
									<div class="h-2"></div>
								</div>
							</div>
							{/if}
						</div>
					{/each}
				</div>

				<p class="mt-4 text-center text-xs text-muted-foreground">
					Drop weights assumed equal across all tattoos in pool. Actual distribution unconfirmed.
				</p>

				<div class="mt-6 rounded-lg border border-border bg-card p-4 text-sm space-y-2">
					<h3 class="font-semibold">Tattoo Shipment Rules</h3>
					<ul class="space-y-1 text-muted-foreground list-disc list-inside">
						<li>1 tattoo per <span class="text-foreground font-medium tabular-nums">100,000</span> goods value (crops, ores, or bars)</li>
						<li>Max <span class="text-foreground font-medium tabular-nums">39</span> tattoos at <span class="text-foreground font-medium tabular-nums">3,900,000</span> goods value</li>
						<li>Dust does <span class="text-foreground font-medium">not</span> count toward tattoo allocation — add it on top for bonus currency</li>
						<li>Aim for exact multiples of 100k to avoid wasting goods value</li>
					</ul>
				</div>
			{/if}
		{/if}

		<!-- Runegraft tab -->
		{#if activeTab === "runegrafts"}
			{#if runegraftLoading}
				<div class="grid gap-4 md:grid-cols-3" aria-live="polite" aria-busy="true">
					{#each Array(3) as _}
						<div class="rounded-lg border border-border p-4 space-y-3">
							<div class="flex items-center justify-between">
								<Skeleton class="h-6 w-24" />
								<Skeleton class="h-5 w-12 rounded-full" />
							</div>
							<div class="space-y-1">
								<Skeleton class="h-8 w-32" />
								<Skeleton class="h-4 w-24" />
							</div>
							<div class="border-t border-border pt-3 space-y-2">
								{#each Array(6) as _}
									<div class="flex justify-between">
										<Skeleton class="h-4 w-40" />
										<Skeleton class="h-4 w-12" />
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{:else if runegraftError}
				<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center" aria-live="polite">
					<p class="text-destructive text-lg font-medium mb-2">Failed to load runegraft prices</p>
					<p class="text-destructive/80 text-sm mb-4">{runegraftError}</p>
					<Button variant="destructive" onclick={() => loadRunegrafts(league)}>Try Again</Button>
				</div>
			{:else if runegraftData}
				{#if warnings.length > 0}
					<div class="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
						{#if stale}
							<p class="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Showing stale data</p>
						{/if}
						{#each warnings as warning}
							<p class="text-sm text-yellow-700 dark:text-yellow-400">{warning}</p>
						{/each}
					</div>
				{/if}

				<div class="grid gap-4 md:grid-cols-3">
					{#each runegraftData.ports as port, rank}
						<div class="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
							<!-- svelte-ignore a11y_no_static_element_interactions a11y_no_noninteractive_tabindex -->
							<div
								class="p-4 space-y-3 {isMobile ? 'cursor-pointer active:bg-accent/50' : ''}"
								onclick={() => toggleCard(`runegraft-${rank}`)}
								onkeydown={(e) => e.key === 'Enter' && toggleCard(`runegraft-${rank}`)}
								role={isMobile ? 'button' : undefined}
								tabindex={isMobile ? 0 : undefined}
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium text-muted-foreground">#{rank + 1}</span>
										<h2 class="text-lg font-semibold">{port.label}</h2>
									</div>
									<div class="flex items-center gap-2">
										<Badge variant="outline" class={ATTRIBUTE_COLORS[port.attribute] ?? ""}>
											{port.attribute}
										</Badge>
										{#if isMobile}
											<span class="text-muted-foreground text-sm transition-transform duration-200 {isCardExpanded(`runegraft-${rank}`) ? 'rotate-90' : ''}" aria-hidden="true">▸</span>
										{/if}
									</div>
								</div>
								<div>
									{#if port.avg_chaos_per_runegraft !== null}
										<p class="text-2xl font-bold tabular-nums text-amber-500 dark:text-amber-400">{chaosFmt.format(port.avg_chaos_per_runegraft)} <span class="text-sm font-normal">chaos/runegraft</span></p>
										{#if port.avg_divine_per_runegraft !== null}
											<p class="text-sm text-amber-600/70 dark:text-amber-500/70 tabular-nums">{divineFmt.format(port.avg_divine_per_runegraft)} divine/runegraft</p>
										{/if}
									{:else}
										<p class="text-lg text-muted-foreground">No price data</p>
									{/if}
								</div>
							</div>

							{#if isCardExpanded(`runegraft-${rank}`)}
							<div class="border-t border-border flex-1 overflow-y-auto snap-y snap-mandatory" style="max-height: {Math.min(port.runegrafts.length, VISIBLE_RUNEGRAFTS) * ITEM_ROW_HEIGHT}px">
								<div class="divide-y divide-border">
									{#each port.runegrafts.toSorted((a, b) => (b.chaos_value ?? -1) - (a.chaos_value ?? -1)) as runegraft}
										<div class="px-4 py-2 text-sm snap-start">
											<div class="flex items-center justify-between">
												<span class="truncate pr-2">{runegraft.runegraft_name.replace("Runegraft of the ", "").replace("Runegraft of ", "")}</span>
												{#if runegraft.chaos_value !== null}
													<span class="tabular-nums font-medium shrink-0 text-amber-500 dark:text-amber-400">{chaosFmt.format(runegraft.chaos_value)}c</span>
												{:else}
													<span class="text-muted-foreground italic shrink-0">negligible</span>
												{/if}
											</div>
											{#if runegraft.description}
												<p class="text-xs text-muted-foreground mt-0.5 truncate">{runegraft.description}</p>
											{/if}
										</div>
									{/each}
									<div class="h-2"></div>
								</div>
							</div>
							{/if}
						</div>
					{/each}
				</div>

				<p class="mt-4 text-center text-xs text-muted-foreground">
					Drop weights assumed equal across all runegrafts in pool. Actual distribution unconfirmed.
				</p>

				<div class="mt-6 rounded-lg border border-border bg-card overflow-hidden text-sm">
					<div class="p-4 space-y-2">
						<h3 class="font-semibold">Runegraft Shipment Rules</h3>
						<ul class="space-y-1 text-muted-foreground list-disc list-inside">
							<li>1 runegraft per <span class="text-foreground font-medium tabular-nums">400,000</span> goods value (crops, ores, or bars)</li>
							<li>Max <span class="text-foreground font-medium tabular-nums">9</span> runegrafts at <span class="text-foreground font-medium tabular-nums">3,600,000</span> goods value</li>
							<li>Dust does <span class="text-foreground font-medium">not</span> count toward runegraft allocation — add it on top for bonus currency</li>
						</ul>
					</div>
					<div class="border-t border-border px-4 py-3">
						<h4 class="text-xs font-medium text-muted-foreground mb-2">Breakpoints</h4>
						<div class="grid grid-cols-3 gap-x-4 gap-y-0.5 text-xs tabular-nums max-w-sm">
							<span class="text-muted-foreground">400,000</span><span class="font-medium">1</span><span></span>
							<span class="text-muted-foreground">800,000</span><span class="font-medium">2</span><span></span>
							<span class="text-muted-foreground">1,200,000</span><span class="font-medium">3</span><span></span>
							<span class="text-muted-foreground">1,600,000</span><span class="font-medium">4</span><span></span>
							<span class="text-muted-foreground">2,000,000</span><span class="font-medium">5</span><span></span>
							<span class="text-muted-foreground">2,400,000</span><span class="font-medium">6</span><span></span>
							<span class="text-muted-foreground">2,800,000</span><span class="font-medium">7</span><span></span>
							<span class="text-muted-foreground">3,200,000</span><span class="font-medium">8</span><span></span>
							<span class="text-muted-foreground">3,600,000</span><span class="font-medium">9</span><span class="text-muted-foreground">(max)</span>
						</div>
					</div>
				</div>
			{/if}
		{/if}

		<!-- Cheatsheet tab -->
		{#if activeTab === "cheatsheet"}
			<div class="space-y-6">
				<!-- Shipment Values -->
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					<div class="px-4 py-3 border-b border-border">
						<h2 class="text-lg font-semibold">Shipment Values</h2>
						<p class="text-sm text-muted-foreground">Per-unit value contributed to your shipment total</p>
					</div>
					<div class="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
						<!-- Ores & Bars -->
						<div class="p-4">
							<h3 class="text-sm font-medium text-muted-foreground mb-3">Ores &amp; Bars</h3>
							<table class="w-full text-sm">
								<thead>
									<tr class="text-left text-muted-foreground">
										<th class="pb-2 font-medium">Resource</th>
										<th class="pb-2 font-medium text-right">Ore</th>
										<th class="pb-2 font-medium text-right">Bar</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									<tr><td class="py-1.5">Crimson Iron</td><td class="py-1.5 text-right tabular-nums">4</td><td class="py-1.5 text-right tabular-nums font-medium">16</td></tr>
									<tr><td class="py-1.5">Orichalcum</td><td class="py-1.5 text-right tabular-nums">5</td><td class="py-1.5 text-right tabular-nums font-medium">22</td></tr>
									<tr><td class="py-1.5">Petrified Amber</td><td class="py-1.5 text-right tabular-nums">7</td><td class="py-1.5 text-right tabular-nums font-medium">30</td></tr>
									<tr><td class="py-1.5">Bismuth</td><td class="py-1.5 text-right tabular-nums">12</td><td class="py-1.5 text-right tabular-nums font-medium">50</td></tr>
									<tr><td class="py-1.5">Verisium</td><td class="py-1.5 text-right tabular-nums">22</td><td class="py-1.5 text-right tabular-nums font-medium">90</td></tr>
								</tbody>
							</table>
							<p class="mt-2 text-xs text-muted-foreground">Bars count as 5 units toward port quota fulfillment.</p>
						</div>
						<!-- Crops -->
						<div class="p-4">
							<h3 class="text-sm font-medium text-muted-foreground mb-3">Crops</h3>
							<table class="w-full text-sm">
								<thead>
									<tr class="text-left text-muted-foreground">
										<th class="pb-2 font-medium">Crop</th>
										<th class="pb-2 font-medium text-right">Value</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									<tr><td class="py-1.5">Wheat</td><td class="py-1.5 text-right tabular-nums font-medium">12</td></tr>
									<tr><td class="py-1.5">Corn</td><td class="py-1.5 text-right tabular-nums font-medium">15</td></tr>
									<tr><td class="py-1.5">Pumpkin</td><td class="py-1.5 text-right tabular-nums font-medium">18</td></tr>
									<tr><td class="py-1.5">Orgourd</td><td class="py-1.5 text-right tabular-nums font-medium">21</td></tr>
									<tr><td class="py-1.5">Blue Zanthimum</td><td class="py-1.5 text-right tabular-nums font-medium">24</td></tr>
								</tbody>
							</table>
							<p class="mt-2 text-xs text-muted-foreground">Crops return gear. Ores return currency (changed in 3.28).</p>
						</div>
					</div>
				</div>

				<!-- Dust Mechanics -->
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					<div class="px-4 py-3 border-b border-border">
						<h2 class="text-lg font-semibold">Thaumaturgic Dust</h2>
						<p class="text-sm text-muted-foreground">Dust adds value 1:1 until it matches your non-dust value, then diminishing returns</p>
					</div>
					<div class="p-4">
						<table class="w-full text-sm max-w-xs">
							<thead>
								<tr class="text-left text-muted-foreground">
									<th class="pb-2 font-medium">Dust Added</th>
									<th class="pb-2 font-medium text-right">Total Value</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								<tr><td class="py-1.5 tabular-nums">0</td><td class="py-1.5 text-right tabular-nums font-medium">100</td></tr>
								<tr><td class="py-1.5 tabular-nums">50</td><td class="py-1.5 text-right tabular-nums font-medium">150</td></tr>
								<tr class="text-foreground"><td class="py-1.5 tabular-nums">100 <span class="text-xs text-muted-foreground">(= base)</span></td><td class="py-1.5 text-right tabular-nums font-medium">200</td></tr>
								<tr class="text-muted-foreground"><td class="py-1.5 tabular-nums">400</td><td class="py-1.5 text-right tabular-nums">300</td></tr>
								<tr class="text-muted-foreground"><td class="py-1.5 tabular-nums">900</td><td class="py-1.5 text-right tabular-nums">400</td></tr>
							</tbody>
						</table>
						<p class="mt-3 text-xs text-muted-foreground">
							Example with 100 base value. Optimal ratio is 1:1 dust-to-goods. Beyond that, each additional unit of value costs increasingly more dust.
						</p>
					</div>
				</div>

				<!-- Strategies -->
				<div class="grid gap-4 md:grid-cols-3">
					<!-- Tattoo Strategy -->
					<div class="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
						<div class="px-4 py-3 border-b border-border">
							<h2 class="text-lg font-semibold">Tattoo Farming</h2>
							<p class="text-sm text-muted-foreground">Maximize tattoo count per shipment</p>
						</div>
						<div class="p-4 space-y-3 flex-1 text-sm">
							<div>
								<h3 class="font-medium mb-1">Allocation</h3>
								<p class="text-muted-foreground">1 tattoo per <span class="text-foreground font-medium tabular-nums">100,000</span> goods value (crops, ores, or bars).</p>
							</div>
							<div>
								<h3 class="font-medium mb-1">Cap</h3>
								<p class="text-muted-foreground"><span class="text-foreground font-medium tabular-nums">39</span> tattoos max at <span class="text-foreground font-medium tabular-nums">3,900,000</span> value.</p>
							</div>
							<div>
								<h3 class="font-medium mb-1">Dust</h3>
								<p class="text-muted-foreground">Dust does <span class="font-medium text-foreground">not</span> count toward tattoo allocation. Add dust on top for bonus currency rewards.</p>
							</div>
							<div>
								<h3 class="font-medium mb-1">Shipment target</h3>
								<p class="text-muted-foreground">Aim for exact multiples of 100k in goods value. Leftover value below the next 100k threshold is wasted.</p>
							</div>
							<div>
								<h3 class="font-medium mb-1">Port choice</h3>
								<p class="text-muted-foreground">Pick the port with the highest average chaos/tattoo. Check the <button onclick={() => switchTab("tattoos")} class="underline text-foreground hover:text-foreground/80">Tattoos</button> tab for live rankings.</p>
							</div>
						</div>
					</div>

					<!-- Runegraft Strategy -->
					<div class="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
						<div class="px-4 py-3 border-b border-border">
							<h2 class="text-lg font-semibold">Runegraft Farming</h2>
							<p class="text-sm text-muted-foreground">Maximize runegraft count per shipment</p>
						</div>
						<div class="p-4 space-y-3 flex-1 text-sm">
							<div>
								<h3 class="font-medium mb-1">Allocation</h3>
								<p class="text-muted-foreground">1 runegraft per <span class="text-foreground font-medium tabular-nums">400,000</span> goods value (crops, ores, or bars). Dust does <span class="font-medium text-foreground">not</span> count.</p>
							</div>
							<div>
								<h3 class="font-medium mb-2">Breakpoints</h3>
								<table class="w-full text-xs">
									<tbody class="divide-y divide-border">
										<tr><td class="py-1 tabular-nums text-muted-foreground">400,000</td><td class="py-1 text-right tabular-nums font-medium">1</td></tr>
										<tr><td class="py-1 tabular-nums text-muted-foreground">800,000</td><td class="py-1 text-right tabular-nums font-medium">2</td></tr>
										<tr><td class="py-1 tabular-nums text-muted-foreground">1,200,000</td><td class="py-1 text-right tabular-nums font-medium">3</td></tr>
										<tr><td class="py-1 tabular-nums text-muted-foreground">1,600,000</td><td class="py-1 text-right tabular-nums font-medium">4</td></tr>
										<tr><td class="py-1 tabular-nums text-muted-foreground">2,000,000</td><td class="py-1 text-right tabular-nums font-medium">5</td></tr>
										<tr><td class="py-1 tabular-nums text-muted-foreground">2,400,000</td><td class="py-1 text-right tabular-nums font-medium">6</td></tr>
										<tr><td class="py-1 tabular-nums text-muted-foreground">2,800,000</td><td class="py-1 text-right tabular-nums font-medium">7</td></tr>
										<tr><td class="py-1 tabular-nums text-muted-foreground">3,200,000</td><td class="py-1 text-right tabular-nums font-medium">8</td></tr>
										<tr><td class="py-1 tabular-nums text-muted-foreground">3,600,000</td><td class="py-1 text-right tabular-nums font-medium">9 <span class="text-muted-foreground font-normal">(max)</span></td></tr>
									</tbody>
								</table>
							</div>
							<div>
								<h3 class="font-medium mb-1">Port choice</h3>
								<p class="text-muted-foreground">Pick the port with the highest average chaos/runegraft. Check the <button onclick={() => switchTab("runegrafts")} class="underline text-foreground hover:text-foreground/80">Runegrafts</button> tab for live rankings.</p>
							</div>
						</div>
					</div>

					<!-- Currency Strategy -->
					<div class="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
						<div class="px-4 py-3 border-b border-border">
							<h2 class="text-lg font-semibold">Currency Farming</h2>
							<p class="text-sm text-muted-foreground">Maximize currency rarity via large shipments</p>
						</div>
						<div class="p-4 space-y-3 flex-1 text-sm">
							<div>
								<h3 class="font-medium mb-1">How it works</h3>
								<p class="text-muted-foreground">Higher shipment value = rarer currency in returns. Capped at <span class="text-foreground font-medium tabular-nums">800</span> currency items per shipment.</p>
							</div>
							<div>
								<h3 class="font-medium mb-1">Benchmarks</h3>
								<p class="text-muted-foreground">
									~<span class="text-foreground font-medium tabular-nums">700k</span> for ~50% chance at a Divine Orb.<br/>
									~<span class="text-foreground font-medium tabular-nums">50M</span> for ~2.5 Mirror Shards on average.
								</p>
							</div>
							<div>
								<h3 class="font-medium mb-1">Shipment target</h3>
								<p class="text-muted-foreground"><span class="text-foreground font-medium tabular-nums">50,000,000</span> hard cap. Optimal split: 25M in bars + 25M in dust (1:1 ratio).</p>
							</div>
							<div>
								<h3 class="font-medium mb-1">Port choice</h3>
								<p class="text-muted-foreground">All ports have equal currency odds since 3.28. Pick any, or pick one with a good quota multiplier for bonus value.</p>
							</div>
							<div>
								<h3 class="font-medium mb-1">Quota bonus</h3>
								<p class="text-muted-foreground">Fulfilling the port's requested resource quota adds a multiplier on top of shipment value (shown as green % in-game).</p>
							</div>
						</div>
					</div>
				</div>

				<p class="text-center text-xs text-muted-foreground">
					Based on <a href="https://www.reddit.com/r/pathofexile/comments/1rrpdur/" target="_blank" rel="noopener" class="underline hover:text-foreground">EnriadHodor's 3.28 cheatsheet</a> and community data. Values may change with patches.
				</p>
			</div>
		{/if}

		<!-- Guide tab -->
		{#if activeTab === "guide"}
			<div class="space-y-6">
				<div>
					<h2 class="text-2xl font-bold mb-1">Kingsmarch Shipping Guide</h2>
					<p class="text-sm text-muted-foreground">Optimization reference for Mirage league (3.28). Every claim links to its source.</p>
				</div>

				<!-- 3.28 Changes -->
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					<div class="px-4 py-3 border-b border-border">
						<h3 class="text-lg font-semibold">What changed in 3.28</h3>
					</div>
					<div class="p-4 text-sm space-y-2">
						<ul class="space-y-2 text-muted-foreground">
							<li><span class="text-foreground font-medium">Ore/crop reward swap</span> — shipping ores and bars now returns <span class="text-foreground">currency</span>; shipping crops now returns <span class="text-foreground">equipment</span>. This is reversed from 3.25–3.27.
								<a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">patch notes</a>
							</li>
							<li><span class="text-foreground font-medium">New port: Moti Aro</span> — a third Karui port for <span class="text-foreground">Intelligence tattoos</span>.
								<a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">patch notes</a>
							</li>
							<li><span class="text-foreground font-medium">Port bias removed</span> — all ports now have equal currency odds. Pick ports based on tattoo/runegraft value, not currency type.
								<a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">patch notes</a>
							</li>
							<li><span class="text-foreground font-medium">Targeted rewards</span> — each port now grants only tattoos/runegrafts matching its attribute (e.g. Ngakanu = STR tattoos only).
								<a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">patch notes</a>
							</li>
							<li><span class="text-foreground font-medium">Smelting 2x faster</span> but costs more gold. <span class="text-foreground font-medium">Farmer wages halved</span>. <span class="text-foreground font-medium">Mapper wages +25%</span>.
								<a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">patch notes</a>
							</li>
							<li><span class="text-foreground font-medium">Quota reroll</span> — favourable resources can be rerolled at any port for <span class="text-foreground tabular-nums">15,000</span> gold.
								<a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">patch notes</a>
							</li>
							<li><span class="text-foreground font-medium">10 new runegrafts</span> — Agile, Connection, Consecration, Fury, Imbued, Rallying, Resurgence, Rotblood, Spellbound, Suffering.
								<a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">patch notes</a>
							</li>
						</ul>
					</div>
				</div>

				<!-- Shipment Value Optimization -->
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					<div class="px-4 py-3 border-b border-border">
						<h3 class="text-lg font-semibold">Shipment Value</h3>
						<p class="text-sm text-muted-foreground">Range: 50,000 – 50,000,000</p>
					</div>
					<div class="p-4 text-sm space-y-4">
						<div>
							<h4 class="font-medium mb-2">Dust ratio</h4>
							<p class="text-muted-foreground mb-2">Dust adds value 1:1 until it equals your non-dust total. Beyond that, diminishing returns via square root scaling.</p>
							<details class="group">
								<summary class="text-blue-400 hover:text-blue-300 cursor-pointer text-xs">exact formula</summary>
								<div class="mt-2 rounded bg-muted p-3 text-xs font-mono text-muted-foreground space-y-1">
									<p>if dust &lt;= base: total = base + dust</p>
									<p>if dust &gt; base: total = base * (1 + sqrt(dust / base))</p>
								</div>
							</details>
							<p class="text-muted-foreground mt-2">Optimal split: <span class="text-foreground font-medium">1:1 dust-to-goods</span>. For a max shipment: 25M bars + 25M dust.
								<a href="https://www.poewiki.net/wiki/Kingsmarch" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">wiki</a>
							</p>
						</div>

						<div>
							<h4 class="font-medium mb-2">What dust doesn't do</h4>
							<ul class="text-muted-foreground space-y-1 list-disc list-inside">
								<li>Does <span class="text-foreground font-medium">not</span> count toward port quotas</li>
								<li>Does <span class="text-foreground font-medium">not</span> affect tattoo or runegraft allocation — only non-dust goods value matters</li>
							</ul>
							<p class="mt-1">
								<a href="https://www.poewiki.net/wiki/Kingsmarch" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 text-xs">wiki source</a>
							</p>
						</div>

						<div>
							<h4 class="font-medium mb-2">Bars vs ores</h4>
							<p class="text-muted-foreground">Bars provide ~4x the shipment value of their ore and count as <span class="text-foreground font-medium">5 units</span> toward port quota fulfillment.
								<a href="https://www.poewiki.net/wiki/Kingsmarch" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">wiki</a>
							</p>
							<details class="group mt-2">
								<summary class="text-blue-400 hover:text-blue-300 cursor-pointer text-xs">resource value table</summary>
								<table class="mt-2 w-full max-w-xs text-xs">
									<thead><tr class="text-left text-muted-foreground"><th class="pb-1">Resource</th><th class="pb-1 text-right">Ore</th><th class="pb-1 text-right">Bar</th></tr></thead>
									<tbody class="divide-y divide-border">
										<tr><td class="py-1">Crimson Iron</td><td class="py-1 text-right tabular-nums">4</td><td class="py-1 text-right tabular-nums font-medium">16</td></tr>
										<tr><td class="py-1">Orichalcum</td><td class="py-1 text-right tabular-nums">5</td><td class="py-1 text-right tabular-nums font-medium">22</td></tr>
										<tr><td class="py-1">Petrified Amber</td><td class="py-1 text-right tabular-nums">7</td><td class="py-1 text-right tabular-nums font-medium">30</td></tr>
										<tr><td class="py-1">Bismuth</td><td class="py-1 text-right tabular-nums">12</td><td class="py-1 text-right tabular-nums font-medium">50</td></tr>
										<tr><td class="py-1">Verisium</td><td class="py-1 text-right tabular-nums">22</td><td class="py-1 text-right tabular-nums font-medium">90</td></tr>
									</tbody>
								</table>
								<p class="mt-1 text-muted-foreground">
									<a href="https://www.poewiki.net/wiki/Kingsmarch" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300">wiki source</a>
								</p>
							</details>
						</div>
					</div>
				</div>

				<!-- Currency Rewards -->
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					<div class="px-4 py-3 border-b border-border">
						<h3 class="text-lg font-semibold">Currency Rewards</h3>
					</div>
					<div class="p-4 text-sm space-y-3">
						<p class="text-muted-foreground">Higher shipment value = rarer currency. Capped at <span class="text-foreground font-medium tabular-nums">800</span> currency items per shipment (<span class="tabular-nums">500</span> if single mineral type). Reward scaling uses a logarithmic function based on total ore/bar quantities.
							<a href="https://www.poewiki.net/wiki/Kingsmarch" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">wiki</a>
						</p>
						<p class="text-muted-foreground">Since 3.28, <span class="text-foreground font-medium">all ports have equal currency odds</span> — port bias was removed.
							<a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">patch notes</a>
						</p>
						<details class="group">
							<summary class="text-blue-400 hover:text-blue-300 cursor-pointer text-xs">reward type by resource</summary>
							<div class="mt-2 text-xs text-muted-foreground space-y-1">
								<p><span class="text-foreground font-medium">Ores &amp; bars</span> → currency items <span class="text-muted-foreground">(changed in 3.28)</span></p>
								<p><span class="text-foreground font-medium">Crops</span> → equipment items <span class="text-muted-foreground">(changed in 3.28)</span></p>
								<p class="mt-1"><a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300">patch notes</a></p>
							</div>
						</details>
					</div>
				</div>

				<!-- Tattoo Allocation -->
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					<div class="px-4 py-3 border-b border-border">
						<h3 class="text-lg font-semibold">Tattoo Allocation</h3>
					</div>
					<div class="p-4 text-sm space-y-3">
						<p class="text-muted-foreground">1 tattoo per <span class="text-foreground font-medium tabular-nums">100,000</span> non-dust goods value. Max <span class="text-foreground font-medium tabular-nums">39</span> tattoos at <span class="text-foreground font-medium tabular-nums">3,900,000</span>.</p>
						<details class="group">
							<summary class="text-blue-400 hover:text-blue-300 cursor-pointer text-xs">port → attribute mapping</summary>
							<div class="mt-2 text-xs text-muted-foreground space-y-1">
								<p><span class="text-foreground font-medium">Ngakanu</span> — STR tattoos (Kitava, Ngamahu, Rongokurai, Tasalio, Tukohama, Valako)</p>
								<p><span class="text-foreground font-medium">Te Onui</span> — DEX tattoos (Arohongui, Ramako, Tasalio, Tawhoa)</p>
								<p><span class="text-foreground font-medium">Moti Aro</span> — INT tattoos (Arohongui, Hinekora, Kitava, Rongokurai, Tasalio, Tawhoa, Valako)</p>
								<p class="mt-1"><a href="https://www.poewiki.net/wiki/Tattoo" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300">wiki</a></p>
							</div>
						</details>
						<details class="group">
							<summary class="text-blue-400 hover:text-blue-300 cursor-pointer text-xs">drop weight distribution</summary>
							<div class="mt-2 text-xs text-muted-foreground">
								<p>Most tribes follow a <span class="text-foreground">3:3:3:1:1</span> ratio across their tattoo variants. Kitava may follow <span class="text-foreground">4:2:2:2:1</span>.</p>
								<p class="mt-1"><a href="https://www.poewiki.net/wiki/Tattoo" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300">wiki</a></p>
							</div>
						</details>
						<p class="text-xs text-muted-foreground mt-2">Check the <button onclick={() => switchTab("tattoos")} class="text-blue-400 hover:text-blue-300 underline">Tattoos</button> tab for live price rankings by port.</p>
					</div>
				</div>

				<!-- Runegraft Allocation -->
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					<div class="px-4 py-3 border-b border-border">
						<h3 class="text-lg font-semibold">Runegraft Allocation</h3>
					</div>
					<div class="p-4 text-sm space-y-3">
						<p class="text-muted-foreground">~1 runegraft per <span class="text-foreground font-medium tabular-nums">400,000</span> non-dust goods value. First runegraft guaranteed at ~<span class="text-foreground font-medium tabular-nums">450k</span>. Scales to <span class="text-foreground font-medium tabular-nums">99</span> max at 43–50M value.
							<a href="https://www.poewiki.net/wiki/Runegraft" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">wiki</a>
						</p>
						<details class="group">
							<summary class="text-blue-400 hover:text-blue-300 cursor-pointer text-xs">scaling examples</summary>
							<div class="mt-2 text-xs text-muted-foreground space-y-1">
								<p><span class="text-foreground tabular-nums">450k</span> → 1 runegraft</p>
								<p><span class="text-foreground tabular-nums">8.5M</span> → ~21 runegrafts</p>
								<p><span class="text-foreground tabular-nums">43–50M</span> → 99 runegrafts (max)</p>
								<p class="mt-1"><a href="https://www.poewiki.net/wiki/Runegraft" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300">wiki</a></p>
							</div>
						</details>
						<details class="group">
							<summary class="text-blue-400 hover:text-blue-300 cursor-pointer text-xs">port → attribute mapping</summary>
							<div class="mt-2 text-xs text-muted-foreground space-y-1">
								<p><span class="text-foreground font-medium">Riben Fell</span> — DEX runegrafts</p>
								<p><span class="text-foreground font-medium">Pondium</span> — INT runegrafts</p>
								<p><span class="text-foreground font-medium">Kalguur</span> — STR runegrafts</p>
								<p><span class="text-foreground font-medium">All ports</span> — Gemcraft, Angler</p>
								<p class="mt-1"><a href="https://www.poewiki.net/wiki/Runegraft" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300">wiki</a></p>
							</div>
						</details>
						<p class="text-xs text-muted-foreground mt-2">Check the <button onclick={() => switchTab("runegrafts")} class="text-blue-400 hover:text-blue-300 underline">Runegrafts</button> tab for live price rankings by port.</p>
					</div>
				</div>

				<!-- Port Quotas -->
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					<div class="px-4 py-3 border-b border-border">
						<h3 class="text-lg font-semibold">Port Quotas</h3>
					</div>
					<div class="p-4 text-sm space-y-3">
						<p class="text-muted-foreground">Each port requests a favoured resource. Fulfilling the quota adds a multiplier to your shipment value: <span class="text-foreground font-medium">+20% to +100%</span> in 10% increments (random). Quotas persist across shipments and don't expire.
							<a href="https://www.poewiki.net/wiki/Kingsmarch" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">wiki</a>
						</p>
						<p class="text-muted-foreground">Reroll cost: <span class="text-foreground font-medium tabular-nums">15,000</span> gold. Added in 3.28.
							<a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">patch notes</a>
						</p>
					</div>
				</div>

				<!-- Risk -->
				<div class="rounded-lg border border-border bg-card overflow-hidden">
					<div class="px-4 py-3 border-b border-border">
						<h3 class="text-lg font-semibold">Shipping Risk</h3>
					</div>
					<div class="p-4 text-sm space-y-3">
						<p class="text-muted-foreground">With a full crew of rank 5 shipping workers: risk floors at <span class="text-foreground font-medium">0%</span> for most ports, <span class="text-foreground font-medium">10%</span> for Kalguur and Moti Aro.
							<a href="https://www.poewiki.net/wiki/Kingsmarch" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 ml-1">wiki</a>
						</p>
					</div>
				</div>

				<!-- Sources -->
				<div class="rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground space-y-2">
					<h4 class="font-medium text-foreground">Sources</h4>
					<ul class="space-y-1">
						<li><a href="https://www.poewiki.net/wiki/Kingsmarch" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 underline">PoE Wiki — Kingsmarch</a> <span class="text-muted-foreground/70">· ongoing community edits · Mirage league</span></li>
						<li><a href="https://www.poewiki.net/wiki/Version_3.28.0" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 underline">PoE Wiki — 3.28.0 Patch Notes</a> <span class="text-muted-foreground/70">· March 2026 · Mirage league</span></li>
						<li><a href="https://www.poewiki.net/wiki/Tattoo" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 underline">PoE Wiki — Tattoo</a> <span class="text-muted-foreground/70">· ongoing · Mirage league</span></li>
						<li><a href="https://www.poewiki.net/wiki/Runegraft" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 underline">PoE Wiki — Runegraft</a> <span class="text-muted-foreground/70">· ongoing · Mirage league</span></li>
						<li><a href="https://www.reddit.com/r/pathofexile/comments/1rrpdur/" target="_blank" rel="noopener" class="text-blue-400 hover:text-blue-300 underline">EnriadHodor's cheatsheet</a> <span class="text-muted-foreground/70">· Reddit · Settlers league (3.25)</span></li>
					</ul>
					<p class="pt-1">All data reflects Mirage league (3.28) unless noted. Last reviewed March 24, 2026.</p>
				</div>
			</div>
		{/if}
	</main>

	<footer class="border-t border-border py-6 px-4">
		<div class="mx-auto max-w-5xl flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-between">
			<span>Chris Palmer</span>
			<div class="flex items-center gap-4">
				<a href="/about" class="hover:text-foreground transition-colors">About</a>
				<a href="https://github.com/chreez/exiled" target="_blank" rel="noopener" class="hover:text-foreground transition-colors">GitHub</a>
				<a href="https://instagram.com/rhythm_hawk" target="_blank" rel="noopener" class="hover:text-foreground transition-colors">Instagram</a>
			</div>
			<span>&copy; {new Date().getFullYear()}</span>
		</div>
	</footer>
</div>
