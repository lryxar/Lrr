const https = require('https');

function checkCode(code, token = '') {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'discord.com',
      path: `/api/v10/entitlements/gift-codes/${code}?with_application=false&with_subscription_plan=true`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        ...(token ? { Authorization: token } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        let body = null;
        try { body = JSON.parse(raw); } catch (_) {}
        const valid = res.statusCode === 200 && body;
        resolve({ code, valid, status: res.statusCode, body });
      });
    });
    req.on('error', (e) => resolve({ code, valid: false, error: e.message }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ code, valid: false, error: 'Timeout' });
    });
    req.end();
  });
}

async function checkBatch(codes, token = '') {
  const out = [];
  for (const c of codes) out.push(await checkCode(c, token));
  return out;
}

function summarise(results) {
  const total = results.length;
  const valid = results.filter(r => r.valid).length;
  return { total, valid, invalid: total - valid };
}

module.exports = { checkCode, checkBatch, summarise };
