import { z } from 'zod';

export const publicInquirySchema = z.object({
	animalId: z.string().uuid(),
	adopterName: z.string().min(2, 'Name is required'),
	adopterEmail: z.string().email('Valid email required'),
	message: z
		.string()
		.max(4000)
		.optional()
		.transform((value) => value?.trim() || '')
});

export const inquiryStatusSchema = z.object({
	inquiryId: z.string().uuid(),
	status: z.enum(['new', 'contacted', 'meet_greet', 'application', 'approved', 'adopted', 'closed'])
});

export const inquiryNoteSchema = z.object({
	inquiryId: z.string().uuid(),
	body: z.string().min(1, 'Note cannot be empty').max(4000, 'Note too long')
});
