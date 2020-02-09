import dotenv from 'dotenv';
dotenv.config();

import createError from 'http-errors';
import express from 'express';
import { join } from 'path';
import fs from 'fs';
import logger from 'morgan';
import sassMiddleware from 'node-sass-middleware';
import hbs from 'hbs';
// import cookieParser from 'cookie-parser'; // use later for dark theme

import indexRouter from './routes/index';
import mirrorRouter from './routes/mirror';
import localRouter from './routes/local';

var app = express();

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

try {
  app.use(logger('combined', {
    stream: fs.createWriteStream(join(__dirname, ...(process.env.LOG?.split('|') ?? ['logs', 'access.log'])), { flags: 'a+' })
  }));
}
catch (err) {
  console.warn('Cannot initialize logger: %s', err.message || 'unknown error');
}
app.use(logger('dev', {
  skip: function (_req, res) { return res.statusCode < 400 }
}))
// app.use(cookieParser()); // use later for dark theme
app.use(sassMiddleware({
  src: join(__dirname, 'public'),
  dest: join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: false,
  outputStyle: process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed'
}));
app.use(express.static(join(__dirname, 'public')));

hbs.registerPartials(join(__dirname, 'views', 'partials'));

app.use('/', indexRouter);
app.use('/mirror', mirrorRouter);
app.use('/local', localRouter);

app.use(function (_req, _res, next) {
  next(new createError.NotFound());
});

app.use(function (err: any, req: any, res: any, _next: any) { // customize types later
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const status = err.status || 500;
  const message = err?.message?.toLowerCase() || 'internal server error';

  let type: { local?: boolean, mirror?: boolean } = {};
  switch (req.path.slice(1).slice(0, req.path.indexOf('/', 1))) {
    case 'local/':
      type['local'] = true;
      break;
    case 'mirror/':
      type['mirror'] = true;
      break;
  }

  // use image if you want to put an image on error page, currently it will add random .jpg image with name from 1 to 53, also change error.hbs
  res.status(status).render('error', { type: type, image: Math.round(Math.random() * 52) + 1, style: 'error', title: message });
});

export default app;