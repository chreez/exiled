<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fetchPrices, type PriceItem, type PriceResponse } from "$lib/api";
	import {
		createTable,
		FlexRender,
		createColumnHelper,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		type SortingState,
		type ColumnFiltersState,
		type PaginationState,
	} from "@tanstack/svelte-table";
	import * as Table from "$lib/components/ui/table";
	import * as Select from "$lib/components/ui/select";
	import { Badge } from "$lib/components/ui/badge";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { Button } from "$lib/components/ui/button";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";

	const LEAGUES = [
		{ value: "mirage", label: "Mirage" },
		{ value: "hardcore-mirage", label: "Hardcore Mirage" },
		{ value: "standard", label: "Standard" },
		{ value: "hardcore", label: "Hardcore" },
	];

	let league = $state("mirage");
	let items = $state<PriceItem[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let sorting = $state<SortingState>([]);
	let globalFilter = $state("");
	let searchInput = $state<HTMLInputElement | null>(null);
	let columnFilters = $state<ColumnFiltersState>([]);
	let typeFilter = $state<string>("all");
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 50 });

	const PAGE_SIZES = [25, 50, 100];
	let cachedAt = $state<string | null>(null);
	let freshnessText = $state("");
	let warnings = $state<string[]>([]);
	let stale = $state(false);
	let freshnessInterval: ReturnType<typeof setInterval> | undefined;

	// Debounced search
	let searchText = $state("");
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function updateFreshness() {
		if (!cachedAt) {
			freshnessText = "";
			return;
		}
		const diff = Date.now() - new Date(cachedAt).getTime();
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

	function handleSearchInput(value: string) {
		searchText = value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			globalFilter = value;
			pagination = { ...pagination, pageIndex: 0 };
		}, 250);
	}

	function clearSearch() {
		searchText = "";
		globalFilter = "";
		clearTimeout(debounceTimer);
		searchInput?.blur();
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
			e.preventDefault();
			searchInput?.focus();
		}
	}

	async function loadPrices(selectedLeague: string, force = false) {
		loading = true;
		error = null;
		try {
			const res = await fetchPrices(selectedLeague, force);
			items = res.items;
			cachedAt = res.cachedAt;
			warnings = res.warnings ?? [];
			stale = res.stale ?? false;
			updateFreshness();
		} catch (err) {
			error = err instanceof Error ? err.message : "Unknown error";
			items = [];
		} finally {
			loading = false;
		}
	}

	function handleRefresh() {
		loadPrices(league, true);
	}

	onMount(() => {
		loadPrices(league);
		document.addEventListener("keydown", handleGlobalKeydown);
		freshnessInterval = setInterval(updateFreshness, 15_000);
	});

	onDestroy(() => {
		clearTimeout(debounceTimer);
		clearInterval(freshnessInterval);
		if (typeof document !== "undefined") {
			document.removeEventListener("keydown", handleGlobalKeydown);
		}
	});

	function handleLeagueChange(value: string | undefined) {
		if (value) {
			league = value;
			loadPrices(value);
		}
	}

	function typeLabel(type: string): string {
		return type.replace("Unique", "");
	}

	const TYPE_FILTERS = [
		{ value: "all", label: "All", apiValue: null },
		{ value: "weapon", label: "Weapons", apiValue: "UniqueWeapon" },
		{ value: "armour", label: "Armour", apiValue: "UniqueArmour" },
		{ value: "accessory", label: "Accessories", apiValue: "UniqueAccessory" },
	] as const;

	function typeCounts(allItems: PriceItem[]) {
		const counts: Record<string, number> = { all: allItems.length };
		for (const item of allItems) {
			counts[item.type] = (counts[item.type] ?? 0) + 1;
		}
		return counts;
	}

	function setTypeFilter(value: string) {
		typeFilter = value;
		const filter = TYPE_FILTERS.find((f) => f.value === value);
		if (!filter || !filter.apiValue) {
			columnFilters = columnFilters.filter((f) => f.id !== "type");
		} else {
			const existing = columnFilters.filter((f) => f.id !== "type");
			columnFilters = [...existing, { id: "type", value: filter.apiValue }];
		}
		pagination = { ...pagination, pageIndex: 0 };
	}

	const colHelper = createColumnHelper<PriceItem>();

	const columns = [
		colHelper.accessor("icon", {
			header: "",
			cell: (info) => info.getValue(),
			enableSorting: false,
			enableGlobalFilter: false,
		}),
		colHelper.accessor("name", {
			header: "Name",
			cell: (info) => info.getValue(),
		}),
		colHelper.accessor("baseType", {
			header: "Base Type",
			cell: (info) => info.getValue(),
		}),
		colHelper.accessor("type", {
			header: "Type",
			cell: (info) => typeLabel(info.getValue()),
			enableGlobalFilter: false,
			filterFn: "equals",
		}),
		colHelper.accessor("chaos", {
			header: "Chaos",
			cell: (info) => info.getValue().toFixed(1),
			enableGlobalFilter: false,
		}),
		colHelper.accessor("divine", {
			header: "Divine",
			cell: (info) => info.getValue().toFixed(2),
			enableGlobalFilter: false,
		}),
		colHelper.accessor("listingCount", {
			header: "Listings",
			cell: (info) => info.getValue().toLocaleString(),
			enableGlobalFilter: false,
		}),
	];

	const table = createTable({
		get data() {
			return items;
		},
		columns,
		state: {
			get sorting() {
				return sorting;
			},
			get globalFilter() {
				return globalFilter;
			},
			get columnFilters() {
				return columnFilters;
			},
			get pagination() {
				return pagination;
			},
		},
		onSortingChange(updater) {
			sorting = typeof updater === "function" ? updater(sorting) : updater;
		},
		onGlobalFilterChange(updater) {
			globalFilter = typeof updater === "function" ? updater(globalFilter) : updater;
		},
		onColumnFiltersChange(updater) {
			columnFilters = typeof updater === "function" ? updater(columnFilters) : updater;
		},
		onPaginationChange(updater) {
			pagination = typeof updater === "function" ? updater(pagination) : updater;
		},
		globalFilterFn: (row, _columnId, filterValue) => {
			const search = filterValue.toLowerCase();
			return (
				row.original.name.toLowerCase().includes(search) ||
				row.original.baseType.toLowerCase().includes(search)
			);
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	function ariaSortValue(columnId: string): "ascending" | "descending" | "none" | undefined {
		const sort = sorting.find((s) => s.id === columnId);
		if (!sort) return undefined;
		return sort.desc ? "descending" : "ascending";
	}

	const numericColumns = new Set(["chaos", "divine", "listingCount"]);
	const rightAlignColumns = new Set(["chaos", "divine", "listingCount"]);

	const TYPE_BADGE_CLASSES: Record<string, string> = {
		UniqueWeapon: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
		UniqueArmour: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
		UniqueAccessory: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/25",
	};

	const numFmt = new Intl.NumberFormat();
	const chaosFmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const divineFmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
</script>

<div class="min-h-screen bg-background text-foreground">
	<header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-3">
				<h1 class="text-xl font-semibold">PoE Disenchant Tool</h1>
				{#if freshnessText}
					<span class="text-xs text-muted-foreground">Updated {freshnessText}</span>
				{/if}
			</div>
			<div class="flex items-center gap-3">
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
				<ThemeToggle />
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-6">
		{#if loading}
			<div class="overflow-x-auto rounded-lg border border-border" aria-live="polite" aria-busy="true">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[50px]"></Table.Head>
							<Table.Head>Name</Table.Head>
							<Table.Head>Base Type</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head class="text-right">Chaos</Table.Head>
							<Table.Head class="text-right">Divine</Table.Head>
							<Table.Head class="text-right">Listings</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each Array(10) as _, i}
							<Table.Row class="{i % 2 === 1 ? 'bg-muted/30' : ''}">
								<Table.Cell><Skeleton class="size-10 rounded-md" /></Table.Cell>
								<Table.Cell><Skeleton class="h-4 w-32" /></Table.Cell>
								<Table.Cell><Skeleton class="h-4 w-24" /></Table.Cell>
								<Table.Cell><Skeleton class="h-5 w-16 rounded-full" /></Table.Cell>
								<Table.Cell class="text-right"><Skeleton class="ml-auto h-4 w-14" /></Table.Cell>
								<Table.Cell class="text-right"><Skeleton class="ml-auto h-4 w-12" /></Table.Cell>
								<Table.Cell class="text-right"><Skeleton class="ml-auto h-4 w-10" /></Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else if error}
			<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center" aria-live="polite">
				<p class="text-destructive text-lg font-medium mb-2">Failed to load prices</p>
				<p class="text-destructive/80 text-sm mb-4">{error}</p>
				<Button variant="destructive" onclick={() => loadPrices(league)}>Try Again</Button>
			</div>
		{:else if items.length === 0}
			<p class="text-muted-foreground py-10 text-center">No items found.</p>
		{:else}
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
			{@const counts = typeCounts(items)}
			<div class="mb-4 flex flex-col gap-3">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
					<div class="relative flex-1 sm:max-w-sm">
						<input
							bind:this={searchInput}
							type="text"
							placeholder="Filter by name... ( / )"
							value={searchText}
							oninput={(e) => handleSearchInput(e.currentTarget.value)}
							onkeydown={(e) => {
								if (e.key === "Escape") {
									e.preventDefault();
									clearSearch();
								}
							}}
							class="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						/>
						{#if searchText}
							<button
								onclick={clearSearch}
								class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								aria-label="Clear search"
							>
								&#10005;
							</button>
						{/if}
					</div>
					<p class="text-muted-foreground text-sm whitespace-nowrap">
						{#if globalFilter || typeFilter !== "all"}
							Showing {table.getRowModel().rows.length} of {items.length} items
						{:else}
							{items.length} items
						{/if}
					</p>
				</div>
				<div class="inline-flex flex-wrap rounded-md border border-border" role="group">
					{#each TYPE_FILTERS as filter}
						{@const count = filter.apiValue ? (counts[filter.apiValue] ?? 0) : counts.all}
						<button
							onclick={() => setTypeFilter(filter.value)}
							class="min-h-[44px] px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md sm:min-h-0 {typeFilter === filter.value ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
						>
							{filter.label} ({count})
						</button>
					{/each}
				</div>
			</div>
			<div class="space-y-4">
			<div class="overflow-x-auto rounded-lg border border-border">
				<Table.Root>
					<Table.Header>
						{#each table.getHeaderGroups() as headerGroup}
							<Table.Row>
								{#each headerGroup.headers as header}
									<Table.Head
										class="{header.id === 'icon' ? 'w-[50px]' : ''} {rightAlignColumns.has(header.id) ? 'text-right' : ''}"
										aria-sort={ariaSortValue(header.id)}
									>
										{#if header.column.getCanSort()}
											<button
												class="inline-flex items-center gap-1 hover:text-foreground transition-colors -ml-1 px-1 py-0.5 rounded"
												onclick={() => header.column.toggleSorting()}
												onkeydown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														header.column.toggleSorting();
													}
												}}
											>
												<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
												<span class="text-muted-foreground text-xs w-4 inline-flex justify-center">
													{#if header.column.getIsSorted() === "asc"}
														&#9650;
													{:else if header.column.getIsSorted() === "desc"}
														&#9660;
													{:else}
														&#8693;
													{/if}
												</span>
											</button>
										{:else}
											<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body>
						{#each table.getRowModel().rows as row, i}
							<Table.Row class="{i % 2 === 1 ? 'bg-muted/30' : ''} hover:bg-muted/50 transition-colors">
								<Table.Cell>
									<div class="flex size-10 items-center justify-center rounded-md border border-border bg-muted/40">
										<img src={row.original.icon} alt={row.original.name} class="size-8 object-contain" loading="lazy" />
									</div>
								</Table.Cell>
								<Table.Cell class="font-semibold">{row.original.name}</Table.Cell>
								<Table.Cell class="text-muted-foreground text-sm">{row.original.baseType}</Table.Cell>
								<Table.Cell>
									<Badge variant="outline" class={TYPE_BADGE_CLASSES[row.original.type] ?? ""}>
										{typeLabel(row.original.type)}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right font-medium tabular-nums">{chaosFmt.format(row.original.chaos)}</Table.Cell>
								<Table.Cell class="text-right text-muted-foreground tabular-nums">{divineFmt.format(row.original.divine)}</Table.Cell>
								<Table.Cell class="text-right tabular-nums">{numFmt.format(row.original.listingCount)}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-2">
					<span class="text-sm text-muted-foreground">Rows per page</span>
					<Select.Root
						type="single"
						value={String(pagination.pageSize)}
						onValueChange={(v) => {
							if (v) pagination = { pageIndex: 0, pageSize: Number(v) };
						}}
					>
						<Select.Trigger class="h-8 w-[70px]">
							<span data-slot="select-value">{pagination.pageSize}</span>
						</Select.Trigger>
						<Select.Content>
							{#each PAGE_SIZES as size}
								<Select.Item value={String(size)}>{size}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-muted-foreground">
						Page {pagination.pageIndex + 1} of {table.getPageCount()}
					</span>
					<Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onclick={() => table.firstPage()}>
						&#171;
					</Button>
					<Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onclick={() => table.previousPage()}>
						&#8249;
					</Button>
					<Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onclick={() => table.nextPage()}>
						&#8250;
					</Button>
					<Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onclick={() => table.lastPage()}>
						&#187;
					</Button>
				</div>
			</div>
			</div>
		{/if}
	</main>
</div>
