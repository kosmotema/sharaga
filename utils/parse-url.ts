function trim(url: string): string {
    const i = url.indexOf('?');
    return ~i ? url.slice(0, i) : url;
}

export default function (path: string): { items: { text: string, href: string }[], last?: string, title: string } {
    const items: { text: string, href: string }[] = [];
    let title = '/', link = '/';
    for (const part of trim(path).split('/')) {
        if (part) {
            const text = decodeURIComponent(part);
            link += part + '/';
            title += text + '/';
            items.push({ text, href: link });
        }
    }
    const last = items.pop()?.text;
    return { items, last, title };
}