import { z } from 'zod';

export const animalFormSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().min(2, 'Name is required'),
	species: z.string().min(2, 'Species is required'),
	breed: z
		.string()
		.max(120)
		.optional()
		.transform((value) => value?.trim() || null),
	age: z
		.string()
		.max(60)
		.optional()
		.transform((value) => value?.trim() || null),
	sex: z
		.string()
		.max(16)
		.optional()
		.transform((value) => value?.trim() || null),
	description: z
		.string()
		.max(5000)
		.optional()
		.transform((value) => value?.trim() || null),
	status: z.enum(['available', 'hold', 'adopted']),
	tags: z.array(z.string().min(1)).optional().default([]),
	is_active: z.boolean().default(true)
});

export const photoReorderSchema = z.object({
	animalId: z.string().uuid(),
	photoOrder: z.array(z.object({ id: z.string().uuid(), sort_order: z.number() }))
});

export const photoUploadSchema = z.object({
	animalId: z.string().uuid(),
	file: z.instanceof(File)
});
