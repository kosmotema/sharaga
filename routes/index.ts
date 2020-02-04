import { Router } from 'express';
const router = Router();

router.get('/', function (_req, res) {
    res.render('index', { style: 'index', title: 'main' });
})

export default router;