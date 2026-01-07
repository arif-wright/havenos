import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getServiceSupabase } from '$lib/server/supabaseService';
import { getStripe } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ request }) => {
	const stripe = getStripe();
	const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
	if (!stripe || !webhookSecret) {
		return new Response('Webhook not configured', { status: 500 });
	}

	const signature = request.headers.get('stripe-signature');
	const rawBody = await request.text();

	let event: any;
	try {
		event = stripe.webhooks.constructEvent(rawBody, signature as string, webhookSecret);
	} catch (err) {
		console.error('Stripe webhook signature verification failed', err);
		return new Response('Signature verification failed', { status: 400 });
	}

	const eventType = event?.type;
	const object = event?.data?.object ?? {};
	const metadata = object?.metadata ?? {};
	const rescueId: string | undefined = metadata.rescue_id || metadata.rescueId;

	if (!rescueId) {
		console.warn('Stripe webhook: missing rescue_id metadata');
		return json({ received: true });
	}

	const service = getServiceSupabase();

	if (eventType === 'checkout.session.completed') {
		const plan = (metadata.plan_tier as string | undefined)?.toLowerCase() || 'pro';
		const stripe_customer_id = object.customer as string | null;
		const stripe_subscription_id = object.subscription as string | null;

		const { error } = await service
			.from('rescues')
			.update({
				plan_tier: plan === 'supporter' ? 'supporter' : 'pro',
				stripe_customer_id,
				stripe_subscription_id,
				subscription_status: stripe_subscription_id ? 'active' : null
			})
			.eq('id', rescueId);
		if (error) {
			console.error('Stripe webhook: checkout update error', error);
		}
	}

	if (eventType === 'customer.subscription.updated' || eventType === 'customer.subscription.created') {
		const status = object.status as string | null;
		const current_period_end = object.current_period_end
			? new Date(object.current_period_end * 1000).toISOString()
			: null;
		const plan = object.items?.data?.[0]?.price?.nickname?.toLowerCase() ?? 'pro';
		const stripe_subscription_id = object.id as string | null;
		const stripe_customer_id = object.customer as string | null;

		const { error } = await service
			.from('rescues')
			.update({
				plan_tier: plan.includes('support') ? 'supporter' : 'pro',
				subscription_status: status,
				current_period_end,
				stripe_subscription_id,
				stripe_customer_id
			})
			.eq('id', rescueId);
		if (error) {
			console.error('Stripe webhook: subscription update error', error);
		}
	}

	if (eventType === 'customer.subscription.deleted') {
		const { error } = await service
			.from('rescues')
			.update({
				plan_tier: 'free',
				subscription_status: 'canceled',
				current_period_end: new Date().toISOString()
			})
			.eq('id', rescueId);
		if (error) {
			console.error('Stripe webhook: subscription delete error', error);
		}
	}

	return json({ received: true });
};
