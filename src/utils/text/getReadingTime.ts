export default function getReadingTime(text: string, wpm = 200) {
  let content = text;

  content = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  content = content.replace(/^\+\+\+\r?\n[\s\S]*?\r?\n\+\+\+\r?\n?/, '');

  content = content.replace(/```[\s\S]*?```/g, '');

  content = content.replace(/`[^`]*`/g, '');

  content = content.replace(/<!--[\s\S]*?-->/g, '');

  content = content.replace(/<[^>]*>/g, '');

  content = content.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

  content = content.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  content = content.replace(/^#{1,6}\s+/gm, '');

  content = content.replace(/[*_~]{1,3}/g, '');

  content = content.replace(/^\s*[-*+]\s+/gm, '');
  content = content.replace(/^\s*\d+\.\s+/gm, '');

  content = content.replace(/^\s*>\s+/gm, '');

  content = content.replace(/^[-*_]{3,}$/gm, '');

  const words = content
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0).length;

  const minutes = Math.max(1, Math.ceil(words / wpm));

  return minutes;
}
