import { Router } from 'express';
import needle, { NeedleOptions } from 'needle';
import { decode } from 'iconv-lite';
import cheerio from 'cheerio';
import createError from 'http-errors';
import { extname } from 'path';

import { typer, navigator } from './_helpers';

const router = Router();

router.get('*', async function (req, res, next) {
    const headers = req.headers;
    headers['host'] = 'iipo.tu-bryansk.ru';
    const options: NeedleOptions = {
        headers: headers,
        username: process.env.LOGIN,
        password: process.env.PASSWORD,
        follow_max: 5,
        decode: true
    };
    let path = req.path;
    let stream = needle.get("http://iipo.tu-bryansk.ru/pub" + req.path, options);
    stream.on('err', (err) => {
        return next(new createError.InternalServerError(err.message));
    });
    stream.on('redirect', (location: string) => {
        // console.log(response);
        path = location.replace(/^.*\/pub/, '');
    })
    stream.on('header', (status, headers) => {
        // if (status === 301 || status === 302) {
        //     return res.redirect(status, headers['location']?.replace(/.*\/pub/, '/mirror/') ?? '/mirror/');
        // }
        if (status !== 200)
            return next(createError(status));
        if (headers['content-type']?.startsWith('text/html')) {
            let data = '';
            const encoding: string = headers['content-type']?.replace(/.*charset\s*=\s*/, '') ?? 'utf8';
            stream.on('data', (chunk: Buffer | string) => {
                if (chunk instanceof Buffer)
                    data += decode(chunk, encoding);
                else
                    data += chunk;
            });
            stream.on('done', () => {
                path = '/mirror' + path;
                // const path = '/mirror' + (req.path.endsWith('/') ? req.path : req.path + '/');
                const $ = cheerio.load(data);
                const items = [];
                for (const element of $('body>table>tbody>tr').slice(3, -1).toArray()) {
                    const children = element.children;
                    const link = path + $(children[1].firstChild).attr('href');
                    items.push({
                        type: link?.endsWith('/') ? 'folder' : typer(extname(link)),
                        link: link,
                        name: $(children[1].firstChild).text(),
                        date: $(children[2]).text(),
                        size: $(children[3]).text()
                    });
                }
                const navigation: { text: string, href?: string }[] = navigator(path);
                if (navigation)
                    delete navigation[navigation.length - 1].href;
                res.render('dir', { style: 'table', rows: items, title: path.slice(1), navigation, back: navigation.length > 1 ? navigation[navigation.length - 2].href : null });
            });
        }
        else {
            res.writeHead(200, headers);
            stream.pipe(res, { end: true });
        }
    });
});

export default router;
