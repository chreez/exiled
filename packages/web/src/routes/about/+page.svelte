<div class="min-h-screen bg-background text-foreground">
	<header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
			<a href="/" class="text-xl font-semibold hover:opacity-80 transition-opacity">exiled<span class="text-muted-foreground">.</span></a>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-4 py-10 space-y-10">
		<div>
			<h1 class="text-3xl font-bold mb-2">About exiled.</h1>
			<p class="text-muted-foreground">Path of Exile tools for Kingsmarch shipping and beyond.</p>
		</div>

		<section class="space-y-3">
			<h2 class="text-xl font-semibold">Why this exists</h2>
			<p class="text-muted-foreground leading-relaxed">
				Kingsmarch shipping in Path of Exile involves choosing ports, managing tattoo and runegraft pools, and optimizing shipment values. The in-game information is scattered and the math isn't always obvious. I wanted a single reference that pulls live market data and shows which port is currently the best deal.
			</p>
		</section>

		<section class="space-y-3">
			<h2 class="text-xl font-semibold">Current tools</h2>
			<ul class="space-y-2 text-muted-foreground list-disc list-inside">
				<li><span class="text-foreground font-medium">Tattoo port rankings</span> — average chaos value per tattoo across all three ports, updated from poe.ninja prices</li>
				<li><span class="text-foreground font-medium">Runegraft port rankings</span> — same analysis for runegraft pools</li>
				<li><span class="text-foreground font-medium">Shipping cheatsheet</span> — resource values, dust mechanics, and farming strategies in one place</li>
			</ul>
		</section>

		<section class="space-y-3">
			<h2 class="text-xl font-semibold">How it works</h2>
			<p class="text-muted-foreground leading-relaxed">
				Price data comes from <a href="https://poe.ninja" target="_blank" rel="noopener" class="underline hover:text-foreground">poe.ninja</a>'s public API. A local dev server fetches and caches prices, then the results are snapshotted to static JSON files for the deployed site. When you're viewing the live version on Netlify, you're seeing the most recent snapshot — the date is shown in the banner at the top.
			</p>
		</section>

		<section class="space-y-3">
			<h2 class="text-xl font-semibold">Built with</h2>
			<p class="text-muted-foreground leading-relaxed">
				SvelteKit, Tailwind CSS, and <a href="https://claude.ai/code" target="_blank" rel="noopener" class="underline hover:text-foreground">Claude Code</a>. The project is open source on <a href="https://github.com/chreez/exiled" target="_blank" rel="noopener" class="underline hover:text-foreground">GitHub</a>.
			</p>
		</section>

		<section class="space-y-3">
			<h2 class="text-xl font-semibold">Attribution</h2>
			<p class="text-muted-foreground leading-relaxed">
				Price data sourced from <a href="https://poe.ninja" target="_blank" rel="noopener" class="underline hover:text-foreground">poe.ninja</a>. Shipping cheatsheet based on <a href="https://www.reddit.com/r/pathofexile/comments/1rrpdur/" target="_blank" rel="noopener" class="underline hover:text-foreground">EnriadHodor's community research</a>. Tattoo and runegraft pool data sourced from <a href="https://www.poewiki.net" target="_blank" rel="noopener" class="underline hover:text-foreground">PoE Wiki</a> and community contributions.
			</p>
		</section>

		<section class="space-y-3 border-t border-border pt-10">
			<h2 class="text-xl font-semibold">About me</h2>
			<p class="text-muted-foreground leading-relaxed">
				I'm Chris Palmer. I build small, focused tools — usually for things I use myself. This is one of a few personal projects:
			</p>
			<ul class="space-y-1 text-muted-foreground list-disc list-inside">
				<li><a href="https://github.com/chreez/exiled" target="_blank" rel="noopener" class="underline hover:text-foreground">exiled.</a> — Path of Exile tools (this site)</li>
				<li><a href="https://github.com/chreez/proofed" target="_blank" rel="noopener" class="underline hover:text-foreground">proofed.</a> — a developer's cooking notebook</li>
				<li><a href="https://github.com/chreez/vyra" target="_blank" rel="noopener" class="underline hover:text-foreground">vyra</a> — YouTube videos, transformed into readable guides</li>
			</ul>
			<div class="flex gap-4 text-sm pt-2">
				<a href="https://github.com/chreez" target="_blank" rel="noopener" class="text-muted-foreground underline hover:text-foreground">GitHub</a>
				<a href="https://instagram.com/rhythm_hawk" target="_blank" rel="noopener" class="text-muted-foreground underline hover:text-foreground">Instagram</a>
			</div>
		</section>
	</main>

	<footer class="border-t border-border py-6 px-4">
		<div class="mx-auto max-w-3xl flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-between">
			<span>Chris Palmer</span>
			<div class="flex items-center gap-4">
				<a href="/" class="hover:text-foreground transition-colors">Home</a>
				<a href="https://github.com/chreez/exiled" target="_blank" rel="noopener" class="hover:text-foreground transition-colors">GitHub</a>
				<a href="https://instagram.com/rhythm_hawk" target="_blank" rel="noopener" class="hover:text-foreground transition-colors">Instagram</a>
			</div>
			<span>&copy; {new Date().getFullYear()}</span>
		</div>
	</footer>
</div>
