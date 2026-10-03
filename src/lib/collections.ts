import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Every public listing page and the RSS feed must go through these helpers.
 * This is the single place that excludes drafts and private/confidential
 * content, so a listing can never accidentally leak something that
 * shouldn't be public — even in dev mode, where Astro renders drafts.
 */

function isPubliclyVisible(data: { draft?: boolean; confidentiality?: string }): boolean {
  if (data.draft) return false;
  if (data.confidentiality === 'private') return false;
  return true;
}

export async function getPublicWriteups(): Promise<CollectionEntry<'writeups'>[]> {
  const entries = await getCollection('writeups', ({ data }) => isPubliclyVisible(data));
  return entries.sort((a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0));
}

export async function getPublicProjects(): Promise<CollectionEntry<'projects'>[]> {
  const entries = await getCollection('projects', ({ data }) => isPubliclyVisible(data));
  return entries.sort((a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0));
}

export async function getPublicLabs(): Promise<CollectionEntry<'labs'>[]> {
  const entries = await getCollection('labs', ({ data }) => isPubliclyVisible(data));
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPublicBlogPosts(): Promise<CollectionEntry<'blog'>[]> {
  const entries = await getCollection('blog', ({ data }) => isPubliclyVisible(data));
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Resolve the URL-facing slug for an entry: explicit `slug` frontmatter field wins, falls back to the file id. */
export function entrySlug(entry: { id: string; data: { slug?: string } }): string {
  return entry.data.slug && entry.data.slug.length > 0 ? entry.data.slug : entry.id;
}
