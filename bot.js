const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const crypto = require('crypto');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const PREFIX = process.env.BOT_PREFIX || '!';

if (!BOT_TOKEN) {
  console.error('Missing DISCORD_BOT_TOKEN in environment.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// In-memory link requests: code -> { requesterId, targetId, createdAt }
const pendingLinks = new Map();
// Final links: userId -> Set<userId>
const links = new Map();

function addLink(a, b) {
  if (!links.has(a)) links.set(a, new Set());
  if (!links.has(b)) links.set(b, new Set());
  links.get(a).add(b);
  links.get(b).add(a);
}

function listLinks(id) {
  return Array.from(links.get(id) || []);
}

function cleanupExpired(maxAgeMs = 10 * 60 * 1000) {
  const now = Date.now();
  for (const [code, data] of pendingLinks.entries()) {
    if (now - data.createdAt > maxAgeMs) pendingLinks.delete(code);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Bot ready as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  cleanupExpired();

  const [cmd, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);

  if (cmd === 'help') {
    return message.reply([
      'الأوامر المتاحة:',
      `\`${PREFIX}link @user\` - إنشاء طلب ربط بينك وبين عضو آخر عبر كود تحقق.`,
      `\`${PREFIX}accept <code>\` - قبول طلب الربط باستخدام الكود.`,
      `\`${PREFIX}my-links\` - عرض الحسابات المربوطة معك.`,
      '',
      'ملاحظة: هذا البوت يستخدم Discord Bot Token فقط. لا تستخدم/تشارك User Token.'
    ].join('\n'));
  }

  if (cmd === 'link') {
    const target = message.mentions.users.first();
    if (!target) return message.reply('استخدم الأمر بهذا الشكل: `!link @user`.');
    if (target.id === message.author.id) return message.reply('لا يمكنك ربط نفسك بنفسك.');

    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    pendingLinks.set(code, {
      requesterId: message.author.id,
      targetId: target.id,
      createdAt: Date.now()
    });

    await message.reply(`تم إنشاء طلب الربط مع ${target}.\nالكود: **${code}**\nأرسل له: \`${PREFIX}accept ${code}\``);
    return;
  }

  if (cmd === 'accept') {
    const code = (args[0] || '').toUpperCase();
    if (!code) return message.reply(`استخدم: \`${PREFIX}accept CODE\``);
    const request = pendingLinks.get(code);
    if (!request) return message.reply('الكود غير صحيح أو منتهي.');
    if (request.targetId !== message.author.id) return message.reply('هذا الكود ليس موجّهًا لك.');

    addLink(request.requesterId, request.targetId);
    pendingLinks.delete(code);

    return message.reply('تم الربط بنجاح ✅');
  }

  if (cmd === 'my-links') {
    const arr = listLinks(message.author.id);
    if (!arr.length) return message.reply('لا يوجد أي ربط حالي.');
    return message.reply(`الحسابات المربوطة معك:\n${arr.map((id) => `<@${id}>`).join('\n')}`);
  }
});

client.login(BOT_TOKEN);
