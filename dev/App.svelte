<script>
	import Multiselect from "../src/Multiselect.svelte";
	let stringOptions = [
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
	];

	let objectOptions = [
		{ title: "first", id: 0 },
		{ title: "second", id: 1 },
		{ title: "third", id: 2 },
		{ title: "forth", id: 3 },
		{ title: "fifth", id: 4 },
		{ title: "six", id: 5 },
		{ title: "seventh", id: 6 },
	];
	let value = objectOptions[0];

	$: console.log(value);
</script>

{JSON.stringify(value)}

<Multiselect
	bind:value
	showLabels={true}
	closeOnSelect={false}
	searchable={true}
	placeholder="Select one"
	options={objectOptions}
	key="id"
	label="title"
	allowEmpty={false}
	deselectLabel="Can't remove this value"
	customLabel={(obj) => JSON.stringify(obj)}
/>
