import type { CollectionEntry } from 'astro:content';
import { SITE } from '@/config/site.config';

const isPostPublished = ({ data }: CollectionEntry<'blogs'>) => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;

  // Dev previews everything, drafts and scheduled posts included.
  if (import.meta.env.DEV) return true;
  return !data.draft && isPublishTimePassed;
};

export default isPostPublished;
