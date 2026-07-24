import { BLOG_PATH, SHORT_READS_PATH } from '@/config/content.config';
import { slugifyStr } from '@/utils/text/slugify';

function getPostPath(
  id: string,
  filePath: string | undefined,
  collection: 'blogs' | 'short_reads',
  customSlug?: string,
) {
  const rootPath = collection === 'blogs' ? BLOG_PATH : SHORT_READS_PATH;
  const basePath = collection === 'blogs' ? '/blogs' : '/short-reads';

  const pathSegments = filePath
    ?.replace(rootPath, '')
    .split('/')
    .filter(path => path !== '' && !path.startsWith('_'))
    .slice(0, -1)
    .map(segment => slugifyStr(segment));

  const slug = customSlug || id.split('/').slice(-1)[0];

  if (!pathSegments || pathSegments.length < 1) {
    return `${basePath}/${slug}`;
  }

  return `${basePath}/${pathSegments.join('/')}/${slug}`;
}

export default getPostPath;
