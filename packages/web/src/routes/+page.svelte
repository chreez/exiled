<script lang="ts">
	import { onMount } from "svelte";
	import { fetchPrices, type PriceItem } from "$lib/api";
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
						{#each items as item}
							<Table.Row>
								<Table.Cell>
									<img src={item.icon} alt={item.name} class="size-8 object-contain" loading="lazy" />
								</Table.Cell>
								<Table.Cell class="font-medium">{item.name}</Table.Cell>
								<Table.Cell class="text-muted-foreground">{item.baseType}</Table.Cell>
								<Table.Cell>
									<Badge variant="secondary">{typeLabel(item.type)}</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">{item.chaos.toFixed(1)}</Table.Cell>
								<Table.Cell class="text-right">{item.divine.toFixed(2)}</Table.Cell>
								<Table.Cell class="text-right">{item.listingCount}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	</main>
</div>
