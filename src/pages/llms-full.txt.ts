import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '@/config/site.config';
import getSortedPosts from '@/utils/content/getSortedPosts';
import getPostPath from '@/utils/content/getPostPath';
import cleanMdxContent from '@/utils/text/cleanMdxContent';
import truncateContent from '@/utils/text/truncateContent';
import formatShortDate from '@/utils/date/formatShortDate';

const FULL_POSTS_LIMIT = 15;
const MAX_WORDS_PER_POST = 3000;

export const GET: APIRoute = async () => {
  const blogs = await getCollection('blogs');
  const shorts = await getCollection('short_reads');
  const allPosts = [...blogs, ...shorts];
  const sortedPosts = getSortedPosts(allPosts).slice(0, FULL_POSTS_LIMIT);

  const siteUrl = SITE.website;

  const sections: string[] = [
    `# ${SITE.title} - Full Content Feed`,
    '',
    `> This file contains the full text of recent posts for AI/LLM ingestion.`,
    `> Generated: ${new Date().toISOString()}`,
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

    const rawContent = post.body || '';
    const cleanedContent = cleanMdxContent(rawContent);
    const content = truncateContent(
      cleanedContent,
      MAX_WORDS_PER_POST,
      postUrl,
    );

    const type = post.collection === 'blogs' ? 'Blog' : 'Short Read';
    const postLines: string[] = [
      '---',
      '',
      `# ${post.data.title}`,
      '',
      `> Type: ${type}`,
      `> URL: ${postUrl}`,
      `> Published: ${formatShortDate(post.data.pubDatetime)}`,
      `> Author: ${post.data.author}`,
    ];

    if (post.collection === 'blogs' && post.data.tags) {
      postLines.push(`> Tags: ${post.data.tags.join(', ')}`);
    }

    postLines.push('');
    postLines.push(content);
    postLines.push('');

    sections.push(postLines.join('\n'));
  }

  const output = sections.join('\n');

  return new Response(output, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
