import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getStripe } from '$lib/server/stripe';
import { APP_BASE_URL, STRIPE_PRICE_PRO_ID } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	const role = locals.currentMemberRole ?? 'staff';
	if (!rescue) {
		throw redirect(303, '/onboarding');
	}
	if (role !== 'owner') {
		throw redirect(303, '/admin');
	}

	return {
		rescue: {
			plan_tier: rescue.plan_tier,
			subscription_status: rescue.subscription_status,
			current_period_end: rescue.current_period_end
		}
	};
};

export const actions: Actions = {
	upgrade: async ({ locals }) => {
		const rescue = locals.currentRescue;
		const role = locals.currentMemberRole ?? 'staff';
		if (!rescue || role !== 'owner') return fail(403, { serverError: 'Not authorized' });

		const stripe = getStripe();
		if (stripe && STRIPE_PRICE_PRO_ID) {
			try {
				const session = await stripe.checkout.sessions.create({
					mode: 'subscription',
					line_items: [{ price: STRIPE_PRICE_PRO_ID, quantity: 1 }],
					success_url: `${APP_BASE_URL ?? 'http://localhost:5173'}/admin/settings/billing?success=1`,
					cancel_url: `${APP_BASE_URL ?? 'http://localhost:5173'}/admin/settings/billing?canceled=1`,
					customer_email: rescue.contact_email,
					metadata: {
						rescue_id: rescue.id,
						plan_tier: 'pro'
					}
				});
				if (session.url) {
					throw redirect(303, session.url);
				}
			} catch (err) {
				console.error('stripe checkout create failed, falling back', err);
			}
		}

		const nextEnd = new Date();
		nextEnd.setDate(nextEnd.getDate() + 30);
		const { error } = await locals.supabase
			.from('rescues')
			.update({
				plan_tier: 'pro',
				subscription_status: 'active',
				current_period_end: nextEnd.toISOString()
			})
			.eq('id', rescue.id);
		if (error) {
			console.error('upgrade error', error);
			return fail(500, { serverError: 'Unable to upgrade right now.' });
		}
		return { success: true };
	},
	downgrade: async ({ locals }) => {
		const rescue = locals.currentRescue;
		const role = locals.currentMemberRole ?? 'staff';
		if (!rescue || role !== 'owner') return fail(403, { serverError: 'Not authorized' });

		const { error } = await locals.supabase
			.from('rescues')
			.update({
				plan_tier: 'free',
				subscription_status: null,
				stripe_subscription_id: null,
				current_period_end: null
			})
			.eq('id', rescue.id);

		if (error) {
			console.error('downgrade error', error);
			return fail(500, { serverError: 'Unable to downgrade' });
		}
		return { success: true };
	}
};
