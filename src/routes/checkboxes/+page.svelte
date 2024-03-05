<script lang="ts">
	import Multiselect from '$lib/Multiselect.svelte';

	// generate 20 options
	const options = Array.from({ length: 20 }, (_, i) => ({
		id: i + 1,
		label: `Option ${i + 1}`,
		value: i + 1
	}));

	function getLimitText(count: number) {
		return `${count} checkboxes selected`;
	}
</script>

<h1>Checkboxes demo</h1>

<Multiselect
	{options}
	trackBy="id"
	label="label"
	multiple
	closeOnSelect={false}
	limit={0}
	limitText={getLimitText}
	showLabels={false}
	clearOnSelect={false}
	showPointer={false}
>
	<!-- @ts-ignore -->
	<svelte:fragment slot="option" let:option let:selected>
		<div class="option-container">
			<input
				type="checkbox"
				checked={selected}
				id="checkbox-{option.id}"
				height="0.7em"
				width="0.7em"
			/>
			<label for="checkbox-{option.id}">{option.label}</label>
		</div>
	</svelte:fragment>
</Multiselect>

<style>
	input[type='checkbox'] {
		width: 1.5em;
		height: 1.5em;
	}

	.option-container {
		display: flex;
		align-items: center;
	}
</style>
