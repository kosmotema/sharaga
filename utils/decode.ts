import { Readable } from 'node:stream';

const CHARSET_RE = /charset=([^\s"(),./:;<=>?@[\]]*)/i;

export function decode(
  stream: Readable,
  charset: BufferEncoding,
): Promise<string> {
  return new Promise<string>((resolve) => {
    let data = '';
    stream
      .setEncoding(charset)
      .on('data', (chunk: string) => { data += chunk; })
      .on('end', () => resolve(data));
  });
}

function parseCharset(contentType: string): string | undefined {
  return CHARSET_RE.exec(contentType.toLowerCase())?.[1];
}

export function toBufferEncoding(
  contentType?: string,
): BufferEncoding | undefined {
  if (!contentType) return undefined;

  const charset = parseCharset(contentType);
  // follow https://www.iana.org/assignments/character-sets/character-sets.xhtml
  switch (charset) {
    case 'ascii':
    case 'iso-ir-6':
    case 'ansi_x3.4-1968':
    case 'ansi_x3.4-1986':
    case 'iso_646.irv:1991':
    case 'iso646-us':
    case 'us-ascii':
    case 'us':
    case 'ibm367':
    case 'cp367':
    case 'csascii':
      return 'ascii';
    case 'iso-ir-100':
    case 'iso_8859-1':
    case 'iso-8859-1':
    case 'latin1':
    case 'l1':
    case 'ibm819':
    case 'cp819':
    case 'csisolatin1':
      return 'latin1';
    case 'ucs2':
    case 'ucs-2':
    case 'iso-10646-ucs-2':
    case 'csunicode':
      return 'ucs2';
    case 'utf8':
    case 'utf-8':
    case 'csutf8':
      return 'utf8';
    case 'utf16-le':
    case 'utf16le':
    case 'csutf16le':
      return 'utf16le';
    default:
      return undefined;
  }
}
