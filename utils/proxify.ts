import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';

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

function proxy(request: FastifyRequest, reply: FastifyReply) {
  request.headers.host = parameters.url.hostname;
  const options = {
    headers: request.headers,
    auth: info.auth,
  };
  get(info.origin + request.url, options, (upstream) => {
    const { headers, statusCode: code } = upstream;
    if (headers.authorization) {
      delete headers.authorization;
    }

    if (!code || code >= 400) {
      upstream.resume();
      reply.send(createError(code ?? 500));
    } else if (code >= 300 && code < 400) {
      if (headers.location) reply.redirect(code, headers.location.replace(info.origin, ''));
      else reply.send(new createError.InternalServerError());
    } else if (headers['content-type']?.startsWith('text/html')) {
      let stream: Readable = upstream;

      const compression = headers['content-encoding'];
      if (compression) {
        const decompressor = decompress(compression);
        if (!decompressor) {
          reply.code(code).headers(headers).send(upstream);
          return;
        }
        stream = stream.pipe(decompressor);
      }

      const bufferEncoding = toBufferEncoding(headers['content-type']);

      if (!bufferEncoding) {
        reply.code(code).headers(headers).send(upstream);
        return;
      }

      decode(stream, bufferEncoding)
        .then((data) =>
          reply.view('dir', {
            style: 'table',
            ...transform(data, request.url),
          })
        )
        .catch((error) => new createError.InternalServerError(error?.message));
    } else reply.code(code).headers(headers).send(upstream);
  }).on('error', (error) => reply.send(new createError.InternalServerError(error.message)));
};

const setup: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get('*', proxy);

  done();
};

export default setup;
