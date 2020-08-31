import { FastifyInstance } from 'fastify';

import { createGunzip, createBrotliDecompress, createInflate } from 'zlib';
import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';
import createError from 'http-errors';

import transform from './transformer';

const get = process.env.PROXY_PROTOCOL === 'https' ? httpsGet : httpGet;
const info = {
    origin: `${process.env.PROXY_PROTOCOL}://${process.env.PROXY_HOSTNAME}${process.env.PROXY_PATHNAME}`,
    auth: `${process.env.PROXY_LOGIN}:${process.env.PROXY_PASSWORD}`
}

export default function (server: FastifyInstance) {
    return server.get('*', async function (request, reply) {
        request.headers['host'] = process.env.PROXY_HOSTNAME;
        const options = {
            headers: request.headers,
            auth: info.auth
        };
        get(info.origin + request.url, options, proxy => {
            if (!proxy.statusCode || proxy.statusCode >= 400) {
                proxy.resume();
                reply.send(createError(proxy.statusCode ?? 500));
            }
            else if (proxy.statusCode >= 300 && proxy.statusCode < 400) {
                if (proxy.headers['location'])
                    reply.redirect(proxy.statusCode, proxy.headers['location'].replace(info.origin, ''));
                else
                    reply.send(new createError.InternalServerError());
            }
            else {
                if (proxy.headers['content-type']?.startsWith('text/html')) {
                    let data = '';
                    let decompress = null;

                    switch (proxy.headers['content-encoding']) {
                        case 'gzip': case 'x-gzip':
                            decompress = createGunzip();
                            break;
                        case 'deflate':
                            decompress = createInflate();
                            break;
                        case 'br':
                            decompress = createBrotliDecompress();
                            break;
                        default:
                            proxy.resume();
                            return reply.send(new createError.InternalServerError(`Unsupported encoding: ${proxy.headers['content-encoding']}`));
                    }

                    proxy.pipe(
                        decompress
                            .setEncoding(<BufferEncoding>process.env.PROXY_ENCODING ?? 'utf8')
                            .on('data', (chunk: string) => data += chunk)
                            .on('end', () => reply.view('dir', { style: 'table', ...transform(data, request.url) }))
                    );
                }
                else
                    reply.code(200).headers(proxy.headers).send(proxy);
            }
        }).on('error', e => reply.send(new createError.InternalServerError(e.message)));
    });
}