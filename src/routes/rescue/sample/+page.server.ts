import type { PageServerLoad } from './$types';

const sampleRescue = {
	id: 'sample-rescue',
	name: 'Sample Rescue',
	slug: 'sample',
	tagline: 'Demo rescue showcasing the public page.',
	location_text: 'Portland, OR',
	mission_statement:
		'We’re a small foster-based rescue focused on thoughtful matchmaking and clear communication.',
	adoption_process: 'We follow up within 48 hours. Expect a call and a meet & greet before adoption.',
	response_time_enum: '24_48',
	response_time_text: '24–48 hours',
	adoption_steps: ['Submit inquiry', 'Phone/Zoom chat', 'Meet & greet', 'Home check', 'Adopt'],
	website_url: 'https://rescueos.com',
	facebook_url: 'https://facebook.com',
	instagram_url: 'https://instagram.com',
	donation_url: 'https://donate.rescueos.com',
	logo_url: 'https://images.unsplash.com/photo-1504203700686-0f3b3a5d5f2a?auto=format&fit=crop&w=300&q=80',
	cover_url:
		'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1600&q=80',
	is_public: true
};

const sampleAnimals = [
	{
		id: 'demo-cat-1',
		name: 'Marble',
		species: 'Cat',
		status: 'available',
		description: 'Gentle tabby who loves windowsills and naps.',
		tags: ['House-trained', 'Indoor only'],
		animal_photos: [
			{
				image_url:
					'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80'
			}
		]
	},
	{
		id: 'demo-dog-1',
		name: 'Scout',
		species: 'Dog',
		status: 'hold',
		description: 'Active pup who loves hikes and treats.',
		tags: ['Vaccinated', 'Medium energy'],
		animal_photos: [
			{
				image_url:
					'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80'
			}
		]
	},
	{
		id: 'demo-cat-2',
		name: 'Juniper',
		species: 'Cat',
		status: 'available',
		description: 'Curious and chatty, great with people.',
		tags: ['Good with kids'],
		animal_photos: [
			{
				image_url:
					'https://images.unsplash.com/photo-1504203700686-0f3b3a5d5f2a?auto=format&fit=crop&w=900&q=80'
			}
		]
	},
	{
		id: 'demo-dog-2',
		name: 'River',
		species: 'Dog',
		status: 'available',
		description: 'Calm companion who enjoys lounging and short walks.',
		tags: ['Low energy'],
		animal_photos: [
			{
				image_url:
					'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'
			}
		]
	},
	{
		id: 'demo-rabbit-1',
		name: 'Poppy',
		species: 'Rabbit',
		status: 'available',
		description: 'Sweet lop-eared rabbit looking for a cozy home.',
		tags: ['Litter trained'],
		animal_photos: [
			{
				image_url:
					'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80'
			}
		]
	},
	{
		id: 'demo-dog-3',
		name: 'Luna',
		species: 'Dog',
		status: 'adopted',
		description: 'Recently adopted—showing adopted state.',
		tags: ['Success story'],
		animal_photos: [
			{
				image_url:
					'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80'
			}
		]
	}
];

export const load: PageServerLoad = async ({ url }) => {
	const speciesOptions = Array.from(new Set(sampleAnimals.map((a) => a.species))).sort((a, b) =>
		a.localeCompare(b)
	);
	const statusOptions = Array.from(new Set(sampleAnimals.map((a) => a.status))).sort((a, b) =>
		a.localeCompare(b)
	);

	const filters = {
		species: url.searchParams.get('species') || undefined,
		status: (url.searchParams.get('status') as string | undefined) || undefined
	};

	const animalsFiltered = sampleAnimals.filter((a) => {
		if (filters.species && a.species.toLowerCase() !== filters.species.toLowerCase()) return false;
		if (filters.status && a.status !== filters.status) return false;
		return true;
	});

	return {
		rescue: sampleRescue,
		animals: animalsFiltered,
		filters,
		searchParams: Object.fromEntries(url.searchParams.entries()),
		speciesOptions,
		statusOptions
	};
};
