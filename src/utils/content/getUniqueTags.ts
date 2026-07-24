import type { CollectionEntry } from 'astro:content';
import isPostPublished from './isPostPublished';
import { slugifyStr } from '../text/slugify';

interface Tag {
  tag: string;
  tagName: string;
  count: number;
}

const getUniqueTags = (posts: CollectionEntry<'blogs'>[]): Tag[] => {
  const counts = new Map<string, number>();
  const names = new Map<string, string>();

  posts
    .filter(isPostPublished)
    .flatMap(post => post.data.tags)
    .forEach(rawTag => {
      const slug = slugifyStr(rawTag);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
      if (!names.has(slug)) names.set(slug, rawTag);
    });

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, tagName: names.get(tag) as string, count }))
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
};

export default getUniqueTags;
