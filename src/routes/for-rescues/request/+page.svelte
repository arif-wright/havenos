<script lang="ts">
  let submitted = false;
  let rescueName = '';
  let contactName = '';
  let email = '';
  let website = '';
  let notes = '';

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    submitted = true;
  };
</script>

<svelte:head>
  <title>Request access | RescueOS</title>
  <meta name="description" content="Request a RescueOS account for your rescue." />
</svelte:head>

<section class="relative px-6 py-14 text-[var(--text)]">
	<div class="mx-auto max-w-3xl">
		<div class="rounded-2xl border border-white/12 bg-white/10 p-8 shadow-2xl backdrop-blur">
			<p class="text-sm font-semibold uppercase tracking-wide text-emerald-100">RescueOS access</p>
			<h1 class="mt-2 text-3xl font-bold text-white">Request access</h1>
			<p class="mt-2 text-slate-200/80">Tell us about your rescue and we’ll set up your login.</p>

			{#if submitted}
				<div class="mt-6 rounded-lg border border-emerald-200/50 bg-emerald-500/15 px-4 py-3 text-emerald-50">
					Thanks — we’ll reach out soon.
				</div>
			{:else}
				<form class="mt-6 space-y-4" on:submit={handleSubmit}>
					<div>
						<label class="block text-sm font-medium text-slate-100" for="rescue-name">Rescue name</label>
						<input
							id="rescue-name"
							class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white shadow-sm placeholder:text-slate-200/70 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
							bind:value={rescueName}
							required
							type="text"
							placeholder="Your rescue name"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-slate-100" for="contact-name">Contact name</label>
						<input
							id="contact-name"
							class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white shadow-sm placeholder:text-slate-200/70 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
							bind:value={contactName}
							required
							type="text"
							placeholder="Primary contact"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-slate-100" for="contact-email">Email</label>
						<input
							id="contact-email"
							class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white shadow-sm placeholder:text-slate-200/70 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
							bind:value={email}
							required
							type="email"
							placeholder="contact@example.org"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-slate-100" for="website">Website (optional)</label>
						<input
							id="website"
							class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white shadow-sm placeholder:text-slate-200/70 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
							bind:value={website}
							type="url"
							placeholder="https://yourrescue.org"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-slate-100" for="notes">Notes (optional)</label>
						<textarea
							id="notes"
							class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white shadow-sm placeholder:text-slate-200/70 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
							bind:value={notes}
							rows="3"
							placeholder="Anything else we should know?"
						></textarea>
					</div>
					<div class="flex items-center justify-between">
						<a href="/for-rescues" class="text-sm text-emerald-200 hover:text-emerald-100">Back to rescues</a>
						<button
							type="submit"
							class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-400"
						>
							Submit request
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</section>
