<script>
	import { fade } from "svelte/transition";
	import { onMount, createEventDispatcher } from "svelte";
	let dispatch = createEventDispatcher();
	//TODO find out what html element is refered by $el
	let el, tagsBind, searchBind, listBind;

	$: console.log(el);
	$: console.log(filterOptions);
	export let hasSingleSelectedSlot = null;

	//#region multiselectMixin.js helper functions
	function isEmpty(opt) {
		if (opt === 0) return false;
		if (Array.isArray(opt) && opt.length === 0) return true;
		return !opt;
	}

	function not(fun) {
		return (...params) => !fun(...params);
	}

	function includes(str, query) {
		/* istanbul ignore else */
		if (str === undefined) str = "undefined";
		if (str === null) str = "null";
		if (str === false) str = "false";
		const text = str.toString().toLowerCase();
		return text.indexOf(query.trim()) !== -1;
	}

	function filterOptions(options, search, label, customLabel) {
		return options.filter((option) =>
			includes(customLabel(option, label), search)
		);
	}

	function stripGroups(options) {
		return options.filter((option) => !option.$isLabel);
	}

	function flattenOptions(values, label) {
		return (options) =>
			options.reduce((prev, curr) => {
				/* istanbul ignore else */
				if (curr[values] && curr[values].length) {
					prev.push({
						$groupLabel: curr[label],
						$isLabel: true,
					});
					return prev.concat(curr[values]);
				}
				return prev;
			}, []);
	}

	function filterGroups(search, label, values, groupLabel, customLabel) {
		return (groups) =>
			groups.map((group) => {
				/* istanbul ignore else */
				if (!group[values]) {
					console.warn(
						`Options passed to vue-multiselect do not contain groups, despite the config.`
					);
					return [];
				}
				const groupOptions = filterOptions(
					group[values],
					search,
					label,
					customLabel
				);

				return groupOptions.length
					? {
							[groupLabel]: group[groupLabel],
							[values]: groupOptions,
					  }
					: [];
			});
	}

	const flow =
		(...fns) =>
		(x) =>
			fns.reduce((v, f) => f(v), x);
	//#endregion

	//#region multiselectMixin.js props

	/**
	 * Decide whether to filter the results based on search query.
	 * Useful for async filtering, where we search through more complex data.
	 * @type {Boolean}
	 */
	export let internalSearch = true;

	/**
	 * Array of available options: Objects, Strings or Integers.
	 * If array of objects, visible label will default to option.label.
	 * If `labal` prop is passed, label will equal option['label']
	 * @type {Array}
	 */
	export let options = true;

	/**
	 * Equivalent to the `multiple` attribute on a `<select>` input.
	 * @default false
	 * @type {Boolean}
	 */
	export let multiple = false;

	/**
	 * Presets the selected options value.
	 * @type {Object||Array||String||Integer}
	 */
	export let value = [];

	/**
	 * Key to compare objects
	 * @default 'id'
	 * @type {String}
	 */
	export let trackBy = "id";

	/**
	 * Label to look for in option Object
	 * @default 'label'
	 * @type {String}
	 */
	export let label = "label";

	/**
	 * Enable/disable search in options
	 * @default true
	 * @type {Boolean}
	 */
	export let searchable = true;

	/**
	 * Clear the search input after `)
	 * @default true
	 * @type {Boolean}
	 */
	export let clearOnSelect = true;

	/**
	 * Hide already selected options
	 * @default false
	 * @type {Boolean}
	 */
	export let hideSelected = false;

	/**
	 * Equivalent to the `placeholder` attribute on a `<select>` input.
	 * @default 'Select option'
	 * @type {String}
	 */
	export let placeholder = "Select option";

	/**
	 * Allow to remove all selected values
	 * @default true
	 * @type {Boolean}
	 */
	export let allowEmpty = true;

	/**
	 * Reset internalValue, search after internalValue changes.
	 * Useful if want to create a stateless dropdown.
	 * @default false
	 * @type {Boolean}
	 */
	export let resetAfter = false;

	/**
	 * Enable/disable closing after selecting an option
	 * @default true
	 * @type {Boolean}
	 */
	export let closeOnSelect = true;

	/**
	 * Function to interpolate the custom label
	 * @default false
	 * @type {Function}
	 */
	export let customLabel = (option, label) => {
        if (isEmpty(option)) return ''
        return label ? option[label] : option
      }

	/**
	 * Disable / Enable tagging
	 * @default false
	 * @type {Boolean}
	 */
	export let taggable = false;

	/**
	 * String to show when highlighting a potential tag
	 * @default 'Press enter to create a tag'
	 * @type {String}
	 */
	export let tagPlaceholder = "Press enter to create a tag";

	/**
	 * By default new tags will appear above the search results.
	 * Changing to 'bottom' will revert this behaviour
	 * and will proritize the search results
	 * @default 'top'
	 * @type {String}
	 */
	export let tagPosition = "top";

	/**
	 * Number of allowed selected options. No limit if 0.
	 * @default 0
	 * @type {Number}
	 */
	export let max = 0;

	/**
	 * Will be passed with all events as second param.
	 * Useful for identifying events origin.
	 * @default null
	 * @type {String|Integer}
	 */
	export let id = null;

	/**
	 * Limits the options displayed in the dropdown
	 * to the first X options.
	 * @default 1000
	 * @type {Integer}
	 */
	export let optionsLimit = 1000;

	/**
	 * Name of the property containing
	 * the group values
	 * @default 1000
	 * @type {String}
	 */
	export let groupValues;

	/**
	 * Name of the property containing
	 * the group label
	 * @default 1000
	 * @type {String}
	 */
	export let groupLabel;

	/**
	 * Allow to select all group values
	 * by selecting the group label
	 * @default false
	 * @type {Boolean}
	 */
	export let groupSelect = false;

	/**
	 * Array of keyboard keys to block
	 * when selecting
	 * @default 1000
	 * @type {String}
	 */
	export let blockKeys = [];

	/**
	 * Prevent from wiping up the search value
	 * @default false
	 * @type {Boolean}
	 */
	export let preserveSearch = false;

	/**
	 * Select 1st options if value is empty
	 * @default false
	 * @type {Boolean}
	 */
	export let preselectFirst = false;

	//#endregion

	//#region Multiselect.vue props

	/**
	 * name attribute to match optional label element
	 * @default ''
	 * @type {String}
	 */
	export let name = "";
	/**
	 * String to show when pointing to an option
	 * @default 'Press enter to select'
	 * @type {String}
	 */
	export let selectLabel = "Press enter to select";
	/**
	 * String to show when pointing to an option
	 * @default 'Press enter to select'
	 * @type {String}
	 */
	export let selectGroupLabel = "Press enter to select group";
	/**
	 * String to show next to selected option
	 * @default 'Selected'
	 * @type {String}
	 */
	export let selectedLabel = "Selected";
	/**
	 * String to show when pointing to an already selected option
	 * @default 'Press enter to remove'
	 * @type {String}
	 */
	export let deselectLabel = "Press enter to remove";
	/**
	 * String to show when pointing to an already selected option
	 * @default 'Press enter to remove'
	 * @type {String}
	 */
	export let deselectGroupLabel = "Press enter to deselect group";
	/**
	 * Decide whether to show pointer labels
	 * @default true
	 * @type {Boolean}
	 */
	export let showLabels = true;
	/**
	 * Limit the display of selected options. The rest will be hidden within the limitText string.
	 * @default 99999
	 * @type {Integer}
	 */
	export let limit = 99999;
	/**
	 * Sets maxHeight style value of the dropdown
	 * @default 300
	 * @type {Integer}
	 */
	export let maxHeight = 300;
	/**
	 * Function that process the message shown when selected
	 * elements pass the defined limit.
	 * @default 'and * more'
	 * @param {Int} count Number of elements more than limit
	 * @type {Function}
	 */
	export let limitText = (count) => `and ${count} more`;
	/**
	 * Set true to trigger the loading spinner.
	 * @default False
	 * @type {Boolean}
	 */
	export let loading = false;
	/**
	 * Disables the multiselect if true.
	 * @default false
	 * @type {Boolean}
	 */
	export let disabled = false;
	/**
	 * Fixed opening direction
	 * @default ''
	 * @type {String}
	 */
	export let openDirection = "";
	/**
	 * Shows slot with message about empty options
	 * @default true
	 * @type {Boolean}
	 */
	export let showNoOptions = true;

	export let showNoResults = true;

	export let tabindex = 0;

	//#endregion

	//#region pointerMixin.js props

	/**
	 * Enable/disable highlighting of the pointed value.
	 * @type {Boolean}
	 * @default true
	 */
	export let showPointer = true;

	export let optionHeight = 40;

	//#endregion

	//#region multiselectMixin.js data

	let search = "";
	let isOpen = false;
	let preferredOpenDirection = "below";
	let optimizedHeight = maxHeight;
	//#endregion

	//#region pointerMixin.js data

	let pointer = 0;
	let pointerDirty = false;

	//#endregion

	//#region multiselectMixin.js computed
	let internalValue;

	$: internalValue =
		value || value === 0 ? (Array.isArray(value) ? value : [value]) : [];

	let filteredOptions;
	$: filteredOptions = (() => {
		const _search = search || "";
		const normalizedSearch = _search.toLowerCase().trim();

		let _options = options.concat();

		/* istanbul ignore else */
		if (internalSearch) {
			_options = groupValues
				? filterAndFlat(_options, normalizedSearch, label)
				: filterOptions(_options, normalizedSearch, label, customLabel);
		} else {
			_options = groupValues
				? flattenOptions(groupValues, groupLabel)(_options)
				: _options;
		}

		_options = hideSelected ? _options.filter(not(isSelected)) : _options;

		/* istanbul ignore else */
		if (
			taggable &&
			normalizedSearch.length &&
			!isExistingOption(normalizedSearch)
		) {
			if (tagPosition === "bottom") {
				_options.push({ isTag: true, label: search });
			} else {
				_options.unshift({ isTag: true, label: search });
			}
		}
		console.log(_options);

		return _options.slice(0, optionsLimit);
	})();

	let valueKeys;
	$: valueKeys = (() => {
		if (trackBy) {
			return internalValue.map((element) => element[trackBy]);
		} else {
			return internalValue;
		}
	})();

	let optionKeys;
	$: optionKeys = (() => {
		const _options = groupValues ? flatAndStrip(options) : options;
		return _options.map((element) =>
			customLabel(element, label)?.toString().toLowerCase()
		);
	})();

	let currentOptionLabel;
	$: currentOptionLabel = multiple
		? searchable
			? ""
			: placeholder
		: internalValue.length
		? getOptionLabel(internalValue[0])
		: searchable
		? ""
		: placeholder;

	//#endregion

	//#region Multiselect.vue computed

	let isSingleLabelVisible;
	$: isSingleLabelVisible =
		(singleValue || singleValue === 0) &&
		(!isOpen || !searchable) &&
		!visibleValues.length;

	let isPlaceholderVisible;
	$: isPlaceholderVisible = !internalValue.length && (!searchable || !isOpen);

	let visibleValues;
	$: visibleValues = multiple ? internalValue.slice(0, limit) : [];

	let singleValue;
	$: singleValue = internalValue[0];

	let deselectLabelText;
	$: deselectLabelText = showLabels ? deselectLabel : "";

	let deselectGroupLabelText;
	$: deselectGroupLabelText = showLabels ? deselectGroupLabel : "";

	let selectLabelText;
	$: selectLabelText = showLabels ? selectLabel : "";

	let selectGroupLabelText;
	$: selectGroupLabelText = showLabels ? selectGroupLabel : "";

	let selectedLabelText;
	$: selectedLabelText = showLabels ? selectedLabel : "";

	let inputStyle;
	$: inputStyle = (()=> {
		if (searchable || (multiple && value && value.length)) {
			// Hide input by setting the width to 0 allowing it to receive focus
			return isOpen
				? { width: "100%" }
				: { width: "0", position: "absolute", padding: "0" };
		}
		return "";
	})()

	let contentStyle;
	$: contentStyle = options.length
		? { display: "inline-block" }
		: { display: "block" };

	let isAbove;
	$: isAbove = (()=> {
		if (openDirection === "above" || openDirection === "top") {
			return true;
		} else if (openDirection === "below" || openDirection === "bottom") {
			return false;
		} else {
			return preferredOpenDirection === "above";
		}
	})()

	let showSearchInput;
	$: showSearchInput =
		searchable &&
		(hasSingleSelectedSlot && (visibleSingleValue || visibleSingleValue === 0)
			? isOpen
			: true);

	function handleKeyDown(e) {
		if (e.code == "ArrowDown") pointerForward();
		if (e.code == "ArrowUp") pointerBackward();
		if (e.code == "Delete") removeLastElement();
	}

	function handleKeyUp(e) {
		if (e.code == "Escape") deactivate();
	}

	function handleKeyPress(e) {
		if (e.code == "Tab") addPointerElement(e);
	}

	function tagHandleKeyPress(e) {
		if (e.code == "Enter") removeElement(option);
	}

	//#endregion

	//#region pointerMixin.js computed

	let pointerPosition;
	$: pointerPosition = (() => {
		return pointer * optionHeight;
	})();

	let visibleElements;
	$: visibleElements = (() => {
		return optimizedHeight / optionHeight;
	})();
	//#endregion

	//#region  multiselectMixin.js watch

	$: internalValue,
		(() => {
			/* istanbul ignore else */
			if (resetAfter && internalValue.length) {
				search = "";
				dispatch("input", multiple ? [] : null);
			}
		})();

	$: search,
		(() => {
			dispatch("search-change", search, id);
		});

	//#endregion

	//#region pointerMixin.js watch

	$: filteredOptions,
		(() => {
			pointerAdjust();
		})();
	$: isOpen,
		(() => {
			pointerDirty = false;
		})();
	$: pointer,
		(() => {
			searchBind &&
				searchBind.setAttribute(
					"aria-activedescendant",
					id + "-" + pointer.toString()
				);
		})();
	//#endregion

	//#region multiselectMixin.js methods
	/**
	 * Returns the internalValue in a way it can be emited to the parent
	 * @returns {Object||Array||String||Integer}
	 */
	function getValue() {
		return multiple
			? internalValue
			: internalValue.length === 0
			? null
			: internalValue[0];
	}

	/**
	 * Filters and then flattens the options list
	 * @param  {Array}
	 * @returns {Array} returns a filtered and flat options list
	 */
	function filterAndFlat(options, search, label) {
		return flow(
			filterGroups(search, label, groupValues, groupLabel, customLabel),
			flattenOptions(groupValues, groupLabel)
		)(options);
	}

	/**
	 * Flattens and then strips the group labels from the options list
	 * @param  {Array}
	 * @returns {Array} returns a flat options list without group labels
	 */
	function flatAndStrip(options) {
		return flow(flattenOptions(groupValues, groupLabel), stripGroups)(options);
	}

	/**
	 * Updates the search value
	 * @param  {String}
	 */
	function updateSearch(query) {
		search = query;
	}

	/**
	 * Finds out if the given query is already present
	 * in the available options
	 * @param  {String}
	 * @returns {Boolean} returns true if element is available
	 */
	function isExistingOption(query) {
		return !options ? false : optionKeys.indexOf(query) > -1;
	}

	/**
	 * Finds out if the given element is already present
	 * in the result value
	 * @param  {Object||String||Integer} option passed element to check
	 * @returns {Boolean} returns true if element is selected
	 */
	function isSelected(option) {
		const opt = trackBy ? option[trackBy] : option;
		return valueKeys.indexOf(opt) > -1;
	}

	/**
	 * Finds out if the given option is disabled
	 * @param  {Object||String||Integer} option passed element to check
	 * @returns {Boolean} returns true if element is disabled
	 */
	function isOptionDisabled(option) {
		return !!option.$isDisabled;
	}
	/**
	 * Returns empty string when options is null/undefined
	 * Returns tag query if option is tag.
	 * Returns the customLabel() results and casts it to string.
	 *
	 * @param  {Object||String||Integer} Passed option
	 * @returns {Object||String}
	 */
	function getOptionLabel(option) {
		if (isEmpty(option)) return "";
		/* istanbul ignore else */
		if (option.isTag) return option.label;
		/* istanbul ignore else */
		if (option.$isLabel) return option.$groupLabel;

		let _label = customLabel(option, label);
		/* istanbul ignore else */
		if (isEmpty(_label)) return "";
		return _label;
	}

	/**
	 * Add the given option to the list of selected options
	 * or sets the option as the selected option.
	 * If option is already selected -> remove it from the results.
	 *
	 * @param  {Object||String||Integer} option to select/deselect
	 * @param  {Boolean} block removing
	 */
	function select(option, key) {
		/* istanbul ignore else */
		if (option.$isLabel && groupSelect) {
			selectGroup(option);
			return;
		}
		if (
			blockKeys.indexOf(key) !== -1 ||
			disabled ||
			option.$isDisabled ||
			option.$isLabel
		)
			return;
		/* istanbul ignore else */
		if (max && multiple && internalValue.length === max) return;
		/* istanbul ignore else */
		if (key === "Tab" && !pointerDirty) return;
		if (option.isTag) {
			dispatch("tag", option.label, id);
			search = "";
			if (closeOnSelect && !multiple) deactivate();
		} else {
			const isSelected = isSelected(option);

			if (isSelected) {
				if (key !== "Tab") removeElement(option);
				return;
			}

			dispatch("select", option, id);

			if (multiple) {
				dispatch("input", internalValue.concat([option]), id);
			} else {
				dispatch("input", option, id);
			}

			/* istanbul ignore else */
			if (clearOnSelect) search = "";
		}
		/* istanbul ignore else */
		if (closeOnSelect) deactivate();
	}

	/**
	 * Add the given group options to the list of selected options
	 * If all group optiona are already selected -> remove it from the results.
	 *
	 * @param  {Object||String||Integer} group to select/deselect
	 */
	function selectGroup(selectedGroup) {
		const group = options.find((option) => {
			return option[groupLabel] === selectedGroup.$groupLabel;
		});

		if (!group) return;

		if (wholeGroupSelected(group)) {
			dispatch("remove", group[groupValues], id);

			const newValue = internalValue.filter(
				(option) => group[groupValues].indexOf(option) === -1
			);

			dispatch("input", newValue, id);
		} else {
			const optionsToAdd = group[groupValues].filter(
				(option) => !(isOptionDisabled(option) || isSelected(option))
			);

			dispatch("select", optionsToAdd, id);
			dispatch("input", internalValue.concat(optionsToAdd), id);
		}

		if (closeOnSelect) deactivate();
	}

	/**
	 * Helper to identify if all values in a group are selected
	 *
	 * @param {Object} group to validated selected values against
	 */
	function wholeGroupSelected(group) {
		return group[groupValues].every(
			(option) => isSelected(option) || isOptionDisabled(option)
		);
	}
	/**
	 * Helper to identify if all values in a group are disabled
	 *
	 * @param {Object} group to check for disabled values
	 */
	function wholeGroupDisabled(group) {
		return group[groupValues].every(isOptionDisabled);
	}
	/**
	 * Removes the given option from the selected options.
	 * Additionally checks allowEmpty prop if option can be removed when
	 * it is the last selected option.
	 *
	 * @param  {type} option description
	 * @returns {type}        description
	 */
	function removeElement(option, shouldClose = true) {
		/* istanbul ignore else */
		if (disabled) return;
		/* istanbul ignore else */
		if (option.$isDisabled) return;
		/* istanbul ignore else */
		if (!allowEmpty && internalValue.length <= 1) {
			deactivate();
			return;
		}

		const index =
			typeof option === "object"
				? valueKeys.indexOf(option[trackBy])
				: valueKeys.indexOf(option);

		dispatch("remove", option, id);
		if (multiple) {
			const newValue = internalValue
				.slice(0, index)
				.concat(internalValue.slice(index + 1));
			dispatch("input", newValue, id);
		} else {
			dispatch("input", null, id);
		}

		/* istanbul ignore else */
		if (closeOnSelect && shouldClose) deactivate();
	}

	/**
	 * Calls removeElement() with the last element
	 * from internalValue (selected element Array)
	 *
	 * @fires this#removeElement
	 */
	function removeLastElement() {
		/* istanbul ignore else */
		if (blockKeys.indexOf("Delete") !== -1) return;
		/* istanbul ignore else */
		if (
			search.length === 0 &&
			Array.isArray(internalValue) &&
			internalValue.length
		) {
			removeElement(internalValue[internalValue.length - 1], false);
		}
	}

	/**
	 * Opens the multiselect’s dropdown.
	 * Sets isOpen to TRUE
	 */
	function activate() {
		/* istanbul ignore else */
		if (isOpen || disabled) return;

		adjustPosition();
		/* istanbul ignore else  */
		if (groupValues && pointer === 0 && filteredOptions.length) {
			pointer = 1;
		}

		isOpen = true;
		/* istanbul ignore else  */
		if (searchable) {
			if (!preserveSearch) search = "";
			if (searchBind) {
				console.log(searchBind);
				//setTimeout(() => searchBind?.focus());
			}
		} else {
			el?.focus();
		}
		dispatch("open", id);
	}

	/**
	 * Closes the multiselect’s dropdown.
	 * Sets isOpen to FALSE
	 */
	function deactivate() {
		/* istanbul ignore else */
		if (!isOpen) return;

		isOpen = false;
		/* istanbul ignore else  */
		if (searchable) {
			searchBind && searchBind.blur();
		} else {
			el.blur();
		}
		if (!preserveSearch) search = "";
		dispatch("close", getValue(), id);
	}

	/**
	 * Call activate() or deactivate()
	 * depending on isOpen value.
	 *
	 * @fires this#activate || this#deactivate
	 * @property {Boolean} isOpen indicates if dropdown is open
	 */
	function toggle() {
		isOpen ? deactivate() : activate();
	}

	/**
	 * Updates the hasEnoughSpace variable used for
	 * detecting where to expand the dropdown
	 */
	function adjustPosition() {
		if (typeof window === "undefined") return;

		const spaceAbove = el?.getBoundingClientRect().top;
		const spaceBelow = window.innerHeight - el?.getBoundingClientRect().bottom;
		const hasEnoughSpaceBelow = spaceBelow > maxHeight;

		if (
			hasEnoughSpaceBelow ||
			spaceBelow > spaceAbove ||
			openDirection === "below" ||
			openDirection === "bottom"
		) {
			preferredOpenDirection = "below";
			optimizedHeight = Math.min(spaceBelow - 40, maxHeight);
		} else {
			preferredOpenDirection = "above";
			optimizedHeight = Math.min(spaceAbove - 40, maxHeight);
		}
	}

	//#endregion

	//#region pointerMixin.js methods

	function optionHighlight(index, option) {
		return {
			"multiselect__option--highlight": index === pointer && showPointer,
			"multiselect__option--selected": isSelected(option),
		};
	}

	function groupHighlight(index, selectedGroup) {
		if (!groupSelect) {
			return [
				"multiselect__option--disabled",
				{ "multiselect__option--group": selectedGroup.$isLabel },
			];
		}

		const group = options.find((option) => {
			return option[groupLabel] === selectedGroup.$groupLabel;
		});

		return group && !wholeGroupDisabled(group)
			? [
					"multiselect__option--group",
					{
						"multiselect__option--highlight": index === pointer && showPointer,
					},
					{ "multiselect__option--group-selected": wholeGroupSelected(group) },
			  ]
			: "multiselect__option--disabled";
	}

	function addPointerElement({ key } = "Enter") {
		/* istanbul ignore else */
		if (filteredOptions.length > 0) {
			select(filteredOptions[pointer], key);
		}
		pointerReset();
	}

	function pointerForward() {
		/* istanbul ignore else */
		if (pointer < filteredOptions.length - 1) {
			pointer++;
			/* istanbul ignore next */
			if (
				listBind.scrollTop <=
				pointerPosition - (visibleElements - 1) * optionHeight
			) {
				listBind.scrollTop =
					pointerPosition - (visibleElements - 1) * optionHeight;
			}
			/* istanbul ignore else */
			if (
				filteredOptions[pointer] &&
				filteredOptions[pointer].$isLabel &&
				!groupSelect
			)
				pointerForward();
		}
		pointerDirty = true;
	}

	function pointerBackward() {
		if (pointer > 0) {
			pointer--;
			/* istanbul ignore else */
			if (listBind.scrollTop >= pointerPosition) {
				listBind.scrollTop = pointerPosition;
			}
			/* istanbul ignore else */
			if (
				filteredOptions[pointer] &&
				filteredOptions[pointer].$isLabel &&
				!groupSelect
			)
				pointerBackward();
		} else {
			/* istanbul ignore else */
			if (
				filteredOptions[pointer] &&
				filteredOptions[0].$isLabel &&
				!groupSelect
			)
				pointerForward();
		}
		pointerDirty = true;
	}

	function pointerReset() {
		/* istanbul ignore else */
		if (!closeOnSelect) return;
		pointer = 0;
		/* istanbul ignore else */
		if (listBind) {
			listBind.scrollTop = 0;
		}
	}

	function pointerAdjust() {
		/* istanbul ignore else */
		if (pointer >= filteredOptions.length - 1) {
			pointer = filteredOptions.length ? filteredOptions.length - 1 : 0;
		}

		if (
			filteredOptions.length > 0 &&
			filteredOptions[pointer].$isLabel &&
			!groupSelect
		) {
			pointerForward();
		}
	}

	function pointerSet(index) {
		pointer = index;
		pointerDirty = true;
	}
	//#endregion

	//#region multiselectMixin.js mounted
	onMount(() => {
		/* istanbul ignore else */
		if (!multiple && max) {
			console.warn(
				"[Vue-Multiselect warn]: Max prop should not be used when prop Multiple equals false."
			);
		}
		if (preselectFirst && !internalValue.length && options.length) {
			select(filteredOptions[0]);
		}
	});
	//#endregion
</script>

<div
	bind:this={el}
	tabindex={searchable ? -1 : tabindex}
	class:multiselect--active={isOpen}
	class:multiselect--disabled={disabled}
	class:multiselect--above={isAbove}
	on:focus={activate}
	on:blur={searchable ? false : deactivate()}
	on:keydown|preventDefault={handleKeyDown}
	on:keypress|preventDefault|stopPropagation={handleKeyPress}
	on:keyup={handleKeyUp}
	class="multiselect"
	role="combobox"
	aria-owns={"listbox-" + id}
>
	<slot name="caret" {toggle}>
		<div
			on:mousedown|preventDefault|stopPropagation={toggle}
			class="multiselect__select"
		/>
	</slot>
	<slot name="clear" {search} />
	<div bind:this={tagsBind} class="multiselect__tags">
		<slot
			name="selection"
			{search}
			remove={removeElement}
			values={visibleValues}
			is-open={isOpen}
		>
			{#if visibleValues.length > 0}
				<div class="multiselect__tags-wrap" on:mousedown|preventDefault>
					{#each visibleValues as option, index}
						<slot name="tag" {option} {search} remove={removeElement}>
							<span class="multiselect__tag">
								<span>{getOptionLabel(option)}</span>
								<i
									tabindex="1"
									on:keypress|preventDefault={tagHandleKeyPress}
									on:mousedown|preventDefault={removeElement(option)}
									class="multiselect__tag-icon"
								/>
							</span>
						</slot>
					{/each}
				</div>
			{/if}
			{#if internalValue && internalValue.length > limit}
				<slot name="limit">
					<strong class="multiselect__strong"
						>{limitText(internalValue.length - limit)}</strong
					>
				</slot>
			{/if}
		</slot>
		<div name="multiselect__loading" transition:fade>
			<slot name="loading">
				{#if loading}
					<div class="multiselect__spinner" />
				{/if}
			</slot>
		</div>
		{#if searchable}
			<input
				bind:this={searchBind}
				{name}
				{id}
				type="text"
				autocomplete="off"
				spellcheck="false"
				{placeholder}
				style={inputStyle}
				value={search}
				{disabled}
				{tabindex}
				on:input={(e) => updateSearch(e.target.value)}
				on:focus|preventDefault={activate()}
				on:blur|preventDefault={deactivate()}
				on:keyup={handleKeyUp}
				on:keydown|preventDefault={handleKeyDown}
				on:keypress|preventDefault|stopPropagation|self={handleKeyPress}
				class="multiselect__input"
				aria-controls={"listbox-" + id}
			/>
			<!-- content here -->
		{/if}
		{#if isSingleLabelVisible}
			<span class="multiselect__single" on:mousedown|preventDefault={toggle}>
				<slot name="singleLabel" option="singleValue">
					{currentOptionLabel}
				</slot>
			</span>
		{/if}

		{#if isPlaceholderVisible}
			<span
				class="multiselect__placeholder"
				on:mousedown|preventDefault={toggle}
			>
				<slot name="placeholder">
					{placeholder}
				</slot>
			</span>
		{/if}
	</div>

	{#if isOpen}
		<div
			transition:fade
			on:focus={activate}
			tabindex="-1"
			on:mousedown|preventDefault
			style={` maxHeight: ${optimizedHeight}px`}
			bind:this={listBind}
		>
			<ul
				class="multiselect__content"
				style={contentStyle}
				role="listbox"
				id={"listbox-" + id}
			>
				<slot name="beforeList" />
				{#if multiple && max === internalValue.length}
					<li>
						<span class="multiselect__option">
							<slot name="maxElements"
								>Maximum of {{ max }} options selected. First remove a selected option
								to select another.</slot
							>
						</span>
					</li>
				{/if}

				{#if !max || internalValue.length < max}
					{#each filteredOptions as option, index}
						<li
							class="multiselect__element"
							id={id + "-" + index}
							role={!(option && (option.$isLabel || option.$isDisabled))
								? "option"
								: null}
						>
							{#if !(option && (option.$isLabel || option.$isDisabled))}
								<span
									class={optionHighlight(index, option) +
										" multiselect__option"}
									on:click|stopPropagation={select(option)}
									on:mouseenter|self={pointerSet(index)}
									data-select={option && option.isTag
										? tagPlaceholder
										: selectLabelText}
									data-selected={selectedLabelText}
									data-deselect={deselectLabelText}
								>
									<slot name="option" {option} {search} {index}>
										<span>{getOptionLabel(option)}</span>
									</slot>
								</span>
							{/if}

							{#if option && (option.$isLabel || option.$isDisabled)}
								<span
									data-select={groupSelect && selectGroupLabelText}
									data-deselect={groupSelect && deselectGroupLabelText}
									class={groupHighlight(index, option) + " multiselect__option"}
									on:mouseenter|self={groupSelect && pointerSet(index)}
									on:mousedown|preventDefault={selectGroup(option)}
								>
									<slot name="option" {option} {search} {index}>
										<span>{getOptionLabel(option)}</span>
									</slot>
								</span>
							{/if}
						</li>
					{/each}
				{/if}
				{#if showNoResults && filteredOptions.length === 0 && search && !loading}
					<li>
						<span class="multiselect__option">
							<slot name="noResult" {search}
								>No elements found. Consider changing the search query.</slot
							>
						</span>
					</li>
				{/if}

				{#if showNoOptions && options.length === 0 && !search && !loading}
					<li>
						<span class="multiselect__option">
							<slot name="noOptions">List is empty.</slot>
						</span>
					</li>
				{/if}

				<slot name="afterList" />
			</ul>
		</div>

		<!-- content here -->
	{/if}
</div>

<style>
	fieldset[disabled] .multiselect {
		pointer-events: none;
	}

	.multiselect__spinner {
		position: absolute;
		right: 1px;
		top: 1px;
		width: 48px;
		height: 35px;
		background: #fff;
		display: block;
	}

	.multiselect__spinner:before,
	.multiselect__spinner:after {
		position: absolute;
		content: "";
		top: 50%;
		left: 50%;
		margin: -8px 0 0 -8px;
		width: 16px;
		height: 16px;
		border-radius: 100%;
		border-color: #41b883 transparent transparent;
		border-style: solid;
		border-width: 2px;
		box-shadow: 0 0 0 1px transparent;
	}

	.multiselect__spinner:before {
		animation: spinning 2.4s cubic-bezier(0.41, 0.26, 0.2, 0.62);
		animation-iteration-count: infinite;
	}

	.multiselect__spinner:after {
		animation: spinning 2.4s cubic-bezier(0.51, 0.09, 0.21, 0.8);
		animation-iteration-count: infinite;
	}

	.multiselect__loading-enter-active,
	.multiselect__loading-leave-active {
		transition: opacity 0.4s ease-in-out;
		opacity: 1;
	}

	.multiselect__loading-enter,
	.multiselect__loading-leave-active {
		opacity: 0;
	}

	.multiselect,
	.multiselect__input,
	.multiselect__single {
		font-family: inherit;
		font-size: 16px;
		touch-action: manipulation;
	}

	.multiselect {
		box-sizing: content-box;
		display: block;
		position: relative;
		width: 100%;
		min-height: 40px;
		text-align: left;
		color: #35495e;
	}

	.multiselect * {
		box-sizing: border-box;
	}

	.multiselect:focus {
		outline: none;
	}

	.multiselect--disabled {
		background: #ededed;
		pointer-events: none;
		opacity: 0.6;
	}

	.multiselect--active {
		z-index: 50;
	}

	.multiselect--active:not(.multiselect--above) .multiselect__current,
	.multiselect--active:not(.multiselect--above) .multiselect__input,
	.multiselect--active:not(.multiselect--above) .multiselect__tags {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	.multiselect--active .multiselect__select {
		transform: rotateZ(180deg);
	}

	.multiselect--above.multiselect--active .multiselect__current,
	.multiselect--above.multiselect--active .multiselect__input,
	.multiselect--above.multiselect--active .multiselect__tags {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.multiselect__input,
	.multiselect__single {
		position: relative;
		display: inline-block;
		min-height: 20px;
		line-height: 20px;
		border: none;
		border-radius: 5px;
		background: #fff;
		padding: 0 0 0 5px;
		width: calc(100%);
		transition: border 0.1s ease;
		box-sizing: border-box;
		margin-bottom: 8px;
		vertical-align: top;
	}

	.multiselect__input::placeholder {
		color: #35495e;
	}

	.multiselect__tag ~ .multiselect__input,
	.multiselect__tag ~ .multiselect__single {
		width: auto;
	}

	.multiselect__input:hover,
	.multiselect__single:hover {
		border-color: #cfcfcf;
	}

	.multiselect__input:focus,
	.multiselect__single:focus {
		border-color: #a8a8a8;
		outline: none;
	}

	.multiselect__single {
		padding-left: 5px;
		margin-bottom: 8px;
	}

	.multiselect__tags-wrap {
		display: inline;
	}

	.multiselect__tags {
		min-height: 40px;
		display: block;
		padding: 8px 40px 0 8px;
		border-radius: 5px;
		border: 1px solid #e8e8e8;
		background: #fff;
		font-size: 14px;
	}

	.multiselect__tag {
		position: relative;
		display: inline-block;
		padding: 4px 26px 4px 10px;
		border-radius: 5px;
		margin-right: 10px;
		color: #fff;
		line-height: 1;
		background: #41b883;
		margin-bottom: 5px;
		white-space: nowrap;
		overflow: hidden;
		max-width: 100%;
		text-overflow: ellipsis;
	}

	.multiselect__tag-icon {
		cursor: pointer;
		margin-left: 7px;
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		font-weight: 700;
		font-style: initial;
		width: 22px;
		text-align: center;
		line-height: 22px;
		transition: all 0.2s ease;
		border-radius: 5px;
	}

	.multiselect__tag-icon:after {
		content: "×";
		color: #266d4d;
		font-size: 14px;
	}

	.multiselect__tag-icon:focus,
	.multiselect__tag-icon:hover {
		background: #369a6e;
	}

	.multiselect__tag-icon:focus:after,
	.multiselect__tag-icon:hover:after {
		color: white;
	}

	.multiselect__current {
		line-height: 16px;
		min-height: 40px;
		box-sizing: border-box;
		display: block;
		overflow: hidden;
		padding: 8px 12px 0;
		padding-right: 30px;
		white-space: nowrap;
		margin: 0;
		text-decoration: none;
		border-radius: 5px;
		border: 1px solid #e8e8e8;
		cursor: pointer;
	}

	.multiselect__select {
		line-height: 16px;
		display: block;
		position: absolute;
		box-sizing: border-box;
		width: 40px;
		height: 38px;
		right: 1px;
		top: 1px;
		padding: 4px 8px;
		margin: 0;
		text-decoration: none;
		text-align: center;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.multiselect__select:before {
		position: relative;
		right: 0;
		top: 65%;
		color: #999;
		margin-top: 4px;
		border-style: solid;
		border-width: 5px 5px 0 5px;
		border-color: #999999 transparent transparent transparent;
		content: "";
	}

	.multiselect__placeholder {
		color: #adadad;
		display: inline-block;
		margin-bottom: 10px;
		padding-top: 2px;
	}

	.multiselect--active .multiselect__placeholder {
		display: none;
	}

	.multiselect__content-wrapper {
		position: absolute;
		display: block;
		background: #fff;
		width: 100%;
		max-height: 240px;
		overflow: auto;
		border: 1px solid #e8e8e8;
		border-top: none;
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
		z-index: 50;
		-webkit-overflow-scrolling: touch;
	}

	.multiselect__content {
		list-style: none;
		display: inline-block;
		padding: 0;
		margin: 0;
		min-width: 100%;
		vertical-align: top;
	}

	.multiselect--above .multiselect__content-wrapper {
		bottom: 100%;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
		border-bottom: none;
		border-top: 1px solid #e8e8e8;
	}

	.multiselect__content::webkit-scrollbar {
		display: none;
	}

	.multiselect__element {
		display: block;
	}

	.multiselect__option {
		display: block;
		padding: 12px;
		min-height: 40px;
		line-height: 16px;
		text-decoration: none;
		text-transform: none;
		vertical-align: middle;
		position: relative;
		cursor: pointer;
		white-space: nowrap;
	}

	.multiselect__option:after {
		top: 0;
		right: 0;
		position: absolute;
		line-height: 40px;
		padding-right: 12px;
		padding-left: 20px;
		font-size: 13px;
	}

	.multiselect__option--highlight {
		background: #41b883;
		outline: none;
		color: white;
	}

	.multiselect__option--highlight:after {
		content: attr(data-select);
		background: #41b883;
		color: white;
	}

	.multiselect__option--selected {
		background: #f3f3f3;
		color: #35495e;
		font-weight: bold;
	}

	.multiselect__option--selected:after {
		content: attr(data-selected);
		color: silver;
	}

	.multiselect__option--selected.multiselect__option--highlight {
		background: #ff6a6a;
		color: #fff;
	}

	.multiselect__option--selected.multiselect__option--highlight:after {
		background: #ff6a6a;
		content: attr(data-deselect);
		color: #fff;
	}

	.multiselect--disabled .multiselect__current,
	.multiselect--disabled .multiselect__select {
		background: #ededed;
		color: #a6a6a6;
	}

	.multiselect__option--disabled {
		background: #ededed !important;
		color: #a6a6a6 !important;
		cursor: text;
		pointer-events: none;
	}

	.multiselect__option--group {
		background: #ededed;
		color: #35495e;
	}

	.multiselect__option--group.multiselect__option--highlight {
		background: #35495e;
		color: #fff;
	}

	.multiselect__option--group.multiselect__option--highlight:after {
		background: #35495e;
	}

	.multiselect__option--disabled.multiselect__option--highlight {
		background: #dedede;
	}

	.multiselect__option--group-selected.multiselect__option--highlight {
		background: #ff6a6a;
		color: #fff;
	}

	.multiselect__option--group-selected.multiselect__option--highlight:after {
		background: #ff6a6a;
		content: attr(data-deselect);
		color: #fff;
	}

	.multiselect-enter-active,
	.multiselect-leave-active {
		transition: all 0.15s ease;
	}

	.multiselect-enter,
	.multiselect-leave-active {
		opacity: 0;
	}

	.multiselect__strong {
		margin-bottom: 8px;
		line-height: 20px;
		display: inline-block;
		vertical-align: top;
	}

	*[dir="rtl"] .multiselect {
		text-align: right;
	}

	*[dir="rtl"] .multiselect__select {
		right: auto;
		left: 1px;
	}

	*[dir="rtl"] .multiselect__tags {
		padding: 8px 8px 0px 40px;
	}

	*[dir="rtl"] .multiselect__content {
		text-align: right;
	}

	*[dir="rtl"] .multiselect__option:after {
		right: auto;
		left: 0;
	}

	*[dir="rtl"] .multiselect__clear {
		right: auto;
		left: 12px;
	}

	*[dir="rtl"] .multiselect__spinner {
		right: auto;
		left: 1px;
	}

	@keyframes spinning {
		from {
			transform: rotate(0);
		}
		to {
			transform: rotate(2turn);
		}
	}
</style>
