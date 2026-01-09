import assert from 'node:assert';
import { buildReplyToHeader } from './resend';
import { SUPPORT_EMAIL } from '$lib/utils/email';

const headerWithContact = buildReplyToHeader('team@example.com');
assert.strictEqual(headerWithContact.reply_to, 'team@example.com', 'Reply-To should use rescue contact email');

const headerWithFallback = buildReplyToHeader('');
assert.strictEqual(headerWithFallback.reply_to, SUPPORT_EMAIL, 'Reply-To should fall back to support when missing');

console.log('Reply-To header tests passed');
