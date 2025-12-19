export const parseTagList = (value: FormDataEntryValue | null): string[] => {
	if (typeof value !== 'string') return [];
	return value
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean);
};

export const parseBoolean = (value: FormDataEntryValue | null, fallback = false): boolean => {
	if (typeof value === 'string') {
		return ['true', '1', 'on', 'yes'].includes(value.toLowerCase());
	}
	return fallback;
};
