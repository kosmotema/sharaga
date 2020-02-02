import { Router } from 'express';
import createError from 'http-errors';
import fs from 'fs';
import { join, extname } from 'path';

import { typer, navigator, sizer } from './_helpers';

const router = Router();

router.get('*', async function (req, res, next) {
    if (/\/\.\.(\/|$)/.test(req.path))
        return next(new createError.BadRequest());
    const requested = decodeURI(req.path);
    const localPath = join(__dirname, '..', 'local', requested);
    try {
        const info: fs.Stats = await new Promise((resolve, reject) => {
            fs.stat(localPath, (err, stats) => {
                if (err)
                    reject(err);
                else resolve(stats);
            });
        })
        if (info.isFile())
            return res.sendFile(localPath);
        else if (info.isDirectory()) {
            const files: fs.Dirent[] = await new Promise((resolve, reject) => {
                fs.readdir(localPath, { withFileTypes: true }, (err, files) => {
                    if (err)
                        reject(err);
                    else resolve(files);
                });
            })

            const items = [];
            const path = '/local' + requested;
            const formater = new Intl.DateTimeFormat('ru', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
            for (const element of files.filter(v => !v.name.startsWith('.'))) {
                const elementPath = localPath + element.name;
                const itemInfo: fs.Stats = await new Promise((resolve, reject) => {
                    fs.stat(elementPath, (err, stats) => {
                        if (err)
                            reject(err);
                        else resolve(stats);
                    });
                });
                const isDirectory = element.isDirectory();

                items.push({
                    type: isDirectory ? 'folder' : typer(extname(element.name)),
                    link: path + encodeURIComponent(element.name) + (isDirectory ? '/' : ''),
                    name: element.name,
                    date: formater.format(itemInfo.mtime),
                    size: isDirectory ? '-' : sizer(itemInfo.size)
                });
            }

            items.sort((a, b) => {
                const isFolder = { a: a.type === 'folder', b: b.type === 'folder' };
                if (isFolder.a !== isFolder.b)
                    return isFolder.a ? -1 : 1;
                return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'case' });
            })

            const navigation: { text: string, href?: string }[] = navigator(path);
            if (navigation)
                delete navigation[navigation.length - 1].href;
            res.render('dir', { style: 'table', rows: items, title: path.slice(1), navigation, back: navigation.length > 1 ? navigation[navigation.length - 2].href : null });
        }
        else
            return next(new createError.InternalServerError('Cannot process the requested object'));
    }
    catch (err) {
        return next(err.code === 'ENOENT' ? new createError.NotFound() : new createError.InternalServerError(err.message));
    }
});

export default router;
