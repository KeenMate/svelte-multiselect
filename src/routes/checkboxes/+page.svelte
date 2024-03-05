<script>
	import Multiselect from '$lib/Multiselect.svelte';

	// generate 20 options
	const options = Array.from({ length: 20 }, (_, i) => ({
		id: i + 1,
		label: `Option ${i + 1}`,
		value: i + 1
	}));
</script>

<h1>Checkboxes demo</h1>

<Multiselect {options} label="Select option">
	<svelte:fragment slot="option" let:option>
		{JSON.stringify(option)}
	</svelte:fragment>
</Multiselect>
