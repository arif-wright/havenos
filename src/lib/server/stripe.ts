import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

let client: Stripe | null = null;

export const getStripe = () => {
	const secret = env.STRIPE_SECRET_KEY;
	if (!secret) return null;
	if (!client) {
		client = new Stripe(secret, {
			apiVersion: '2023-10-16'
		});
	}
	return client;
};
