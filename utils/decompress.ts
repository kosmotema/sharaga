import { Transform } from 'stream';
import { createGunzip, createBrotliDecompress, createInflate } from 'zlib';

export default function produceDecompressChain(header: string) {
  const encodings = header.split(',').map((s) => s.trim());
  let decompress: Transform | undefined;

  for (const encoding of encodings) {
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

    decompress = decompress ? target.pipe(decompress) : target;
  }

  return decompress;
}
