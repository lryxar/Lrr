const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomCode(length = 16) {
  let out = '';
  for (let i = 0; i < length; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

function generateBatch(count = 10, length = 16) {
  return Array.from({ length: count }, () => randomCode(length));
}

function toGiftURL(code) {
  return `https://discord.gift/${code}`;
}

module.exports = { generateBatch, toGiftURL };
