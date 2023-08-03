//#region multiselectMixin.js helper functions
export function isEmpty(opt: any) {
	if (opt === 0) return false;
	if (Array.isArray(opt) && opt.length === 0) return true;
	return !opt;
}

export function not(fun: (...params: any[]) => any) {
	return (...params: any[]) => !fun(...params);
}
