import { FastifyInstance } from 'fastify';

import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';
import createError from 'http-errors';

import transform from './transformer';
import params from './params';
import decompress from './decompress';
import { Readable } from 'stream';
import { decode, toBufferEncoding } from './decode';

const get = params.protocol === 'https' ? httpsGet : httpGet;
const info = {
    origin: params.url.toString(),
    auth: params.auth
};

export default function (server: FastifyInstance) {
    return server.get('*', function (request, reply) {
        request.headers['host'] = params.url.hostname;
        const options = {
            headers: request.headers,
            auth: info.auth
        };
        get(info.origin + request.url, options, proxy => {
            const { headers, statusCode: code } = proxy;
            headers['authorization'] && delete headers['authorization'];

            if (!code || code >= 400) {
                proxy.resume();
                reply.send(createError(code ?? 500));
            } else if (code >= 300 && code < 400) {
                if (headers['location'])
                    reply.redirect(
                        code,
                        headers['location'].replace(info.origin, '')
                    );
                else reply.send(new createError.InternalServerError());
            } else {
                if (headers['content-type']?.startsWith('text/html')) {
                    let stream: Readable = proxy;

                    const compression = headers['content-encoding'];
                    if (compression) {
                        const decompressor = decompress(compression);
                        if (!decompressor) {
                            return reply
                                .code(code)
                                .headers(headers)
                                .send(proxy);
                        }
                        stream = stream.pipe(decompressor);
                    }

                    const bufferEncoding = toBufferEncoding(
                        headers['content-type']
                    );

                    if (!bufferEncoding) {
                        return reply.code(code).headers(headers).send(proxy);
                    }

                    decode(stream, bufferEncoding).then(data =>
                        reply.view('dir', {
                            style: 'table',
                            ...transform(data, request.url)
                        })
                    );
                } else reply.code(200).headers(headers).send(proxy);
            }
        }).on('error', e =>
            reply.send(new createError.InternalServerError(e.message))
        );
    });
}
