import satori from 'satori';
import { html } from 'satori-html';
import { type CollectionEntry } from 'astro:content';
import loadGoogleFontGlyphs from '@/utils/text/loadGoogleFontGlyphs';
import { PUBLIC_SITE_URL } from 'astro:env/client';

export default async function generateSvg(
  post: CollectionEntry<'blogs' | 'short_reads'>,
) {
  const rawTitle = post.data.title;
  const title =
    rawTitle.length > 110 ? `${rawTitle.slice(0, 107).trimEnd()}…` : rawTitle;

  const titleFontSize =
    rawTitle.length > 90
      ? 40
      : rawTitle.length > 70
        ? 46
        : rawTitle.length > 50
          ? 54
          : 64;

  const rawDescription =
    post.collection === 'blogs' && 'description' in post.data
      ? post.data.description
      : `${post.data.title} - ${post.data.pubDatetime.toLocaleDateString()}`;

  const description =
    rawDescription.length > 140
      ? `${rawDescription.slice(0, 137).trimEnd()}…`
      : rawDescription;

  const markup = html` <div
    style="display: flex;"
    tw="h-[630px] w-[1200px] bg-[#121212] overflow-hidden"
  >
    <div style="display: flex; gap: 40px;" tw="flex-col px-20 py-18 h-full w-full">
      <div
        style="display: flex;"
        tw="items-baseline text-[26px] font-bold tracking-tight"
      >
        <span tw="text-[#e4e4e4]">AAYUSHMAAN SONI</span>
        <span tw="ml-2 font-normal text-[#a0a0a0]">- blog</span>
      </div>

      <div style="display: flex; gap: 24px;" tw="flex-1 flex-col">
        <h1
          style="display: flex; font-size: ${titleFontSize}px; line-height: 1.1;"
          tw="font-bold text-[#5b9be0]"
        >
          ${title}
        </h1>

        <p style="display: flex;" tw="text-[28px] leading-[1.4] text-[#b8b8b8]">
          ${description}
        </p>
      </div>

      <div style="display: flex;" tw="mt-auto flex-col pt-10">
        <div style="display: flex;" tw="text-[20px] text-[#a0a0a0]">
          ${PUBLIC_SITE_URL}
        </div>
      </div>
    </div>
  </div>`;

  const fonts = await loadGoogleFontGlyphs(
    'AAYUSHMAAN SONI - blog' + title + description + PUBLIC_SITE_URL,
  );

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    embedFont: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fonts: fonts as any,
  });

  return svg;
}
