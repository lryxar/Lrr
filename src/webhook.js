const https = require('https');

function sendWebhook(webhookUrl, payload) {
  if (!webhookUrl) return Promise.resolve(false);
  let parsed;
  try { parsed = new URL(webhookUrl); } catch (_) { return Promise.resolve(false); }

  const body = JSON.stringify({
    username: 'lryxar',
    embeds: [{
      title: 'Nitro Hit ✅',
      color: 0x57F287,
      description: `Code: \`${payload.code}\`\nURL: ${payload.url || ''}`,
      timestamp: new Date().toISOString()
    }]
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
    req.on('error', () => resolve(false));
    req.write(body);
    req.end();
  });
}

module.exports = { sendWebhook };
