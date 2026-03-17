# lryxar

مشروع Node.js يحتوي على:
- واجهة ويب بسيطة.
- بوت Discord رسمي (discord.js) لربط حسابين **بشكل آمن** عبر كود تحقق.

> ⚠️ مهم: لا تستخدم User Token نهائياً. استخدم فقط **Bot Token** الرسمي من Discord Developer Portal.

## 1) تشغيل الموقع محلياً

```bash
npm install
npm start
```

ثم افتح:

- `http://localhost:3000`

## 2) إعداد وتشغيل بوت Discord

### إنشاء البوت
1. ادخل Discord Developer Portal.
2. أنشئ Application جديدة.
3. من قسم **Bot** أنشئ البوت وانسخ **Bot Token**.
4. فعّل Intent اسمها **Message Content Intent**.
5. اعزم البوت لسيرفرك بصلاحيات قراءة/إرسال رسائل.

### تشغيل البوت

Linux/macOS:
```bash
export DISCORD_BOT_TOKEN="PUT_YOUR_BOT_TOKEN_HERE"
npm run bot
```

Windows PowerShell:
```powershell
$env:DISCORD_BOT_TOKEN="PUT_YOUR_BOT_TOKEN_HERE"
npm run bot
```

## 3) أوامر البوت

- `!help` عرض المساعدة.
- `!link @user` إنشاء طلب ربط بين حسابين.
- `!accept CODE` قبول طلب الربط.
- `!my-links` عرض الحسابات المربوطة.

## 4) رفع المشروع على GitHub

```bash
git init
git add .
git commit -m "Initial lryxar app + discord bot"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

## 5) ملاحظات أمان

- لا تشارك `DISCORD_BOT_TOKEN` مع أي شخص.
- لا ترفع التوكن داخل الملفات أو GitHub.
- استخدم متغيرات البيئة فقط.
