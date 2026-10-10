import type { CollectionEntry } from 'astro:content';

const getPostPath = (post: CollectionEntry<'blogs'>) =>
  `/blogs/${post.data.slug}`;

export default getPostPath;
