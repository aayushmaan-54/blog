import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import isPostPublished from '@/utils/content/isPostPublished';
import generateOgImageForPost from '@/utils/seo/generateOgImageForPost';

export async function getStaticPaths() {
  const blogs = await getCollection('blogs').then(blog =>
    blog.filter(post => isPostPublished(post) && !post.data.ogImage),
  );

  return blogs.map(blog => ({
    params: { slug: blog.data.slug },
    props: { blog },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const buffer = await generateOgImageForPost(
    props.blog as CollectionEntry<'blogs'>,
  );
  return new Response(new Uint8Array(buffer), {
    headers: { 'Content-Type': 'image/png' },
  });
};
