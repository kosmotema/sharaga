import { Transform } from 'node:stream';
import { createGunzip, createBrotliDecompress, createInflate } from 'node:zlib';

export default function produceDecompressChain(header: string): Transform | undefined {
  const encodings = header.split(',').map((s) => s.trim());

  // eslint-disable-next-line unicorn/no-array-reduce
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
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined;
    }

    return decompress ? target.pipe(decompress) : target;
    // eslint-disable-next-line unicorn/no-useless-undefined
  }, undefined);
}
