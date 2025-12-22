<script lang="ts">
	export let name: string | null = '';
	export let contactEmail: string | null = '';
	export let mission: string | null = '';
	export let adoptionProcess: string | null = '';
	export let responseTime: string | null = '';
</script>

<form method="POST" action="?/updateRescue" class="space-y-4 text-sm">
	<div class="grid gap-4 md:grid-cols-2">
		<label class="block font-medium text-slate-700">
			Rescue name
			<input
				name="name"
				value={name}
				required
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
		<label class="block font-medium text-slate-700">
			Contact email
			<input
				name="contact_email"
				value={contactEmail}
				required
				type="email"
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
	</div>
	<label class="block font-medium text-slate-700">
		Mission statement
		<textarea
			name="mission_statement"
			rows="3"
			class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
		>{mission}</textarea>
	</label>
	<label class="block font-medium text-slate-700">
		Adoption process
		<textarea
			name="adoption_process"
			rows="4"
			class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
		>{adoptionProcess}</textarea>
	</label>
	<label class="block font-medium text-slate-700">
		Response time
		<input
			name="response_time_text"
			class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			value={responseTime}
		/>
	</label>
	<button
		type="submit"
		class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
	>
		Save
	</button>
</form>
