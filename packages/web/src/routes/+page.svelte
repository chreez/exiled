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
		type SortingState,
		type ColumnFiltersState,
	} from "@tanstack/svelte-table";
	import * as Table from "$lib/components/ui/table";
	import * as Select from "$lib/components/ui/select";
	import { Badge } from "$lib/components/ui/badge";
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
	let cachedAt = $state<string | null>(null);
	let freshnessText = $state("");
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
	});

	function ariaSortValue(columnId: string): "ascending" | "descending" | "none" | undefined {
		const sort = sorting.find((s) => s.id === columnId);
		if (!sort) return undefined;
		return sort.desc ? "descending" : "ascending";
	}

	const numericColumns = new Set(["chaos", "divine", "listingCount"]);
	const rightAlignColumns = new Set(["chaos", "divine", "listingCount"]);
</script>

<div class="min-h-screen bg-background text-foreground">
	<header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
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
					class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
					aria-label="Refresh prices"
					title="Refresh prices"
				>
					<span class="{loading ? 'animate-spin' : ''}">&#8635;</span>
				</button>
				<Select.Root type="single" value={league} onValueChange={handleLeagueChange} disabled={loading}>
					<Select.Trigger class="w-[180px]">
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
			<div class="flex items-center justify-center py-20">
				<p class="text-muted-foreground">Loading prices...</p>
			</div>
		{:else if error}
			<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
				<p class="text-destructive">{error}</p>
			</div>
		{:else if items.length === 0}
			<p class="text-muted-foreground py-10 text-center">No items found.</p>
		{:else}
			{@const counts = typeCounts(items)}
			<div class="mb-4 flex flex-col gap-3">
				<div class="flex items-center gap-4">
					<div class="relative max-w-sm flex-1">
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
				<div class="inline-flex rounded-md border border-border" role="group">
					{#each TYPE_FILTERS as filter}
						{@const count = filter.apiValue ? (counts[filter.apiValue] ?? 0) : counts.all}
						<button
							onclick={() => setTypeFilter(filter.value)}
							class="px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md {typeFilter === filter.value ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
						>
							{filter.label} ({count})
						</button>
					{/each}
				</div>
			</div>
			<div class="rounded-lg border border-border">
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
						{#each table.getRowModel().rows as row}
							<Table.Row>
								{#each row.getVisibleCells() as cell}
									{#if cell.column.id === "icon"}
										<Table.Cell>
											<img src={cell.getValue()} alt={row.original.name} class="size-8 object-contain" loading="lazy" />
										</Table.Cell>
									{:else if cell.column.id === "type"}
										<Table.Cell>
											<Badge variant="secondary">
												<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
											</Badge>
										</Table.Cell>
									{:else if cell.column.id === "name"}
										<Table.Cell class="font-medium">
											<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
										</Table.Cell>
									{:else if cell.column.id === "baseType"}
										<Table.Cell class="text-muted-foreground">
											<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
										</Table.Cell>
									{:else}
										<Table.Cell class="{rightAlignColumns.has(cell.column.id) ? 'text-right' : ''} {numericColumns.has(cell.column.id) ? 'tabular-nums' : ''}">
											<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
										</Table.Cell>
									{/if}
								{/each}
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	</main>
</div>
