import { ADMIN_EMAILS } from '$env/static/private';

export const isAdminEmail = (email: string | null | undefined): boolean => {
	if (!email) return false;
	const list = (ADMIN_EMAILS ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	return list.includes(email.toLowerCase());
};
