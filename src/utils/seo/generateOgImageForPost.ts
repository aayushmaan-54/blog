import { Resvg } from '@resvg/resvg-js';
import { type CollectionEntry } from 'astro:content';
import generateSvg from '@/templates/post-og';

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export default async function generateOgImageForPost(
  post: CollectionEntry<'blogs'>,
) {
  const svg = await generateSvg(post);
  return svgBufferToPngBuffer(svg);
}
