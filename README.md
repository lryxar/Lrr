# lrrhub

منصة **lrrhub** لاستضافة وتشغيل بوتات Discord (Python) داخل Docker Containers معزولة — **بدون ذكاء اصطناعي**.

> المالك والحقوق: **l19r**

## المميزات
- رفع وتشغيل بوتات ديسكورد بشكل مستقل.
- Start / Stop / Logs لكل بوت.
- واجهة إلكترونية أبيض/أسود متطورة بتجربة حديثة (Landing + Auth + Dashboard).
- نشر سريع عبر Docker أو docker-compose.

## التشغيل المحلي
```bash
pip install -r requirements.txt
docker build -t discord-bot-runtime -f dockerfiles/bot.Dockerfile .
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

افتح:
- `http://127.0.0.1:8000/index.html`

## التحقق أنه شغال
```bash
curl http://127.0.0.1:8000/api/health
./scripts/smoke_test.sh
```

## النشر
```bash
docker compose up --build -d
```

## الحقوق
جميع الحقوق محفوظة لـ **l19r**.
