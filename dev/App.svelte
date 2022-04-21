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

	let objectOptions = startObjectOptions;
	let value = [];
	let loading;
	$: console.log(value);
</script>

{JSON.stringify(value)}

<Multiselect
	bind:value
	showLabels={true}
	closeOnSelect={false}
	placeholder="Pick some"
	options={objectOptions}
	trackBy="id"
	label="title"
	clearOnSelect={false}
	limit={2}
	max={10}
	taggable
	searchable
	limitText={(x) => `and ${x} other things`}
	deselectLabel="Can't remove this value"
	customLabel={(obj) => JSON.stringify(obj)}
	multiple
	on:tag={(e) => {
		let newObj = {
			title: e.detail,
			id:
				Math.max.apply(
					Math,
					objectOptions.map(function (o) {
						return o.id;
					})
				) + 1,
		};
		objectOptions.push(newObj);

		value.push(newObj);
	}}
/>
