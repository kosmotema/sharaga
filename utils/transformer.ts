import { load } from 'cheerio';
import { extname } from 'path';

import navigator from './parse-url';
import typer from './ext2type';

export default function (data: string, url: string): any {
    const $ = load(data);
    const items = [];
    for (const element of $('body>table>tbody>tr').slice(3, -1).toArray()) {
        const row = element.children;
        const link = $(row[1].firstChild).attr('href') ?? '';
        items.push({
            type: link.endsWith('/') ? 'folder' : typer(extname(link)),
            link: link,
            name: $(row[1].firstChild).text(),
            date: $(row[2]).text(),
            size: $(row[3]).text()
        });
    }
    const { items: navigation, title, last } = navigator(url);
    return { rows: items, navigation, title, last };
}