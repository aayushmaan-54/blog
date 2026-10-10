import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@/config/site.config';
import getSortedPosts from '@/utils/content/getSortedPosts';
import getPostPath from '@/utils/content/getPostPath';

export async function GET() {
  const posts = await getCollection('blogs');
  const sortedPosts = getSortedPosts(posts);

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: SITE.website,
    items: sortedPosts.map(post => {
      return {
        link: getPostPath(post),
        title: post.data.title,
        description: post.data.description,
        pubDate: new Date(post.data.modDatetime ?? post.data.pubDatetime),
      };
    }),
  });
}
