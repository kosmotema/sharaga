export default function (path: string): { items: { text: string, href: string }[], last?: string, title: string } {
    const items: { text: string, href: string }[] = [];
    let title = '/', acc = '/';
    for (const part of path.split('/')) {
        if (part) {
            const text = decodeURIComponent(part);
            acc += part + '/';
            title += text + '/';
            items.push({ text, href: acc });
        }
    }
    const last = items.pop()?.text;
    return { items, last, title };
}