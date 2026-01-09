type StoryInput = {
	name: string;
	species: string;
	breed?: string | null;
	age?: string | null;
	energyLevel?: string | null;
	personalityTraits?: string[];
	goodWith?: string[];
	training?: string | null;
	medicalNeeds?: string | null;
	idealHome?: string | null;
};

const list = (items: string[]) => {
	if (!items.length) return '';
	if (items.length === 1) return items[0];
	const [last, ...rest] = items.reverse();
	return `${rest.reverse().join(', ')} and ${last}`;
};

export const buildPetStory = ({
	name,
	species,
	breed,
	age,
	energyLevel,
	personalityTraits = [],
	goodWith = [],
	training,
	medicalNeeds,
	idealHome
}: StoryInput) => {
	const cleanTraits = personalityTraits.filter(Boolean);
	const cleanGoodWith = goodWith.filter(Boolean);

	const introBits = [
		age ? age.trim() : null,
		breed ? breed.trim() : null,
		species.toLowerCase()
	].filter(Boolean);
	const intro = introBits.length ? introBits.join(' ') : species;

	const lines: string[] = [];
	lines.push(
		`${name} is a ${intro} looking for a calm, loving home. ${energyLevel ? `${name} is ${energyLevel.toLowerCase()}.` : ''}`.trim()
	);

	if (cleanTraits.length) {
		lines.push(`${name} is ${list(cleanTraits.map((t) => t.toLowerCase()))}, making every day feel a little brighter.`);
	}

	if (cleanGoodWith.length || training) {
		const socialBits = [];
		if (cleanGoodWith.length) {
			socialBits.push(`does well with ${list(cleanGoodWith.map((g) => g.toLowerCase()))}`);
		}
		if (training) {
			socialBits.push(training.toLowerCase());
		}
		if (socialBits.length) {
			lines.push(`${name} ${socialBits.join(' and ')}.`);
		}
	}

	if (medicalNeeds) {
		lines.push(`${name} has the following care notes: ${medicalNeeds.trim()}.`);
	}

	if (idealHome) {
		lines.push(`Ideal home: ${idealHome.trim()}.`);
	} else {
		lines.push(`${name} will thrive with someone who offers steady routines, gentle guidance, and plenty of affection.`);
	}

	return lines.filter(Boolean).join('\n\n');
};
