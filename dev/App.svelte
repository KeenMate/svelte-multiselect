<script>
	import Multiselect from "../src/Multiselect.svelte";
	let value;
	$: console.log(value);
</script>

{JSON.stringify(value)}

<input type="text" value="lmao" autofocus />

<Multiselect
	bind:value
	showLabels={false}
	closeOnSelect={false}
	options={[
		"Select option",
		"options",
		"selected",
		"mulitple",
		"label",
		"searchable",
		"clearOnSelect",
		"hideSelected",
		"maxHeight",
		"allowEmpty",
		"showLabels",
		"onChange",
		"touched",
	]}
/>
