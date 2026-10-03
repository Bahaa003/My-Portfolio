import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../config/site';
import { getPublicWriteups, getPublicBlogPosts, entrySlug } from '../lib/collections';

export async function GET(context: APIContext) {
  const [writeups, posts] = await Promise.all([getPublicWriteups(), getPublicBlogPosts()]);

  const items = [
    ...writeups.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/writeups/${entrySlug(entry)}`,
      categories: entry.data.tags,
    })),
    ...posts.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/blog/${entrySlug(entry)}`,
      categories: entry.data.tags,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
  });
}
