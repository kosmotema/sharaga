import { load } from 'cheerio';
import { hasChildren, isTag, isText, Node } from 'domhandler';
import path from 'node:path';

import navigator, { LinkPart } from './parse-url';
import typer from './extension-to-icon';

type RowData = {
  type: string;
  link: string;
  name: string;
  date: string;
  size: string;
};

type SortLinks = { name: string; date: string; size: string };

export type TransformResult = {
  rows: RowData[];
  navigation: LinkPart[];
  title: string;
  last?: string;
  sort: SortLinks;
};

function firstChild(element: Node | null): Node | null {
  // eslint-disable-next-line unicorn/no-null
  return element && hasChildren(element) ? element.firstChild : null;
}

function text(element: Node | null): string {
  const child = firstChild(element);
  return child && isText(child) ? child?.data : '';
}

function href(element: Node | null): string {
  const child = firstChild(element);
  return child && isTag(child) ? child.attribs.href : '';
}

export default function transform(data: string, url: string): TransformResult {
  const $ = load(data);
  const rows = $('body>table>tbody>tr').toArray();
  const header = rows[0].children;
  const sort = {
    name: href(header[1]),
    date: href(header[2]),
    size: href(header[3]),
  };

  const items = rows.slice(3, -1).map((element) => {
    const row = element.children;
    const link = href(row[1]);
    const isFolder = link[link.length - 1] === '/';
    const name = text(firstChild(row[1]));
    return {
      type: isFolder ? 'folder' : typer(path.extname(link).slice(1)),
      link,
      name: isFolder ? name.slice(0, -1) : name,
      date: text(row[2]),
      size: text(row[3]),
    };
  });

  const { parts: navigation, title } = navigator(url);
  return {
    rows: items,
    navigation,
    title,
    sort,
  };
}
