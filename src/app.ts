import fastify from 'fastify';
import minifier from 'html-minifier';
import fastifyStatic from 'fastify-static';
import view from 'point-of-view';
import path from 'node:path';
import handlebars from 'handlebars';

import proxify from './proxify';
import { VERSION, PORT, NPM_VERSION, ENV, menu } from './parameters';

const isDevelopment = ENV === 'development';

const server = fastify({ logger: isDevelopment });

server.register(view, {
  engine: {
    handlebars,
  },
  root: path.join(__dirname, '..', 'views'),
  layout: 'layout',
  options: {
    useHtmlMinifier: minifier,
    htmlMinifierOptions: {
      removeComments: true,
      removeCommentsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: true,
    },
  },
  defaultContext: {
    version: NPM_VERSION || VERSION,
    menu,
  },
  viewExt: 'hbs',
});

server.register(proxify);

if (isDevelopment) {
  server.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/static/',
  });
}

server.setErrorHandler((error, _request, reply) => {
  reply.code(error.statusCode ?? 500).view('error', {
    status: error.statusCode,
    message: error.message,
    title: error.message.toLowerCase(),
  });
});

const start = async () => {
  try {
    await server.listen(PORT ?? '3000');
    server.log.info(`server listening on ${server.server.address()}`);
  } catch (error) {
    server.log.error(error);
    throw error;
  }
};
start();
