//#region multiselectMixin.js helper functions
export function isEmpty(opt: any) {
	if (opt === 0) return false;
	if (Array.isArray(opt) && opt.length === 0) return true;
	return !opt;
}

export function not(fun: (...params: any[]) => any) {
	return (...params: any[]) => !fun(...params);
}

export function includes(str: string | boolean | null | undefined, query: string) {
	/* istanbul ignore else */
	if (str === undefined) str = 'undefined';
	if (str === null) str = 'null';
	if (str === false) str = 'false';
	const text = str.toString().toLowerCase();
	return text.indexOf(query.trim()) !== -1;
}

export function filterOptions(
	options: any[],
	search: string,
	label: string | null,
	_customLabel: { (option: any, label: string): any; (arg0: any, arg1: any): any }
) {
	return options.filter((option: any) => includes(_customLabel(option, label), search));
}

export function stripGroups(options: any[]) {
	return options.filter((option: { $isLabel: any }) => !option.$isLabel);
}

export function flattenOptions(values: string | null, label: string | number | null) {
	return (options: any[]) =>
		options.reduce(
			(prev: { $groupLabel: any; $isLabel: boolean }[], curr: { [x: string]: any }) => {
				/* istanbul ignore else */
				if (curr[values as string] && curr[values as string].length) {
					prev.push({
						$groupLabel: curr[label as string],
						$isLabel: true
					});
					return prev.concat(curr[values as string]);
				}
				return prev;
			},
			[]
		);
}

export function filterGroups(
	search: any,
	label: any,
	values: string | number | null,
	groupLabel: string | number | null,
	_customLabel: (option: any, label: string) => any
) {
	return (groups: any[]) =>
		groups.map((group: { [x: string]: any }) => {
			/* istanbul ignore else */
			if (!group[values as string]) {
				console.warn(
					`Options passed to vue-multiselect do not contain groups, despite the config.`
				);
				return [];
			}
			const groupOptions = filterOptions(group[values as string], search, label, _customLabel);

			return groupOptions.length
				? {
						[groupLabel as string]: group[groupLabel as string],
						[values as string]: groupOptions
				  }
				: [];
		});
}

export const flow = (
	...fns: {
		(groups: any): any;
		(options: any): any;
		(options: any): any;
		(options: any): any;
	}[]
) => {
	return (x: any) => fns.reduce((v, f) => f(v), x);
}; //#endregion

export function getEventValue(event: any): string {
	return event.target.value;
}
