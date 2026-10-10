import type { CollectionEntry } from 'astro:content';
import isPostPublished from './isPostPublished';
import { slugifyStr } from '../text/slugify';

interface Series {
  series: string;
  seriesName: string;
  count: number;
}

export const getUniqueSeries = (
  posts: CollectionEntry<'blogs'>[],
): Series[] => {
  const counts = new Map<string, number>();
  const names = new Map<string, string>();

  posts.filter(isPostPublished).forEach(({ data }) => {
    if (!data.series) return;
    const slug = slugifyStr(data.series);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
    if (!names.has(slug)) names.set(slug, data.series);
  });

  return [...counts.entries()]
    .map(([series, count]) => ({
      series,
      seriesName: names.get(series) as string,
      count,
    }))
    .sort((a, b) => a.series.localeCompare(b.series));
};

// Parts in reading order: by seriesOrder, falling back to publish date.
export const getPostsBySeries = (
  posts: CollectionEntry<'blogs'>[],
  series: string,
) =>
  posts
    .filter(
      post =>
        isPostPublished(post) &&
        post.data.series &&
        slugifyStr(post.data.series) === series,
    )
    .sort(
      (a, b) =>
        (a.data.seriesOrder ?? Infinity) - (b.data.seriesOrder ?? Infinity) ||
        a.data.pubDatetime.getTime() - b.data.pubDatetime.getTime(),
    );
