import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@/config/site.config';
import getSortedPosts from '@/utils/content/getSortedPosts';
import getPostPath from '@/utils/content/getPostPath';

export async function GET() {
  const posts = await getCollection('blogs');
  const shorts = await getCollection('short_reads');
  const allPosts = [...posts, ...shorts];
  const sortedPosts = getSortedPosts(allPosts);

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: SITE.website,
    items: sortedPosts.map(post => {
      const description =
        post.collection === 'short_reads'
          ? `Short reads: ${post.data.title} - ${post.data.pubDatetime.toLocaleDateString()}`
          : post.data.description;

      return {
        link: getPostPath(
          post.id,
          post.filePath,
          post.collection,
          post.data.slug,
        ),
        title: post.data.title,
        description,
        pubDate: new Date(post.data.modDatetime ?? post.data.pubDatetime),
      };
    }),
  });
}
