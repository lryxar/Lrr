const $ = (id) => document.getElementById(id);
const log = (msg) => { $('log').textContent += msg + '\n'; $('log').scrollTop = $('log').scrollHeight; };
let es = null;

$('generate').onclick = async () => {
  const count = Number($('count').value || 20);
  const r = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ count, length:16 })});
  const d = await r.json();
  $('log').textContent = '';
  d.codes.forEach(c => log(c.url));
};

$('check').onclick = async () => {
  const code = $('code').value.trim();
  if (!code) return;
  const r = await fetch('/api/check', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code })});
  const d = await r.json();
  log(`${code} => ${d.result.valid ? 'VALID' : 'INVALID'} (${d.result.status || d.result.error})`);
};

$('scan').onclick = () => {
  if (es) es.close();
  $('log').textContent = '';
  es = new EventSource(`/api/scan?count=${Number($('count').value||20)}&delay=150`);
  es.addEventListener('progress', (e) => {
    const d = JSON.parse(e.data);
    log(`[${d.index}/${d.total}] ${d.code} => ${d.valid ? 'VALID' : 'INVALID'}`);
  });
  es.addEventListener('done', () => { log('Done'); es.close(); es=null; });
};

$('stop').onclick = () => { if (es) { es.close(); es=null; log('Stopped'); } };
