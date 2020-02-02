export function navigator(path: string): { text: string, href: string }[] {
    const back: { text: string, href: string }[] = [];
    path.split("/")
        .filter(v => !!v)
        .reduce((acc, cv) => {
            acc += cv + "/";
            back.push({ text: decodeURIComponent(cv), href: acc });
            return acc;
        }, "/");
    return back;
}

export function typer(extension?: string) {
    switch (extension?.slice(1)) {
        case 'zip': case '7z': case 'bz2': case 'cab': case 'gz': case 'tar': case 'rar':
            return 'archive';
        case 'doc': case 'docx': case 'docm': case 'dot': case 'dotx': case 'dotm': case 'log': case 'msg': case 'odt': case 'pages': case 'rtf': case 'tex': case 'wpd': case 'wps':
            return 'document';
        case 'bmp': case 'png': case 'tiff': case 'tif': case 'gif': case 'jpg': case 'jpeg': case 'jpe': case 'psd': case 'ai': case 'ico':
            return 'image';
        case 'xlsx': case 'xlsm': case 'xltx': case 'xltm': case 'xlam': case 'xlr': case 'xls': case 'csv':
            return 'spreadsheet';
        case 'ppt': case 'pptx': case 'pot': case 'potx': case 'pptm': case 'potm': case 'xps':
            return 'presentation';
        case 'pdf':
            return 'pdf';
        case 'txt': case 'cnf': case 'conf': case 'map': case 'yaml':
            return 'text';
        default:
            return 'unknown';
    }
}

function categorizer(category: number): string {
    switch (category) {
        case 0:
            return 'Б';
        case 1:
            return 'КиБ';
        case 2:
            return 'МиБ';
        case 3:
            return 'ГиБ';
        case 4:
            return 'ТиБ';
        case 5:
            return 'ПиБ';
        case 6:
            return 'ЭиБ';
        case 7:
            return 'ЗиБ';
        case 8: // should be enough
            return 'ЙиБ';
        default:
            return '?иБ';
    }
}

export function sizer(size: number): string {
    let category = size == 0 ? 0 : Math.floor(Math.log2(size) / 10);
    let realSize = size / Math.pow(1024, category);
    return `${Math.round(realSize * 100) / 100} ${categorizer(category)}`;
}