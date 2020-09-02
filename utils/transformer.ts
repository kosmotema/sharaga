import { load } from 'cheerio';
import { extname } from 'path';

import navigator from './parse-url';
import typer from './ext2type';

function text(element: CheerioElement): string {
    return element?.firstChild?.data ?? '';
}

function href(element: CheerioElement): string {
    return element?.firstChild?.attribs['href'] ?? '';
}

export default function (data: string, url: string): any {
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
        const name = text(row[1].firstChild);
        items.push({
            type: isFolder ? 'folder' : typer(extname(link)),
            link: link,
            name: isFolder ? name.slice(0, -1) : name,
            date: text(row[2]),
            size: text(row[3])
        });
    }
    const { items: navigation, title, last } = navigator(url);
    return { rows: items, navigation, title, last, sort };
}