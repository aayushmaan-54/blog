import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import getPostPath from '@/utils/content/getPostPath';
import isPostPublished from '@/utils/content/isPostPublished';

const LIMIT = 3;

export const GET: APIRoute = async () => {
  const blogs = await getCollection('blogs');

  const posts = blogs
    .filter(isPostPublished)
    .filter(post => post.data.featured)
    .sort(
      (a, b) =>
        new Date(b.data.pubDatetime).getTime() -
        new Date(a.data.pubDatetime).getTime(),
    )
    .slice(0, LIMIT)
    .map(post => ({
      title: post.data.title,
      slug: getPostPath(
        post.id,
        post.filePath,
        post.collection,
        post.data.slug,
      ).replace(/^\//, ''),
      publishedAt: new Date(post.data.pubDatetime).toISOString(),
    }));

  return new Response(JSON.stringify(posts), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
  });
};
