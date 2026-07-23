import { unified } from '@astrojs/markdown-remark';
import { defineConfig, envField, fontProviders } from 'astro/config';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { SITE } from './src/site.config';
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import transformerFileName from './src/plugins/shiki-filename';
import remarkToc from 'remark-toc';
import rehypeExternalLinks from 'rehype-external-links';
import remarkCollapse from 'remark-collapse';
import { loadEnv } from 'vite';
import { remarkDefinitionList } from 'remark-definition-list';

const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV, process.cwd(), '');

export default defineConfig({
  site: PUBLIC_SITE_URL,
  output: 'static',

  integrations: [
    icon(),
    mdx(),
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith('/archives'),
    }),
  ],

  markdown: {
    processor: unified({
      remarkPlugins: [
        [remarkToc, { maxDepth: 3, tight: true }],
        [remarkCollapse, { test: 'Table of contents' }],
        remarkDefinitionList,
      ],
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['noopener', 'noreferrer'],
            content: { type: 'text', value: ' ↗' },
          },
        ],
      ],
      remarkRehype: {
        handlers: (await import('remark-definition-list')).defListHastHandlers,
      },
    }),
    shikiConfig: {
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: 'v3' }),
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
  },

  image: {
    responsiveStyles: true,
    layout: 'constrained',
  },

  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: 'public',
        context: 'client',
        optional: true,
      }),
      DATABUDDY_CLIENT_ID: envField.string({
        access: 'public',
        context: 'client',
        optional: true,
      }),
      PUBLIC_SITE_URL: envField.string({
        access: 'public',
        context: 'client',
      }),
    },
  },

  fonts: [
    {
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      provider: fontProviders.fontsource(),
    },
    {
      name: 'Geist',
      cssVariable: '--font-geist-sans',
      provider: fontProviders.fontsource(),
    },
  ],
});
