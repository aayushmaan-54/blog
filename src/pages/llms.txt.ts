import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '@/config/site.config';
import getSortedPosts from '@/utils/content/getSortedPosts';
import getPostPath from '@/utils/content/getPostPath';
import formatShortDate from '@/utils/date/formatShortDate';

const RECENT_POSTS_LIMIT = 20;

export const GET: APIRoute = async () => {
  const blogs = await getCollection('blogs');
  const shorts = await getCollection('short_reads');
  const allPosts = [...blogs, ...shorts];
  const sortedPosts = getSortedPosts(allPosts).slice(0, RECENT_POSTS_LIMIT);

  const siteUrl = SITE.website;

  const lines: string[] = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description}`,
    '',
    '## Core Links',
    '',
    `- [Archives](${siteUrl}/archives)`,
    `- [Tags](${siteUrl}/tags)`,
    `- [Blogs](${siteUrl}/blogs)`,
    `- [Short Reads](${siteUrl}/short-reads)`,
    `- [Search](${siteUrl}/search)`,
    '',
    '## Recent Posts',
    '',
  ];

  for (const post of sortedPosts) {
    const postPath = getPostPath(
      post.id,
      post.filePath,
      post.collection,
      post.data.slug,
    );
    const postUrl = `${siteUrl}${postPath}`;
    const date = formatShortDate(post.data.pubDatetime);
    const type = post.collection === 'blogs' ? 'Blog' : 'Short Read';

    const description =
      post.collection === 'short_reads'
        ? `Short reads: ${post.data.title} - ${date}`
        : post.data.description;

    lines.push(`- [${type}] [${post.data.title}](${postUrl}): ${description}`);
  }

  lines.push('');
  lines.push('## Meta');
  lines.push('');
  lines.push(`- [Sitemap](${siteUrl}/sitemap-index.xml)`);
  lines.push(`- [RSS Feed](${siteUrl}/rss.xml)`);
  lines.push(
    `- [Full Context Feed](${siteUrl}/llms-full.txt): Use this for full-text ingestion of recent posts.`,
  );
  lines.push('');

  const content = lines.join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
