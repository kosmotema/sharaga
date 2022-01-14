export type LinkPart = { text: string; href: string };
export type ParseResult = { parts: LinkPart[]; title: string };

function trim(url: string): string {
  const index = url.indexOf('?');
  return index !== -1 ? url.slice(0, index) : url;
}

export default function parse(path: string): ParseResult {
  let title = '/';
  let link = '/';

  const parts: LinkPart[] = trim(path)
    .split('/')
    .filter(Boolean)
    .map((part) => {
      const text = decodeURIComponent(part);
      link += `${part}/`;
      title += `${text}/`;
      return { text, href: link };
    });

  return { parts, title };
}
