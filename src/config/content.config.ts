import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { SITE } from '@/config/site.config';

export const BLOG_PATH = 'src/content/writing/blogs';
export const SHORT_READS_PATH = 'src/content/writing/short-reads';

const CONTENT_PATTERN = ['**/*.{md,mdx}', '!**/_*', '!**/_*/**'];

const coreSchema = z.object({
  title: z.string(),
  author: z.string().default(SITE.author),
  pubDatetime: z.date(),
  modDatetime: z.date().optional().nullable(),
  draft: z.boolean().default(false),
  slug: z.string().optional(),
  canonicalURL: z.string().optional(),
  timezone: z.string().optional(),
});

const blogs = defineCollection({
  loader: glob({ pattern: CONTENT_PATTERN, base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    coreSchema.extend({
      featured: z.boolean().default(false),
      description: z.string(),
      tags: z.array(z.string()).default(['others']),
      ogImage: image().or(z.string()).optional(),
    }),
});

const short_reads = defineCollection({
  loader: glob({ pattern: CONTENT_PATTERN, base: `./${SHORT_READS_PATH}` }),
  schema: coreSchema,
});

export const collections = { blogs, short_reads };
