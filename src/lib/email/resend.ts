import { Resend } from 'resend';
import { APP_BASE_URL, RESEND_API_KEY, RESEND_FROM_EMAIL } from '$env/static/private';
import { buildAdopterInquiryTemplate, buildRescueNotificationTemplate } from './templates';
import { replyToForRescue } from '$lib/utils/email';

export const buildReplyToHeader = (contactEmail?: string | null) => {
	const reply = replyToForRescue(contactEmail);
	// Set both fields to satisfy different Resend SDK/transport expectations.
	return {
		reply_to: reply,
		replyTo: reply
	};
};

type InquiryEmailPayload = {
	inquiryId: string;
	rescueId: string;
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

const appBaseUrl = (APP_BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

type EmailLogInput = {
	to: string;
	subject: string;
	status: 'sent' | 'failed';
	error?: string | null;
	inquiryId?: string | null;
	rescueId: string;
	sendType?: 'system' | 'template' | 'follow_up' | 'invite' | 'other';
	templateId?: string | null;
};

const logEmail = async ({
	to,
	subject,
	status,
	error,
	inquiryId = null,
	rescueId,
	sendType = 'other',
	templateId = null
}: EmailLogInput) => {
	// Lazy import to avoid circular deps
	const { getServiceSupabase } = await import('$lib/server/supabaseService');
	const service = getServiceSupabase();
	const { error: insertError } = await service.from('email_logs').insert({
		to_email: to,
		subject,
		status,
		error_message: error ?? null,
		inquiry_id: inquiryId,
		rescue_id: rescueId,
		send_type: sendType,
		template_id: templateId
	});
	if (insertError) {
		console.error('Failed to log email', insertError);
	}
};

const buildUrls = (animalId: string, inquiryId: string) => {
	return {
		animalUrl: `${appBaseUrl}/animal/${animalId}`,
		dashboardUrl: `${appBaseUrl}/admin/inquiries/${inquiryId}`
	};
};

export const dispatchInquiryEmails = async (payload: InquiryEmailPayload): Promise<DispatchResult> => {
	const errors: string[] = [];

	if (!resendClient || !RESEND_FROM_EMAIL) {
		console.warn('Resend credentials missing, skipping transactional emails');
		return { errors: ['Resend is not configured'], skipped: true };
	}

	const { animalUrl, dashboardUrl } = buildUrls(payload.animalId, payload.inquiryId);
	const replyToHeader = buildReplyToHeader(payload.rescueEmail);
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
			text: adopterTemplate.text,
			...replyToHeader
		});
		adopterEmailId = result.data?.id;
		if (result.error) {
			errors.push(result.error.message);
			console.error('Resend adopter email error', result.error);
			await logEmail({
				to: payload.adopterEmail,
				subject: adopterTemplate.subject,
				status: 'failed',
				error: result.error.message,
				inquiryId: payload.inquiryId,
				rescueId: payload.rescueId,
				sendType: 'system'
			});
		} else {
			await logEmail({
				to: payload.adopterEmail,
				subject: adopterTemplate.subject,
				status: 'sent',
				inquiryId: payload.inquiryId,
				rescueId: payload.rescueId,
				sendType: 'system'
			});
		}
	} catch (error) {
		console.error('Resend adopter email exception', error);
		errors.push('Failed to send adopter confirmation');
		await logEmail({
			to: payload.adopterEmail,
			subject: adopterTemplate.subject,
			status: 'failed',
			error: error instanceof Error ? error.message : 'Unknown adopter send error',
			inquiryId: payload.inquiryId,
			rescueId: payload.rescueId,
			sendType: 'system'
		});
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
				text: rescueTemplate.text,
				...replyToHeader
			});
			rescueEmailId = result.data?.id;
			if (result.error) {
				errors.push(result.error.message);
				console.error('Resend rescue email error', result.error);
				await logEmail({
					to: payload.rescueEmail,
					subject: rescueTemplate.subject,
					status: 'failed',
					error: result.error.message,
					inquiryId: payload.inquiryId,
					rescueId: payload.rescueId,
					sendType: 'system'
				});
			}
			await logEmail({
				to: payload.rescueEmail,
				subject: rescueTemplate.subject,
				status: result.error ? 'failed' : 'sent',
				error: result.error?.message,
				inquiryId: payload.inquiryId,
				rescueId: payload.rescueId,
				sendType: 'system'
			});
		} catch (error) {
			console.error('Resend rescue email exception', error);
			errors.push('Failed to notify rescue');
			await logEmail({
				to: payload.rescueEmail,
				subject: rescueTemplate.subject,
				status: 'failed',
				error: error instanceof Error ? error.message : 'Unknown rescue send error',
				inquiryId: payload.inquiryId,
				rescueId: payload.rescueId,
				sendType: 'system'
			});
		}
	}

	return { adopterEmailId, rescueEmailId, errors, skipped: false };
};

type TemplateSendPayload = {
	rescueId: string;
	inquiryId: string | null;
	to: string;
	subject: string;
	body: string;
	templateId?: string | null;
	sendType?: 'template' | 'follow_up' | 'invite' | 'other';
	rescueEmail?: string | null;
};

export const sendTemplateEmail = async ({
	rescueId,
	inquiryId,
	to,
	subject,
	body,
	templateId = null,
	sendType = 'template',
	rescueEmail = null
}: TemplateSendPayload) => {
	if (!resendClient || !RESEND_FROM_EMAIL) {
		console.warn('Resend credentials missing, skipping transactional emails');
		return { errors: ['Resend is not configured'], skipped: true };
	}

	const errors: string[] = [];
	const replyToHeader = buildReplyToHeader(rescueEmail);

	try {
		const result = await resendClient.emails.send({
			from: RESEND_FROM_EMAIL,
			to,
			subject,
			html: body,
			text: body,
			...replyToHeader
		});
		if (result.error) {
			errors.push(result.error.message);
			console.error('Resend template email error', result.error);
			await logEmail({
				to,
				subject,
				status: 'failed',
				error: result.error.message,
				inquiryId,
				rescueId,
				sendType,
				templateId
			});
		} else {
			await logEmail({
				to,
				subject,
				status: 'sent',
				inquiryId,
				rescueId,
				sendType,
				templateId
			});
		}
	} catch (error) {
		console.error('Resend template email exception', error);
		errors.push('Failed to send email');
		await logEmail({
			to,
			subject,
			status: 'failed',
			error: error instanceof Error ? error.message : 'Unknown send error',
			inquiryId,
			rescueId,
			sendType,
			templateId
		});
	}

	return { errors, skipped: false };
};
