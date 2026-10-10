import type { CollectionEntry } from 'astro:content';

// Fail the build instead of letting one post silently replace another.
const assertUniqueSlugs = (posts: CollectionEntry<'blogs'>[]) => {
  const seen = new Map<string, string | undefined>();

  for (const post of posts) {
    const { slug } = post.data;
    const existing = seen.get(slug);
    if (seen.has(slug)) {
      throw new Error(
        `Duplicate slug "${slug}" in ${existing} and ${post.filePath}. Every post needs a unique slug.`,
      );
    }
    seen.set(slug, post.filePath);
  }
};

export default assertUniqueSlugs;
