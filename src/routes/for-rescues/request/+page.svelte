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

<section class="bg-gradient-to-br from-emerald-50 via-white to-sky-50">
  <div class="mx-auto max-w-3xl px-6 py-14">
    <div class="rounded-2xl border border-emerald-100 bg-white/90 p-8 shadow-sm backdrop-blur">
      <p class="text-sm font-semibold uppercase tracking-wide text-emerald-700">RescueOS access</p>
      <h1 class="mt-2 text-3xl font-bold text-slate-900">Request access</h1>
      <p class="mt-2 text-slate-700">Tell us about your rescue and we’ll set up your login.</p>

      {#if submitted}
        <div class="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
          Thanks — we’ll reach out soon.
        </div>
      {:else}
        <form class="mt-6 space-y-4" on:submit={handleSubmit}>
          <div>
            <label class="block text-sm font-medium text-slate-800" for="rescue-name">Rescue name</label>
            <input
              id="rescue-name"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              bind:value={rescueName}
              required
              type="text"
              placeholder="Your rescue name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-800" for="contact-name">Contact name</label>
            <input
              id="contact-name"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              bind:value={contactName}
              required
              type="text"
              placeholder="Primary contact"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-800" for="contact-email">Email</label>
            <input
              id="contact-email"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              bind:value={email}
              required
              type="email"
              placeholder="contact@example.org"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-800" for="website">Website (optional)</label>
            <input
              id="website"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              bind:value={website}
              type="url"
              placeholder="https://yourrescue.org"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-800" for="notes">Notes (optional)</label>
            <textarea
              id="notes"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              bind:value={notes}
              rows="3"
              placeholder="Anything else we should know?"
            ></textarea>
          </div>
          <div class="flex items-center justify-between">
            <a href="/for-rescues" class="text-sm text-emerald-700 hover:text-emerald-800">Back to rescues</a>
            <button
              type="submit"
              class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-white shadow-sm transition hover:bg-emerald-700"
            >
              Submit request
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</section>
