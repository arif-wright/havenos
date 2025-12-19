type InquiryTemplateInput = {
	animalName: string;
	rescueName: string;
	adopterName: string;
	adopterEmail: string;
	message: string;
	animalUrl: string;
	dashboardUrl: string;
};

const baseStyles = `
	font-family: Arial, Helvetica, sans-serif;
	line-height: 1.5;
	color: #111827;
`;

const buttonStyles = `
	display: inline-block;
	padding: 10px 18px;
	background-color: #0f766e;
	color: #fff;
	text-decoration: none;
	border-radius: 6px;
	font-weight: 600;
`;

export const buildAdopterInquiryTemplate = (input: InquiryTemplateInput) => {
	const subject = `We received your inquiry for ${input.animalName}`;
	const html = `
		<div style="${baseStyles}">
			<p>Hi ${input.adopterName || 'there'},</p>
			<p>${input.rescueName} received your inquiry for <strong>${input.animalName}</strong>. A rescue admin will reach out soon.</p>
			<p style="white-space:pre-wrap">${input.message || ''}</p>
			<p>
				<a href="${input.animalUrl}" style="${buttonStyles}" target="_blank" rel="noreferrer">View ${input.animalName}</a>
			</p>
			<p>Thank you for adopting!</p>
			<p>- HavenOS</p>
		</div>
	`;

	const text = `Hi ${input.adopterName || 'there'},

${input.rescueName} received your inquiry for ${input.animalName}. A rescue admin will reach out soon.

${input.message || ''}

View the listing: ${input.animalUrl}

Thank you for adopting!
- HavenOS
`;

	return { subject, html, text };
};

export const buildRescueNotificationTemplate = (input: InquiryTemplateInput) => {
	const subject = `${input.adopterName} applied for ${input.animalName}`;
	const html = `
		<div style="${baseStyles}">
			<p>Hello ${input.rescueName} team,</p>
			<p><strong>${input.adopterName}</strong> (${input.adopterEmail}) inquired about ${input.animalName}.</p>
			<p style="white-space:pre-wrap">${input.message || ''}</p>
			<p>
				<a href="${input.dashboardUrl}" style="${buttonStyles}" target="_blank" rel="noreferrer">Open inquiry in HavenOS</a>
			</p>
			<p>
				Need the public listing? <a href="${input.animalUrl}">${input.animalUrl}</a>
			</p>
		</div>
	`;

	const text = `Hello ${input.rescueName} team,

${input.adopterName} (${input.adopterEmail}) inquired about ${input.animalName}.

${input.message || ''}

Dashboard: ${input.dashboardUrl}
Listing: ${input.animalUrl}
`;

	return { subject, html, text };
};
