import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

let client: Stripe | null = null;

export const getStripe = () => {
	if (!STRIPE_SECRET_KEY) return null;
	if (!client) {
		client = new Stripe(STRIPE_SECRET_KEY, {
			apiVersion: '2023-10-16'
		});
	}
	return client;
};
