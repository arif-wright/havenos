import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getStripe } from '$lib/server/stripe';
import { APP_BASE_URL, STRIPE_SUPPORT_PRICE_ID } from '$env/static/private';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	sponsor: async ({ request, locals }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim() || null;
		const amount_cents = Number(form.get('amount_cents') ?? '0');

		if (!amount_cents || amount_cents < 200) {
			return fail(400, { serverError: 'Choose an amount (min $2).' });
		}

		const stripe = getStripe();
		if (stripe && STRIPE_SUPPORT_PRICE_ID) {
			try {
				const session = await stripe.checkout.sessions.create({
					mode: 'payment',
					line_items: [{ price: STRIPE_SUPPORT_PRICE_ID, quantity: 1 }],
					success_url: `${APP_BASE_URL ?? 'http://localhost:5173'}/support?success=1`,
					cancel_url: `${APP_BASE_URL ?? 'http://localhost:5173'}/support?canceled=1`,
					customer_email: email ?? undefined,
					metadata: {
						email
					}
				});
				if (session.url) {
					throw redirect(303, session.url);
				}
			} catch (err) {
				console.error('support checkout failed, falling back', err);
			}
		}

		const { error } = await locals.supabase.from('support_payments').insert({
			email,
			amount_cents,
			currency: 'usd'
		});

		if (error) {
			console.error('support insert error', error);
			return fail(500, { serverError: 'Unable to log support payment.' });
		}

		return { success: true };
	}
};
