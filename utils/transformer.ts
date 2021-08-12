import { load } from 'cheerio';
import { hasChildren, isTag, isText, Node } from 'domhandler';
import { extname } from 'path';

import navigator, { LinkPart } from './parse-url';
import typer from './ext2type';

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
    return element && hasChildren(element) ? element.firstChild : null;
}

function text(element: Node | null): string {
    const child = firstChild(element);
    return child && isText(child) ? child?.data : '';
}

function href(element: Node | null): string {
    const child = firstChild(element);
    return child && isTag(child) ? child.attribs['href'] : '';
}

export default function (data: string, url: string): TransformResult {
    const $ = load(data);
    const items = [];
    const rows = $('body>table>tbody>tr').toArray();
    const header = rows[0].children;
    const sort = {
        name: href(header[1]),
        date: href(header[2]),
        size: href(header[3])
    };
    for (const element of rows.slice(3, -1)) {
        const row = element.children;
        const link = href(row[1]);
        const isFolder = link[link.length - 1] === '/';
        const name = text(firstChild(row[1]));
        items.push({
            type: isFolder ? 'folder' : typer(extname(link).slice(1)),
            link: link,
            name: isFolder ? name.slice(0, -1) : name,
            date: text(row[2]),
            size: text(row[3])
        });
    }
    const { items: navigation, title, last } = navigator(url);
    return { rows: items, navigation, title, last, sort };
}
