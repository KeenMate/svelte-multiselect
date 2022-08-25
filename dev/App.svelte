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

	const nestnedOptions = [
		{
			language: "Javascript",
			libs: [
				{ name: "Vue.js", category: "Front-end" },
				{ name: "Adonis", category: "Backend" },
			],
		},
		{
			language: "Ruby",
			libs: [
				{ name: "Rails", category: "Backend" },
				{ name: "Sinatra", category: "Backend" },
			],
		},
		{
			language: "Other",
			libs: [
				{ name: "Laravel", category: "Backend" },
				{ name: "Phoenix", category: "Backend" },
			],
		},
	];

	let objectOptions = nestnedOptions;
	let value = [];
	let loading;
	$: console.log(value);
</script>

<Multiselect
	showLabels={true}
	closeOnSelect={false}
	placeholder="Pick some"
	options={objectOptions}
	trackBy="name"
	label="name"
	clearOnSelect={false}
	limit={2}
	max={10}
	taggable
	searchable
	limitText={(x) => `and ${x} other things`}
	deselectLabel="Can't remove this value"
	multiple
	groupValues="libs"
	groupLabel="language"
	groupSelect={true}
	small
/>
<Multiselect
	showLabels={true}
	closeOnSelect={false}
	placeholder="Pick some"
	options={objectOptions}
	trackBy="name"
	label="name"
	clearOnSelect={false}
	limit={2}
	max={10}
	taggable
	searchable
	limitText={(x) => `and ${x} other things`}
	deselectLabel="Can't remove this value"
	multiple
	groupValues="libs"
	groupLabel="language"
	groupSelect={true}
/>
adw aw daw sadw daw
