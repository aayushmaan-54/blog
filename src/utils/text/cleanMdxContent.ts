export default function cleanMdxContent(content: string): string {
  return (
    content
      // Remove import statements
      .replace(/^import\s+.*$/gm, '')
      // Remove JSX comments
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      // Remove the "Table of Contents" heading (the list itself is injected at
      // render time, not present in the raw body).
      .replace(/^##\s+Table of Contents\s*$/gim, '')
      // Remove self-closing JSX components
      .replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g, '')
      // Remove JSX components with content (keep inner content)
      .replace(/<[A-Z][a-zA-Z]*[^>]*>([\s\S]*?)<\/[A-Z][a-zA-Z]*>/gi, '$1')
      // Remove HTML tags
      .replace(/<\/?[a-z][a-z0-9]*[^>]*\/?>/gi, '')
      // Clean up excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}
