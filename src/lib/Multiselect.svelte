<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount, createEventDispatcher } from 'svelte';
	import {
		filterGroups,
		filterOptions,
		flattenOptions,
		flow,
		getEventValue,
		isEmpty,
		not,
		stripGroups
	} from './helpers.js';

	let dispatch = createEventDispatcher();
	//TODO find out what html element is refered by $el
	let el: HTMLDivElement | null | undefined,
		tagsBind,
		searchBind: HTMLInputElement,
		listBind: HTMLDivElement;

	export let hasSingleSelectedSlot = false;

	/** this is fix for vue v-model that automatically updates value when input is emitted	 */
	function dispatchInput(val: any[] | null) {
		dispatch('input', val);
		value = val;
	}
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
	export let options: any[] = [];

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
	export let value: any = [];

	/**
	 * Key to compare objects
	 * @default 'id'
	 * @type {String}
	 */
	export let trackBy: string | null = null;

	/**
	 * Label to look for in option Object
	 * @default 'label'
	 * @type {String}
	 */
	export let label: string | null = null;

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
	export let placeholder = 'Select option';

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
	export let customLabel = (option: any, label: string | null) => {
		if (isEmpty(option)) return '';
		return label ? option[label] : option;
	};

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
	export let tagPlaceholder = 'Press enter to create a tag';

	/**
	 * By default new tags will appear above the search results.
	 * Changing to 'bottom' will revert this behaviour
	 * and will proritize the search results
	 * @default 'top'
	 * @type {String}
	 */
	export let tagPosition = 'top';

	/**
	 * Number of allowed selected options. No limit if 0.
	 * @default 999
	 * @type {Number}
	 */
	export let max = 9999;

	/**
	 * Will be passed with all events as second param.
	 * Useful for identifying events origin.
	 * @default null
	 * @type {String|Integer}
	 * @deprecated
	 */
	export let id: string | null = null;

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
	 * @default null
	 * @type {String}
	 */
	export let groupValues: string | null = null;

	/**
	 * Name of the property containing
	 * the group label
	 * @default null
	 * @type {String}
	 */
	export let groupLabel: string | null = null;

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
	export let blockKeys: string[] = [];

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
	export let name = '';
	/**
	 * String to show when pointing to an option
	 * @default 'Press enter to select'
	 * @type {String}
	 */
	export let selectLabel = 'Press enter to select';
	/**
	 * String to show when pointing to an option
	 * @default 'Press enter to select'
	 * @type {String}
	 */
	export let selectGroupLabel = 'Press enter to select group';
	/**
	 * String to show next to selected option
	 * @default 'Selected'
	 * @type {String}
	 */
	export let selectedLabel = 'Selected';
	/**
	 * String to show when pointing to an already selected option
	 * @default 'Press enter to remove'
	 * @type {String}
	 */
	export let deselectLabel = 'Press enter to remove';
	/**
	 * String to show when pointing to an already selected option
	 * @default 'Press enter to remove'
	 * @type {String}
	 */
	export let deselectGroupLabel = 'Press enter to deselect group';
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
	export let limitText = (count: number) => `and ${count} more`;
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
	export let openDirection = '';
	/**
	 * Shows slot with message about empty options
	 * @default true
	 * @type {Boolean}
	 */
	export let showNoOptions = true;

	export let showNoResults = true;

	export let tabindex = 0;

	//#endregion

	export let containerClass = '';

	export let inputClass = "";

	//if true, will make multiselect same size as bootstrap size sm input
	export let small = false;

	//if true will allow option list to expand beyond size of input
	export let overflow = false;

	/**
	 * Offset of dropdown menu to keep from screen's edge
	 * @type {number}
	 */
	export let screenEdgeOffset: number = 5;

	//#region pointerMixin.js props

	/**
	 * Enable/disable highlighting of the pointed value.
	 * @type {Boolean}
	 * @default true
	 */
	export let showPointer = true;

	export let optionHeight = small ? 31 : 40;

	//#endregion

	//#region multiselectMixin.js data

	let search = '';
	let isOpen = false;
	let preferredOpenDirection = 'below';
	let optimizedHeight = maxHeight;
	//#endregion

	//#region pointerMixin.js data

	let pointer = 0;
	let pointerDirty = false;

	//#endregion

	//#region multiselectMixin.js computed
	let internalValue: any[];

	$: internalValue = value || value === 0 ? (Array.isArray(value) ? value : [value]) : [];

	let filteredOptions: string | ArrayLike<any>;
	$: filteredOptions = (() => {
		const _search = search || '';
		const normalizedSearch = _search.toLowerCase().trim();

		let _options = options.concat();

		/* istanbul ignore else */
		if (internalSearch) {
			_options = groupValues
				? filterAndFlat(_options, normalizedSearch, label)
				: filterOptions(_options, normalizedSearch, label, customLabel);
		} else {
			_options = groupValues ? flattenOptions(groupValues, groupLabel)(_options) : _options;
		}

		_options = hideSelected ? _options.filter(not(isSelected)) : _options;

		/* istanbul ignore else */
		if (taggable && normalizedSearch.length && !isExistingOption(normalizedSearch)) {
			if (tagPosition === 'bottom') {
				_options.push({ isTag: true, label: search });
			} else {
				_options.unshift({ isTag: true, label: search });
			}
		}

		return _options.slice(0, optionsLimit);
	})();

	let valueKeys: string | any[];
	$: valueKeys = (() => {
		if (trackBy) {
			return internalValue.map((element: { [x: string]: any }) => element[trackBy as string]);
		} else {
			return internalValue;
		}
	})();

	let optionKeys: string | any[];
	$: optionKeys = (() => {
		const _options = groupValues ? flatAndStrip(options) : options;

		return _options.map((element: any) => customLabel(element, label)?.toString().toLowerCase());
	})();

	let currentOptionLabel: any;
	$: currentOptionLabel = multiple
		? searchable
			? ''
			: placeholder
		: internalValue.length
		? getOptionLabel(internalValue[0])
		: searchable
		? ''
		: placeholder;

	//#endregion

	//#region Multiselect.vue computed

	let isSingleLabelVisible: any;
	$: isSingleLabelVisible =
		(singleValue || singleValue === 0) && (!isOpen || !searchable) && !visibleValues.length;

	let isPlaceholderVisible: boolean;
	$: isPlaceholderVisible = !internalValue.length && (!searchable || !isOpen);

	let visibleValues: any[];
	$: visibleValues = multiple ? internalValue.slice(0, limit) : [];

	let singleValue: number;
	$: singleValue = internalValue[0];

	let deselectLabelText: string;
	$: deselectLabelText = showLabels ? deselectLabel : '';

	let deselectGroupLabelText: string;
	$: deselectGroupLabelText = showLabels ? deselectGroupLabel : '';

	let selectLabelText: string;
	$: selectLabelText = showLabels ? selectLabel : '';

	let selectGroupLabelText: string;
	$: selectGroupLabelText = showLabels ? selectGroupLabel : '';

	let selectedLabelText: string;
	$: selectedLabelText = showLabels ? selectedLabel : '';

	let inputStyle: string;
	$: inputStyle = (() => {
		if (searchable || (multiple && value && value.length)) {
			// Hide input by setting the width to 0 allowing it to receive focus
			return isOpen ? 'width:100%' : 'width:0px; position: absolute; padding: 0';
		}
		return '';
	})();

	let contentStyle: string;
	$: contentStyle = options.length ? 'display: inline-block;' : 'display: block';

	let isAbove: boolean;
	$: isAbove = (() => {
		if (openDirection === 'above' || openDirection === 'top') {
			return true;
		} else if (openDirection === 'below' || openDirection === 'bottom') {
			return false;
		} else {
			return preferredOpenDirection === 'above';
		}
	})();

	let showSearchInput;
	$: showSearchInput =
		searchable && (hasSingleSelectedSlot && (visibleValues || visibleValues === 0) ? isOpen : true);

	//#endregion

	//#region pointerMixin.js computed

	let pointerPosition;
	$: pointerPosition = (() => {
		return pointer * optionHeight;
	})();

	let visibleElements: number;
	$: visibleElements = (() => {
		return optimizedHeight / optionHeight;
	})();
	//#endregion

	let contentWrapperHorizontalOffset = 0;
	$: if (listBind) {
		const rect = listBind.getBoundingClientRect();
		contentWrapperHorizontalOffset = Math.min(
			screen.width - rect.x - rect.width - screenEdgeOffset,
			0
		);
		// console.log('contentWrapperHorizontalOffset', contentWrapperHorizontalOffset);
	}

	//#region  multiselectMixin.js watch

	$: internalValue,
		(() => {
			/* istanbul ignore else */
			if (resetAfter && internalValue.length) {
				setTimeout(() => {
					search = '';
					dispatchInput(multiple ? [] : null);
				});
			}
		})();

	$: search,
		((s) => {
			dispatch('search-change', s);
		})(search);

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
			searchBind && searchBind.setAttribute('aria-activedescendant', id + '-' + pointer.toString());
		})();
	//#endregion

	//#region multiselectMixin.js methods
	/**
	 * Returns the internalValue in a way it can be emited to the parent
	 * @returns {Object||Array||String||Integer}
	 */
	function getValue() {
		return multiple ? internalValue : internalValue.length === 0 ? null : internalValue[0];
	}

	/**
	 * Filters and then flattens the options list
	 * @param  {Array}
	 * @returns {Array} returns a filtered and flat options list
	 */
	function filterAndFlat(options: any[], search: string, label: string | null) {
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
	function flatAndStrip(options: any[]) {
		return flow(flattenOptions(groupValues, groupLabel), stripGroups)(options);
	}

	/**
	 * Updates the search value
	 * @param  {String}
	 */
	function updateSearch(query: string) {
		search = query;
	}

	/**
	 * Finds out if the given query is already present
	 * in the available options
	 * @param  {String}
	 * @returns {Boolean} returns true if element is available
	 */
	function isExistingOption(query: string) {
		return !options ? false : optionKeys.indexOf(query) > -1;
	}

	/**
	 * Finds out if the given element is already present
	 * in the result value
	 * @param  {Object||String||Integer} option passed element to check
	 * @returns {Boolean} returns true if element is selected
	 */
	function isSelected(option: { [x: string]: any }) {
		const opt = trackBy ? option[trackBy] : option;
		return valueKeys?.indexOf(opt) > -1 ?? false;
	}

	/**
	 * Finds out if the given option is disabled
	 * @param  {Object||String||Integer} option passed element to check
	 * @returns {Boolean} returns true if element is disabled
	 */
	function isOptionDisabled(option: { $isDisabled: any }) {
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
	function getOptionLabel(option: { isTag: any; label: any; $isLabel: any; $groupLabel: any }) {
		if (isEmpty(option)) return '';
		/* istanbul ignore else */
		if (option.isTag) return option.label;
		/* istanbul ignore else */
		if (option.$isLabel) return option.$groupLabel;

		let _label = customLabel(option, label);
		/* istanbul ignore else */
		if (isEmpty(_label)) return '';
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
	function select(option: any, key?: string | undefined) {
		/* istanbul ignore else */
		if (option.$isLabel && groupSelect) {
			selectGroup(option);
			return;
		}
		//@ts-ignore
		if (blockKeys.indexOf(key) !== -1 || disabled || option.$isDisabled || option.$isLabel) return;
		/* istanbul ignore else */
		if (max && multiple && internalValue.length === max) return;
		/* istanbul ignore else */
		if (key === 'Tab' && !pointerDirty) return;

		//this will cause each loop to rerender
		if (option.isTag) {
			dispatch('tag', option.label);
			search = '';
			if (closeOnSelect && !multiple) deactivate();
		} else {
			const _isSelected = isSelected(option);
			if (_isSelected) {
				if (key !== 'Tab') removeElement(option);
				return;
			}

			dispatch('select', option);

			if (multiple) {
				dispatchInput(internalValue.concat([option]));
			} else {
				dispatchInput(option);
			}

			/* istanbul ignore else */
			if (clearOnSelect) search = '';
		}
		/* istanbul ignore else */
		if (closeOnSelect) deactivate();
		setTimeout(() => {
			options = options;
		});
	}

	/**
	 * Add the given group options to the list of selected options
	 * If all group optiona are already selected -> remove it from the results.
	 *
	 * @param  {Object||String||Integer} group to select/deselect
	 */
	function selectGroup(selectedGroup: { $groupLabel: any }) {
		const group = options.find((option) => {
			return option[groupLabel as string] === selectedGroup.$groupLabel;
		});

		if (!group) return;
		if (groupValues == null) return;

		if (wholeGroupSelected(group)) {
			dispatch('remove', group[groupValues]);

			const newValue = internalValue.filter(
				(option: any) => group[groupValues as string].indexOf(option) === -1
			);

			dispatchInput(newValue);
		} else {
			const optionsToAdd = group[groupValues].filter(
				(option: any) => !(isOptionDisabled(option) || isSelected(option))
			);

			dispatch('select', optionsToAdd);
			dispatchInput(internalValue.concat(optionsToAdd));
		}

		if (closeOnSelect) deactivate();
		options = options;
	}

	/**
	 * Helper to identify if all values in a group are selected
	 *
	 * @param {Object} group to validated selected values against
	 */
	function wholeGroupSelected(group: { [x: string]: any[] }) {
		return group[groupValues as string].every(
			(option: any) => isSelected(option) || isOptionDisabled(option)
		);
	}
	/**
	 * Helper to identify if all values in a group are disabled
	 *
	 * @param {Object} group to check for disabled values
	 */
	function wholeGroupDisabled(group: { [x: string]: any[] }) {
		return group[groupValues as string].every(isOptionDisabled);
	}
	/**
	 * Removes the given option from the selected options.
	 * Additionally checks allowEmpty prop if option can be removed when
	 * it is the last selected option.
	 *
	 * @param  {type} option description
	 * @returns {type}        description
	 */
	function removeElement(option: { [x: string]: any; $isDisabled: any }, shouldClose = true) {
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
			typeof option === 'object'
				? valueKeys?.indexOf(option[trackBy as string])
				: valueKeys?.indexOf(option);

		dispatch('remove', option);
		if (multiple) {
			const newValue = internalValue.slice(0, index).concat(internalValue.slice(index + 1));
			dispatchInput(newValue);
		} else {
			dispatchInput(null);
		}

		/* istanbul ignore else */
		if (closeOnSelect && shouldClose) deactivate();

		//will cause list to rerender so elements wont stay highlited
		setTimeout(() => {
			options = options;
		});
	}

	/**
	 * Calls removeElement() with the last element
	 * from internalValue (selected element Array)
	 *
	 * @fires this#removeElement
	 */
	function removeLastElement() {
		/* istanbul ignore else */
		if (blockKeys.indexOf('Delete') !== -1) return;
		/* istanbul ignore else */
		if (search.length === 0 && Array.isArray(internalValue) && internalValue.length) {
			removeElement(internalValue[internalValue.length - 1], false);
		}
	}

	/**
	 * Opens the multiselect’s dropdown.
	 * Sets isOpen to TRUE
	 */
	function activate() {
		//cancel activation before mount, prevents undfined error
		if (el === undefined || el === null) {
			isOpen = false;
			return;
		}
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
			if (!preserveSearch) search = '';
			if (searchBind) {
				setTimeout(() => searchBind.focus());
			}
		} else {
			el.focus();
		}
		dispatch('open', id);
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
			el?.blur();
		}
		if (!preserveSearch) search = '';
		dispatch('close', getValue());
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
		if (typeof window === 'undefined') return;
		if (!el) return;

		const spaceAbove = el.getBoundingClientRect().top;
		const spaceBelow = window.innerHeight - el.getBoundingClientRect().bottom;
		const hasEnoughSpaceBelow = spaceBelow > maxHeight;

		if (
			hasEnoughSpaceBelow ||
			spaceBelow > spaceAbove ||
			openDirection === 'below' ||
			openDirection === 'bottom'
		) {
			preferredOpenDirection = 'below';
			optimizedHeight = Math.min(spaceBelow - 40, maxHeight);
		} else {
			preferredOpenDirection = 'above';
			optimizedHeight = Math.min(spaceAbove - 40, maxHeight);
		}
	}

	//#endregion

	//#region pointerMixin.js methods

	function optionHighlight(index: number, option: any, point: number) {
		return (
			(index === point && showPointer ? ' multiselect__option--highlight ' : '') +
			(isSelected(option) ? ' multiselect__option--selected ' : '')
		);
	}

	function groupHighlight(index: number, selectedGroup: { $isLabel: any; $groupLabel: any }) {
		if (!groupSelect) {
			return [
				'multiselect__option--disabled ' +
					(selectedGroup.$isLabel ? ' multiselect__option--group ' : '')
			];
		}

		const group = options.find((option) => {
			return option[groupLabel as string] === selectedGroup.$groupLabel;
		});

		return group && !wholeGroupDisabled(group)
			? [
					' multiselect__option--group ',
					{
						' multiselect__option--highlight ': index === pointer && showPointer
					},
					{
						' multiselect__option--group-selected ': wholeGroupSelected(group)
					}
			  ]
			: ' multiselect__option--disabled ';
	}

	function addPointerElement(key = 'Enter') {
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
			let newPointerPosition = pointer * optionHeight;
			/* istanbul ignore next */
			if (listBind.scrollTop <= newPointerPosition - (visibleElements - 1) * optionHeight) {
				listBind.scrollTop = newPointerPosition - (visibleElements - 1) * optionHeight;
			}
			/* istanbul ignore else */
			if (filteredOptions[pointer] && filteredOptions[pointer].$isLabel && !groupSelect)
				pointerForward();
		}
		pointerDirty = true;
	}

	function pointerBackward() {
		if (pointer > 0) {
			pointer--;
			let newPointerPosition = pointer * optionHeight;
			/* istanbul ignore else */
			if (listBind.scrollTop >= newPointerPosition) {
				listBind.scrollTop = newPointerPosition;
			}
			/* istanbul ignore else */
			if (filteredOptions[pointer] && filteredOptions[pointer].$isLabel && !groupSelect)
				pointerBackward();
		} else {
			/* istanbul ignore else */
			if (filteredOptions[pointer] && filteredOptions[0].$isLabel && !groupSelect) pointerForward();
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

		if (filteredOptions.length > 0 && filteredOptions[pointer]?.$isLabel && !groupSelect) {
			pointerForward();
		}
	}

	function pointerSet(index: number) {
		pointer = index;
		pointerDirty = true;
	}
	//#endregion

	//#region multiselectMixin.js mounted
	onMount(() => {
		/* istanbul ignore else */
		if (!multiple && max) {
			console.warn(
				'[Vue-Multiselect warn]: Max prop should not be used when prop Multiple equals false.'
			);
		}
		if (preselectFirst && !internalValue.length && options.length) {
			select(filteredOptions[0]);
		}
	});
	//#endregion

	function handleKeyDown(e: { code: string }) {
		if (e.code == 'ArrowDown') pointerForward();
		if (e.code == 'ArrowUp') pointerBackward();
		if (e.code == 'Delete') removeLastElement();
	}

	function handleKeyPress(e: { code: string; key: string | undefined }) {
		if (e.code == 'Escape') deactivate();
		if (e.key == 'Tab') addPointerElement(e.key);
		if (e.key == 'Enter') addPointerElement(e.key);
	}

	function tagHandleKeyPress(e: { code: string }, option: any) {
		if (e.code == 'Enter') removeElement(option);
	}
</script>

<div
	bind:this={el}
	tabindex={searchable ? -1 : tabindex}
	class:multiselect--active={isOpen}
	class:multiselect--disabled={disabled}
	class:multiselect--above={isAbove}
	class:multiselect-sm={small}
	class:overflow
	on:focus={activate}
	on:blur={() => (searchable ? false : deactivate())}
	on:keydown|preventDefault={handleKeyDown}
	on:keyup|stopPropagation={handleKeyPress}
	class="multiselect {containerClass}"
	role="combobox"
	aria-owns={'listbox-' + id}
>
	<slot name="caret" {toggle}>
		<div on:mousedown|preventDefault|stopPropagation={toggle} class="multiselect__select" />
	</slot>
	<slot name="clear" {search} />
	<div bind:this={tagsBind} class="multiselect__tags">
		<slot name="selection" {search} remove={removeElement} values={visibleValues} is-open={isOpen}>
			{#if visibleValues.length > 0}
				<div class="multiselect__tags-wrap" on:mousedown|preventDefault>
					{#each visibleValues as option, index}
						<slot name="tag" {option} {search} remove={removeElement}>
							<span class="multiselect__tag">
								<span>{getOptionLabel(option)}</span>
								<i
									tabindex="1"
									on:keypress|preventDefault={(e) => tagHandleKeyPress(e, option)}
									on:mousedown|preventDefault={() => removeElement(option)}
									class="multiselect__tag-icon"
								/>
							</span>
						</slot>
					{/each}
				</div>
			{/if}
			{#if internalValue && internalValue.length > limit}
				<slot name="limit">
					<strong class="multiselect__strong">{limitText(internalValue.length - limit)}</strong>
				</slot>
			{/if}
		</slot>
		<div class="multiselect__loading">
			<slot name="loading">
				{#if loading}
					<div class="multiselect__spinner" transition:fade />
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
				on:input={(e) => updateSearch(getEventValue(e))}
				on:focus={activate}
				on:blur={deactivate}
				on:keydown|self|stopPropagation={handleKeyDown}
				on:keyup|stopPropagation={handleKeyPress}
				class="multiselect__input {inputClass}"
				aria-controls={'listbox-' + id}
			/>
			<!-- content here -->
		{/if}
		{#if isSingleLabelVisible}
			<span class="multiselect__single" on:mousedown|preventDefault={toggle}>
				<slot name="singleLabel" option={singleValue}>
					{currentOptionLabel}
				</slot>
			</span>
		{/if}

		{#if isPlaceholderVisible}
			<span class="multiselect__placeholder" on:mousedown|preventDefault={toggle}>
				<slot name="placeholder">
					{placeholder}
				</slot>
			</span>
		{/if}
	</div>

	{#if isOpen}
		<div
			bind:this={listBind}
			class="multiselect__content-wrapper"
			tabindex="-1"
			style:max-height="{optimizedHeight}px"
			style:left="{contentWrapperHorizontalOffset}px"
			transition:fade={{ duration: 75 }}
			on:focus={activate}
		>
			<ul class="multiselect__content" style={contentStyle} role="listbox" id={'listbox-' + id}>
				<slot name="beforeList" />
				{#if multiple && max === internalValue.length}
					<li>
						<span class="multiselect__option">
							<slot name="maxElements"
								>Maximum of {max} options selected. First remove a selected option to select another.</slot
							>
						</span>
					</li>
				{/if}

				{#if !max || internalValue.length < max}
					{#each filteredOptions as option, index}
						<li
							class="multiselect__element"
							id={id + '-' + index}
							role={!(option && (option.$isLabel || option.$isDisabled)) ? 'option' : null}
						>
							{#if !(option && (option.$isLabel || option.$isDisabled))}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<!-- Mouse down is used to prevent bluring before selecting option -->
								<span
									class={optionHighlight(index, option, pointer) + '  multiselect__option '}
									on:click|stopPropagation={() => select(option)}
									on:mouseenter={() => pointerSet(index)}
									data-select={option && option.isTag ? tagPlaceholder : selectLabelText}
									data-selected={selectedLabelText}
									data-deselect={deselectLabelText}
									on:mousedown|preventDefault
								>
									<slot name="option" {option} {search} {index}>
										<span>{getOptionLabel(option)}</span>
									</slot>
								</span>
							{/if}

							{#if option && (option.$isLabel || option.$isDisabled)}
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<span
									data-select={groupSelect && selectGroupLabelText}
									data-deselect={groupSelect && deselectGroupLabelText}
									class={groupHighlight(index, option) + ' multiselect__option'}
									on:mouseenter|self={() => groupSelect && pointerSet(index)}
									on:mousedown|preventDefault={() => selectGroup(option)}
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

<style lang="scss">
	@import './style.scss';
</style>
