const http = require('http');
const fs = require('fs');
const path = require('path');
const { generateBatch, toGiftURL } = require('./src/generator');
const { checkCode } = require('./src/checker');
const { sendWebhook } = require('./src/webhook');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

function readBody(req) {
  return new Promise((res, rej) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => { try { res(JSON.parse(d || '{}')); } catch (e) { rej(e); } });
    req.on('error', rej);
  });
}

function json(res, status, body) {
  const p = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(p);
}

function sseHeaders(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
}

function sendEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname.startsWith('/public') || /\.(css|js|png|svg|ico|html)$/.test(url.pathname))) {
    const fp = url.pathname === '/' ? path.join(PUBLIC, 'index.html') : path.join(PUBLIC, url.pathname.replace('/public/', ''));
    if (!fp.startsWith(PUBLIC) || !fs.existsSync(fp)) return json(res, 404, { ok: false, error: 'Not found' });
    const ext = path.extname(fp);
    const map = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript' };
    res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
    return fs.createReadStream(fp).pipe(res);
  }

  if (req.method === 'POST' && url.pathname === '/api/generate') {
    try {
      const { count = 20, length = 16 } = await readBody(req);
      const codes = generateBatch(Number(count), Number(length));
      return json(res, 200, { ok: true, count: codes.length, codes: codes.map(c => ({ code: c, url: toGiftURL(c) })) });
    } catch (e) { return json(res, 400, { ok: false, error: e.message }); }
  }

  if (req.method === 'POST' && url.pathname === '/api/check') {
    try {
      const { code, token = '', webhookUrl = '' } = await readBody(req);
      const result = await checkCode(code, token);
      if (result.valid) await sendWebhook(webhookUrl, { code, url: toGiftURL(code) });
      return json(res, 200, { ok: true, result });
    } catch (e) { return json(res, 400, { ok: false, error: e.message }); }
  }

  if (req.method === 'GET' && url.pathname === '/api/scan') {
    sseHeaders(res);
    const count = Number(url.searchParams.get('count') || 50);
    const delay = Number(url.searchParams.get('delay') || 250);
    const token = url.searchParams.get('token') || '';
    const webhookUrl = url.searchParams.get('webhookUrl') || '';
    let stopped = false;
    req.on('close', () => { stopped = true; });

    const codes = generateBatch(count, 16);
    for (let i = 0; i < codes.length && !stopped; i++) {
      const r = await checkCode(codes[i], token);
      if (r.valid) await sendWebhook(webhookUrl, { code: codes[i], url: toGiftURL(codes[i]) });
      sendEvent(res, 'progress', { index: i + 1, total: count, ...r });
      await new Promise(r => setTimeout(r, delay));
    }
    sendEvent(res, 'done', { ok: true });
    return res.end();
  }

  json(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => console.log(`lryxar running on http://localhost:${PORT}`));
