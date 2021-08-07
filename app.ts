import { config } from 'dotenv';
config();

import fastify from 'fastify';
import minifier from 'html-minifier';
import fastifyStatic from 'fastify-static';
import view from 'point-of-view';
import { join } from 'path';
import handlebars from 'handlebars';

import proxify from './utils/proxify';

const isDevelopment = process.env.NODE_ENV === 'development';

const server = fastify({ logger: isDevelopment });

server.register(view, {
    engine: {
        handlebars
    },
    root: join(__dirname, 'views'),
    layout: 'layout',
    options: {
        partials: {
            nav: './partials/nav.hbs',
            footer: './partials/footer.hbs'
        },
        useHtmlMinifier: minifier,
        htmlMinifierOptions: {
            removeComments: true,
            removeCommentsFromCDATA: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true
        }
    },
    defaultContext: {
        version: process.env.npm_package_version || process.env.VERSION
    },
    viewExt: 'hbs'
});

proxify(server);

if (isDevelopment)
    server.register(fastifyStatic, {
        root: join(__dirname, 'public'),
        prefix: '/static/',
    })

server.setErrorHandler(function (error, _request, reply) {
    reply.code(error.statusCode ?? 500).view('error', { status: error.statusCode, message: error.message, style: 'error', title: error.message.toLowerCase() });
})

const start = async () => {
    try {
        await server.listen(process.env.PORT ?? '3000');
        server.log.info(`server listening on ${server.server.address()}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
start();