import type { ShikiTransformer } from 'shiki';

const UNLABELED_LANGS = new Set(['', 'text', 'txt', 'plaintext', 'ansi']);

const transformerFileName = (): ShikiTransformer => ({
  name: 'shiki-transformer-filename',
  pre(node) {
    const raw = this.options.meta?.__raw?.split(' ') ?? [];

    const metaMap = new Map<string, string>();
    for (const item of raw) {
      const [key, value] = item.split('=');
      if (!key || !value) continue;
      metaMap.set(key, value.replace(/["'`]/g, ''));
    }

    const lang = this.options.lang?.toLowerCase() ?? '';
    const label =
      metaMap.get('file') ?? (UNLABELED_LANGS.has(lang) ? undefined : lang);
    if (!label) return;

    this.addClassToHast(
      node,
      'mt-10 relative border border-border rounded-md rounded-tl-none shadow-sm',
    );

    node.children.push({
      type: 'element',
      tagName: 'span',
      properties: {
        class: [
          'absolute -top-[28px] left-0',
          'px-4 py-1 z-10 rounded-t-md border border-b-0 border-border',
          'text-[11px] font-mono tracking-tight',
          'text-[var(--shiki-light)] bg-[var(--shiki-light-bg)]',
          'dark:text-[var(--shiki-dark)] dark:bg-[var(--shiki-dark-bg)]',
        ].join(' '),
      },
      children: [{ type: 'text', value: label }],
    });
  },
});

export default transformerFileName;
