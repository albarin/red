export const arrayToObject = <T extends { [key: string]: any }>(
	array: T[],
	keyField: keyof T
): { [key: string]: T } => {
	return array.reduce((obj, item) => {
		obj[item[keyField]] = item;
		return obj;
	}, {} as { [key: string]: T });
};
