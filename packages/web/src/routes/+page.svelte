<script lang="ts">
	import { onMount } from "svelte";
	import { fetchPrices, type PriceItem } from "$lib/api";
	import {
		createTable,
		FlexRender,
		createColumnHelper,
		getCoreRowModel,
		getSortedRowModel,
		type SortingState,
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

	async function loadPrices(selectedLeague: string) {
		loading = true;
		error = null;
		try {
			items = await fetchPrices(selectedLeague);
		} catch (err) {
			error = err instanceof Error ? err.message : "Unknown error";
			items = [];
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadPrices(league);
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

	const colHelper = createColumnHelper<PriceItem>();

	const columns = [
		colHelper.accessor("icon", {
			header: "",
			cell: (info) => info.getValue(),
			enableSorting: false,
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
		}),
		colHelper.accessor("chaos", {
			header: "Chaos",
			cell: (info) => info.getValue().toFixed(1),
		}),
		colHelper.accessor("divine", {
			header: "Divine",
			cell: (info) => info.getValue().toFixed(2),
		}),
		colHelper.accessor("listingCount", {
			header: "Listings",
			cell: (info) => info.getValue().toLocaleString(),
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
		},
		onSortingChange(updater) {
			sorting = typeof updater === "function" ? updater(sorting) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
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
	<header class="border-b border-border">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
			<h1 class="text-xl font-semibold">PoE Disenchant Tool</h1>
			<div class="flex items-center gap-3">
				<Select.Root type="single" value={league} onValueChange={handleLeagueChange}>
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
			<p class="text-muted-foreground mb-4 text-sm">{items.length} items loaded</p>
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
