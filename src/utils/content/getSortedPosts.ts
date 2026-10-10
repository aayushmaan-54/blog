import type { CollectionEntry } from 'astro:content';
import isPostPublished from './isPostPublished';

const getPostTimestampInSeconds = (post: CollectionEntry<'blogs'>) =>
  Math.floor(
    new Date(post.data.modDatetime ?? post.data.pubDatetime).getTime() / 1000,
  );

const getSortedPosts = (posts: CollectionEntry<'blogs'>[]) =>
  posts
    .filter(isPostPublished)
    .sort((a, b) => getPostTimestampInSeconds(b) - getPostTimestampInSeconds(a));

export default getSortedPosts;
