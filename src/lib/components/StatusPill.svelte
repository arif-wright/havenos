<script lang="ts">
	export let status: string;

	const tone: Record<string, string> = {
		new: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
		contacted: 'bg-sky-100 text-sky-800 ring-sky-200',
		pending: 'bg-amber-100 text-amber-800 ring-amber-200',
		application: 'bg-amber-100 text-amber-800 ring-amber-200',
		approved: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
		adopted: 'bg-slate-100 text-slate-700 ring-slate-200',
		closed: 'bg-slate-100 text-slate-600 ring-slate-200',
		'default': 'bg-slate-100 text-slate-700 ring-slate-200'
	};

	const label = (status ?? '').replace(/_/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase()) || 'Status';
	const style = tone[status] ?? tone.default;
</script>

<span class={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ${style}`}>
	{label}
</span>
