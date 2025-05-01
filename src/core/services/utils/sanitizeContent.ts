import sanitizeHtml from 'sanitize-html';

export function sanitizeContent(content: string) {
  content = content.trim();

  const emptyTagRegex = /^(<[^>]+><\/[^>]+>)+|(<[^>]+><\/[^>]+>)+$/g;

  content = content.replace(emptyTagRegex, '');

  return sanitizeHtml(content);
}
