import { Router } from 'express';
import createError from 'http-errors';
import fs from 'fs';

import { typer, navigator } from './_helpers';

const router = Router();

router.get('*', function (req, res, next) {
  res.render('index', { title: 'not ready' });
});

export default router;
