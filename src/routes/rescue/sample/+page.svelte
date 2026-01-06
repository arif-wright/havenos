<script lang="ts">
	import RescuePage from '../[slug]/+page.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<RescuePage data={data} />
