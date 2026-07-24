import type { CollectionEntry } from 'astro:content';
import isPostPublished from './isPostPublished';

const getPostTimestampInSeconds = (
  post: CollectionEntry<'blogs' | 'short_reads'>,
) =>
  Math.floor(
    new Date(post.data.modDatetime ?? post.data.pubDatetime).getTime() / 1000,
  );

const collectionOrder: Record<
  CollectionEntry<'blogs' | 'short_reads'>['collection'],
  number
> = {
  blogs: 0,
  short_reads: 1,
};

const getSortedPosts = <
  T extends CollectionEntry<'blogs' | 'short_reads'>,
>(
  posts: T[],
): T[] => {
  return posts.filter(isPostPublished).sort((a, b) => {
    const orderDiff =
      collectionOrder[a.collection] - collectionOrder[b.collection];
    if (orderDiff !== 0) return orderDiff;
    return getPostTimestampInSeconds(b) - getPostTimestampInSeconds(a);
  });
};

export default getSortedPosts;
