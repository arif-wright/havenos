import { Resend } from 'resend';
import { APP_BASE_URL, RESEND_API_KEY, RESEND_FROM_EMAIL } from '$env/static/private';
import { buildAdopterInquiryTemplate, buildRescueNotificationTemplate } from './templates';

type InquiryEmailPayload = {
	inquiryId: string;
	animalId: string;
	animalName: string;
	rescueName: string;
	rescueEmail: string;
	adopterName: string;
	adopterEmail: string;
	message: string;
};

type DispatchResult = {
	adopterEmailId?: string;
	rescueEmailId?: string;
	errors: string[];
	skipped: boolean;
};

const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const buildUrls = (animalId: string, inquiryId: string) => {
	const base = APP_BASE_URL?.replace(/\/$/, '') || '';
	return {
		animalUrl: `${base}/animal/${animalId}`,
		dashboardUrl: `${base}/admin/inquiries/${inquiryId}`
	};
};

export const dispatchInquiryEmails = async (payload: InquiryEmailPayload): Promise<DispatchResult> => {
	const errors: string[] = [];

	if (!resendClient || !RESEND_FROM_EMAIL) {
		console.warn('Resend credentials missing, skipping transactional emails');
		return { errors: ['Resend is not configured'], skipped: true };
	}

	const { animalUrl, dashboardUrl } = buildUrls(payload.animalId, payload.inquiryId);
	const adopterTemplate = buildAdopterInquiryTemplate({
		animalName: payload.animalName,
		rescueName: payload.rescueName,
		adopterName: payload.adopterName,
		adopterEmail: payload.adopterEmail,
		message: payload.message,
		animalUrl,
		dashboardUrl
	});

	const rescueTemplate = buildRescueNotificationTemplate({
		animalName: payload.animalName,
		rescueName: payload.rescueName,
		adopterName: payload.adopterName,
		adopterEmail: payload.adopterEmail,
		message: payload.message,
		animalUrl,
		dashboardUrl
	});

	let adopterEmailId: string | undefined;
	let rescueEmailId: string | undefined;

	try {
		const result = await resendClient.emails.send({
			from: RESEND_FROM_EMAIL,
			to: payload.adopterEmail,
			subject: adopterTemplate.subject,
			html: adopterTemplate.html,
			text: adopterTemplate.text
		});
		adopterEmailId = result.data?.id;
		if (result.error) {
			errors.push(result.error.message);
			console.error('Resend adopter email error', result.error);
		}
	} catch (error) {
		console.error('Resend adopter email exception', error);
		errors.push('Failed to send adopter confirmation');
	}

	if (!payload.rescueEmail) {
		errors.push('Rescue contact email missing');
	} else {
		try {
			const result = await resendClient.emails.send({
				from: RESEND_FROM_EMAIL,
				to: payload.rescueEmail,
				subject: rescueTemplate.subject,
				html: rescueTemplate.html,
				text: rescueTemplate.text
			});
			rescueEmailId = result.data?.id;
			if (result.error) {
				errors.push(result.error.message);
				console.error('Resend rescue email error', result.error);
			}
		} catch (error) {
			console.error('Resend rescue email exception', error);
			errors.push('Failed to notify rescue');
		}
	}

	return { adopterEmailId, rescueEmailId, errors, skipped: false };
};
