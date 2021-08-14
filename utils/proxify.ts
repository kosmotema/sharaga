import { FastifyInstance } from 'fastify';

import { get as httpGet } from 'node:http';
import { get as httpsGet } from 'node:https';
import createError from 'http-errors';
import { Readable } from 'node:stream';

import transform from './transformer';
import parameters from './parameters';
import decompress from './decompress';
import { decode, toBufferEncoding } from './decode';

const get = parameters.protocol === 'https' ? httpsGet : httpGet;
const info = {
  origin: parameters.url.toString(),
  auth: parameters.auth,
};

// FIXME: use fastify pluggins syntax
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function setup(server: FastifyInstance) {
  return server.get('*', (request, reply) => {
    request.headers.host = parameters.url.hostname;
    const options = {
      headers: request.headers,
      auth: info.auth,
    };
    // eslint-disable-next-line consistent-return
    get(info.origin + request.url, options, (proxy) => {
      const { headers, statusCode: code } = proxy;
      if (headers.authorization) {
        delete headers.authorization;
      }

      if (!code || code >= 400) {
        proxy.resume();
        reply.send(createError(code ?? 500));
      } else if (code >= 300 && code < 400) {
        if (headers.location) reply.redirect(code, headers.location.replace(info.origin, ''));
        else reply.send(new createError.InternalServerError());
      } else if (headers['content-type']?.startsWith('text/html')) {
        let stream: Readable = proxy;

        const compression = headers['content-encoding'];
        if (compression) {
          const decompressor = decompress(compression);
          if (!decompressor) {
            return reply.code(code).headers(headers).send(proxy);
          }
          stream = stream.pipe(decompressor);
        }

        const bufferEncoding = toBufferEncoding(headers['content-type']);

        if (!bufferEncoding) {
          return reply.code(code).headers(headers).send(proxy);
        }

        decode(stream, bufferEncoding).then((data) => reply.view('dir', {
          style: 'table',
          ...transform(data, request.url),
        }));
      } else reply.code(200).headers(headers).send(proxy);
    }).on('error', (error) => reply.send(new createError.InternalServerError(error.message)));
  });
}
