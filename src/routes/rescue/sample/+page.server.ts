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
	logo_url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=300&q=80',
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
					'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80'
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
					'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80'
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
					'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
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
					'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=80'
			}
		]
	},
	{
		id: 'demo-cat-3',
		name: 'Olive',
		species: 'Cat',
		status: 'available',
		description: 'Playful tuxedo cat who loves wand toys.',
		tags: ['Indoor only'],
		animal_photos: [
			{
				image_url:
					'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80'
			}
		]
	},
	{
		id: 'demo-dog-4',
		name: 'Bailey',
		species: 'Dog',
		status: 'available',
		description: 'Gentle senior pup looking for a calm home.',
		tags: ['Low energy', 'Senior'],
		animal_photos: [
			{
				image_url:
					'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=900&q=80'
			}
		]
	},
	{
		id: 'demo-rabbit-2',
		name: 'Hazel',
		species: 'Rabbit',
		status: 'available',
		description: 'Soft, curious rabbit who enjoys gentle pets.',
		tags: ['Bonded friendly'],
		animal_photos: [
			{
				image_url:
					'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
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
	const pageSize = 9;
	const pageParam = parseInt(url.searchParams.get('page') || '1', 10);
	const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

	const animalsFiltered = sampleAnimals.filter((a) => {
		if (filters.species && a.species.toLowerCase() !== filters.species.toLowerCase()) return false;
		if (filters.status && a.status !== filters.status) return false;
		return true;
	});
	const total = animalsFiltered.length;
	const start = (page - 1) * pageSize;
	const animalsPaged = animalsFiltered.slice(start, start + pageSize);

	return {
		rescue: sampleRescue,
		animals: animalsPaged,
		total,
		page,
		pageSize,
		filters,
		searchParams: Object.fromEntries(url.searchParams.entries()),
		speciesOptions,
		statusOptions
	};
};
