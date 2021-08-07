import { FastifyInstance } from 'fastify';

import { createGunzip, createBrotliDecompress, createInflate } from 'zlib';
import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';
import createError from 'http-errors';

import transform from './transformer';
import params from './params';

const get = params.protocol === 'https' ? httpsGet : httpGet;
const info = {
    origin: params.url.toString(),
    auth: params.auth
}

export default function (server: FastifyInstance) {
    return server.get('*', async function (request, reply) {
        request.headers['host'] = params.url.hostname;
        const options = {
            headers: request.headers,
            auth: info.auth
        };
        get(info.origin + request.url, options, proxy => {
            const { headers, statusCode: code } = proxy;
            delete headers['authorization'];
            
            if (!code || code >= 400) {
                proxy.resume();
                reply.send(createError(code ?? 500));
            }
            else if (code >= 300 && code < 400) {
                if (headers['location'])
                    reply.redirect(code, headers['location'].replace(info.origin, ''));
                else
                    reply.send(new createError.InternalServerError());
            }
            else {
                if (headers['content-type']?.startsWith('text/html')) {
                    let data = '';
                    let decompress = null;

                    switch (headers['content-encoding']) {
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
                            return reply.send(new createError.InternalServerError(`Unsupported encoding: ${headers['content-encoding']}`));
                    }

                    proxy.pipe(
                        decompress
                            .setEncoding(params.encoding as BufferEncoding ?? 'utf8')
                            .on('data', (chunk: string) => data += chunk)
                            .on('end', () => reply.view('dir', { style: 'table', ...transform(data, request.url) }))
                    );
                }
                else
                    reply.code(200).headers(headers).send(proxy);
            }
        }).on('error', e => reply.send(new createError.InternalServerError(e.message)));
    });
}