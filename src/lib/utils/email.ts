const SUPPORT_EMAIL = 'support@rescueos.net';

export const isValidEmail = (value?: string | null) => {
	if (!value) return false;
	return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
};

export const replyToForRescue = (contactEmail?: string | null) => {
	return isValidEmail(contactEmail) ? contactEmail! : SUPPORT_EMAIL;
};

export const canReplyByEmail = (contactEmail?: string | null) => isValidEmail(contactEmail);

export { SUPPORT_EMAIL };
