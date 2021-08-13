import { Transform } from 'stream';
import { createGunzip, createBrotliDecompress, createInflate } from 'zlib';

export default function produceDecompressChain(header: string) {
  const encodings = header.split(',').map((s) => s.trim());

  return encodings.reduce((decompress: Transform | undefined, encoding) => {
    let target: Transform;
    switch (encoding) {
      case 'gzip':
      case 'x-gzip':
        target = createGunzip();
        break;
      case 'deflate':
        target = createInflate();
        break;
      case 'br':
        target = createBrotliDecompress();
        break;
      default:
        return undefined;
    }

    return decompress ? target.pipe(decompress) : target;
  }, undefined);
}
