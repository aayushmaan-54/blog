import type { CollectionEntry } from 'astro:content';
import { SITE } from '@/config/site.config';

const isPostPublished = ({
  data,
}: CollectionEntry<'blogs' | 'short_reads'>) => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;

  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default isPostPublished;
