import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { SITE } from '@/config/site.config';

export const BLOG_PATH = 'src/content/blogs';
const CONTENT_PATTERN = ['**/*.{md,mdx}', '!**/_*', '!**/_*/**'];

const optional = <T extends z.ZodType>(schema: T) =>
  schema.nullish().transform(value => value ?? undefined);

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/;

const blogs = defineCollection({
  loader: glob({
    pattern: CONTENT_PATTERN,
    base: `./${BLOG_PATH}`,
    generateId: ({ entry }) => entry,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      draft: z.boolean().default(false),
      slug: z
        .string()
        .trim()
        .transform(slug => slug.replace(/^\/+|\/+$/g, ''))
        .refine(slug => SLUG_PATTERN.test(slug), {
          message:
            'slug may only use lowercase letters, numbers, "-" and "/" (e.g. k8s-architecture/basics)',
        }),
      canonicalURL: optional(z.string()),
      timezone: optional(z.string()),
      featured: z.boolean().default(false),
      description: z.string(),
      tags: z.array(z.string()).default(['others']),
      ogImage: optional(image().or(z.string())),
      series: optional(z.string()),
      seriesOrder: optional(z.number().int().positive()),
    }),
});

export const collections = { blogs };
