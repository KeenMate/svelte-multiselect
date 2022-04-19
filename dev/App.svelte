<script>
	//TODO TEST SLOTS FROM ASYNC SEARCH
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

	const startObjectOptions = [
		{ title: "first", id: 0 },
		{ title: "second", id: 1 },
		{ title: "third", id: 2 },
		{ title: "forth", id: 3 },
		{ title: "fifth", id: 4 },
		{ title: "six", id: 5 },
		{ title: "seventh", id: 6 },
	];

	let objectOptions = [];
	let value = null;
	let loading;
	$: console.log(value);
</script>

{JSON.stringify(value)}

<Multiselect
	bind:value
	showLabels={true}
	closeOnSelect={false}
	searchable={true}
	placeholder="Pick some"
	options={objectOptions}
	trackBy="id"
	label="title"
	multiple={true}
	clearOnSelect={false}
	limit={2}
	max={3}
	limitText={(x) => `and ${x} other things`}
	deselectLabel="Can't remove this value"
	customLabel={(obj) => JSON.stringify(obj)}
	internalSearch={false}
	{loading}
	on:search-change={(e, id) => {
		let query = e.detail
		console.log(query);
		loading = true;
		setTimeout(() => {
			objectOptions = startObjectOptions.slice(0, query?.length);
			loading = false;
		}, 1000);
	}}
/>
