/*
 * @Author: renxia
 * @Date: 2023-12-29 11:45:31
 * @LastEditors: renxia
 * @LastEditTime: 2023-12-29 15:51:13
 * @Description: 
 */
const http = require('node:http');
const url = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const { findFreePort, color } = require('@lzwme/fe-utils');
const Cvocr = require('./Cvocr');
const { logger, getCodesList } = require('./utils');


async function createServer({ port, baseDir = process.cwd() } = {}) {
  if (!port) port = process.env.PORT || await findFreePort();

  const clientServer = http.createServer(async (req, res) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': req.headers.origin,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With',
    };
    const data = [];

    if (req.method == 'OPTIONS') return res.writeHead(200, corsHeaders).end('');

    req.on('data', chunk => data.push(chunk));
    req.on('end', async () => {
      const reqUrl = url.parse(req.url);
      let body = data.join('');
      try {
        if (data.length > 0) body = JSON.parse(body);
      } catch {}
      if (body) logger.debug(body);

      if (reqUrl.pathname === '/ocr' && body) {
        const result = { errmsg: '', code: 0 };
        const codesList = getCodesList();

        if (!body.mode) body.mode = 'simplest';
        if (body.mode === 'slide_match') body.base64 = body.slideBase64 || body.base64;

        if (!body.base64) {
          result.errmsg = '未指定图片 base64 参数值';
        } else if (!body.mode || !codesList.includes(body.mode)) {
          result.errmsg = `请指定正确的 mode 模式`;
        }

        if (!result.errmsg) {
          ['base64', 'slideBase64', 'originalBase64'].forEach(key => {
            if (body[key] && !/data:image\/[a-zA-Z]*;base64,([^"]*)/.test(body[key])) body[key] = `data:image/jpg;base64,${body[key]}`;
          });

          try {
            result.data = await new Cvocr(body.mode).recognize(body.base64, body.originalBase64);
          } catch (error) {
            result.errmsg = typeof error === 'string' ? error : error.message || 'OCR识别处理异常';
          }
        }

        if (result.errmsg && !result.code) result.code = -1;

        res.writeHead(200, { ...corsHeaders });
        res.end(JSON.stringify(result));
        return;
      }

      let filePath = path.join(baseDir, reqUrl.pathname);

      if (!reqUrl.pathname.includes('.')) filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath)) filePath = path.resolve(baseDir, 'index.html');

      if (fs.existsSync(filePath)) {
        if (reqUrl.pathname.endsWith('.js')) {
          res.writeHead(200, { 'Content-Type': 'application/x-javascript' });
        } else if (reqUrl.pathname.endsWith('.json')) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        } else if (/\.png|jpg|gif|webp$/.test(reqUrl.pathname)) {
          res.writeHead(200, { 'Content-Type': 'image/*' });
        } else if (reqUrl.pathname.endsWith('.css')) {
          res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        }

        res.end(fs.readFileSync(filePath));
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('请查阅使用文档：' + require(path.join(__dirname, 'package.json')).homepage);
      }
    });
  });

  return clientServer.listen(port, () => logger.log('SERVER LISTEN ON PORT', color.greenBright(port)));
}

exports.createServer = createServer;

