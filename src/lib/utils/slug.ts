const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/--+/g, '-')
		.trim();

export const buildSlug = (value: string) => {
	const cleaned = slugify(value);
	return cleaned.length ? cleaned : 'rescue';
};
