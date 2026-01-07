<svelte:head>
  <title>RescueOS for rescues</title>
  <meta
    name="description"
    content="Request access to RescueOS, set up your rescue profile, and manage inquiries in one place."
  />
</svelte:head>

<section class="bg-gradient-to-br from-emerald-50 via-white to-sky-50">
  <div class="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 lg:flex-row lg:items-center">
    <div class="flex-1 space-y-5">
      <p class="text-sm font-semibold uppercase tracking-wide text-emerald-700">RescueOS for rescues</p>
      <h1 class="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">Your rescue workspace, ready for adopters.</h1>
      <p class="max-w-2xl text-lg text-slate-700">
        Publish your rescue profile, list pets with photos and statuses, and keep every inquiry organized with email + password
        login. No more lost messages or scattered tools.
      </p>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="/for-rescues/request"
          class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-white shadow-sm transition hover:bg-emerald-700"
        >
          Request access
        </a>
        <a
          href="/admin/login"
          class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-slate-800 transition hover:border-slate-400 hover:bg-white"
        >
          Already have an account? Log in
        </a>
      </div>
    </div>
    <div class="flex-1">
      <div class="rounded-2xl border border-emerald-100 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h2 class="text-lg font-semibold text-slate-900">What you get</h2>
        <ul class="mt-4 space-y-3 text-slate-700">
          <li class="flex gap-3">
            <span class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Public rescue page with your mission, process, and trust signals (logo & header images supported).</span>
          </li>
          <li class="flex gap-3">
            <span class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Pet listings with photos and statuses so adopters know what’s available.</span>
          </li>
          <li class="flex gap-3">
            <span class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Inquiry inbox with status, history, and notes — no more lost emails.</span>
          </li>
          <li class="flex gap-3">
            <span class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Templates for faster, consistent replies to adopters.</span>
          </li>
          <li class="flex gap-3">
            <span class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Team roles and settings with a customizable public profile.</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="bg-white">
  <div class="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-2">
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-xl font-semibold text-slate-900">How to access</h3>
      <ul class="mt-4 space-y-3 text-slate-700">
        <li>Request access if you don’t have an account yet.</li>
        <li>Once your account is created, log in with email + password.</li>
        <li>Invite teammates from the Team tab after you’re in.</li>
      </ul>
      <div class="mt-6 flex flex-wrap gap-3">
        <a
          href="/for-rescues/request"
          class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-700"
        >
          Request access
        </a>
        <a
          href="/admin/login"
          class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-slate-800 transition hover:border-slate-400 hover:bg-white"
        >
          Admin login
        </a>
      </div>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-xl font-semibold text-slate-900">How it works</h3>
      <ol class="mt-4 space-y-3 text-slate-700">
        <li><span class="font-semibold text-slate-900">1) Create your rescue profile</span> — add your mission, response time, and branding.</li>
        <li><span class="font-semibold text-slate-900">2) Add adoptable pets</span> — upload photos, statuses, and key details.</li>
        <li><span class="font-semibold text-slate-900">3) Manage inquiries in one place</span> — track status, history, and follow-ups.</li>
      </ol>
    </div>
  </div>
</section>

<section class="bg-slate-50">
  <div class="mx-auto max-w-6xl px-6 py-12">
    <h3 class="text-2xl font-semibold text-slate-900">FAQ</h3>
    <div class="mt-6 grid gap-6 md:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="font-semibold text-slate-900">Is RescueOS free?</p>
        <p class="mt-2 text-slate-700">Yes for now — we’ll notify you if pricing changes.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="font-semibold text-slate-900">How do adopters contact us?</p>
        <p class="mt-2 text-slate-700">They submit an inquiry from your public page; it goes straight to your inquiry inbox.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="font-semibold text-slate-900">Can multiple volunteers log in?</p>
        <p class="mt-2 text-slate-700">Yes. Invite teammates from the Team tab and assign roles.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="font-semibold text-slate-900">Do we need a website?</p>
        <p class="mt-2 text-slate-700">No. RescueOS provides a public page with your mission, pets, and inquiry form.</p>
      </div>
    </div>
  </div>
</section>
