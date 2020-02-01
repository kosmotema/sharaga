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
  sourceMap: false
}));
app.use(express.static(join(__dirname, 'public')));

hbs.registerPartials(join(__dirname, 'views', 'partials'));

app.use('/', indexRouter);
app.use('/mirror', mirrorRouter);
app.use('/local', localRouter);

app.use(function (_req, _res, next) {
  next(new createError.NotFound());
});

app.use(function (err: { message: any; status: any; }, req: { app: { get: (arg0: string) => string; }; }, res: { locals: { message: any; error: any; }; status: (arg0: any) => void; render: (arg0: string) => void; }, _next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

export default app;