import { z } from 'zod';

export const invitationSchema = z.object({
	email: z.string().email('Valid email required'),
	role: z.enum(['owner', 'admin', 'staff'])
});

export const templateSchema = z.object({
	name: z.string().min(2, 'Name required').max(100),
	subject: z.string().min(2, 'Subject required').max(200),
	body: z.string().min(2, 'Body required')
});
