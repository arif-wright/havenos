import { randomUUID } from 'crypto';
import { SUPABASE_STORAGE_BUCKET } from '$env/static/private';
import { getServiceSupabase } from './supabaseService';

type UploadParams = {
	animalId: string;
	file: File;
};

const getBucket = () => {
	if (!SUPABASE_STORAGE_BUCKET) {
		throw new Error('Missing SUPABASE_STORAGE_BUCKET');
	}
	return SUPABASE_STORAGE_BUCKET;
};

export const uploadAnimalPhoto = async ({ animalId, file }: UploadParams) => {
	const supabase = getServiceSupabase();
	const bucket = getBucket();
	const arrayBuffer = await file.arrayBuffer();
	const path = `${animalId}/${randomUUID()}-${file.name}`;

	const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
		contentType: file.type || 'application/octet-stream',
		cacheControl: '3600',
		upsert: false
	});

	if (error) {
		console.error('Upload error', error);
		throw error;
	}

	const { data } = supabase.storage.from(bucket).getPublicUrl(path);

	return {
		path,
		publicUrl: data.publicUrl
	};
};

export const removeAnimalPhoto = async (path: string) => {
	const supabase = getServiceSupabase();
	const bucket = getBucket();
	const { error } = await supabase.storage.from(bucket).remove([path]);
	if (error) {
		console.error('Remove photo error', error);
		throw error;
	}
};

export const extractStoragePath = (url: string) => {
	const bucket = getBucket();
	const marker = `/object/public/${bucket}/`;
	const index = url.indexOf(marker);
	if (index === -1) return null;
	return url.slice(index + marker.length);
};
