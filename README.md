# 🤖 AI Agent Platform

منصة وكيل ذكاء اصطناعي متكاملة ومستقلة — تعمل كوكالة رقمية آلية. كل شيء يعمل من خلال برومبت واحد، والنتيجة مشروع كامل جاهز للاستخدام.

## 🚀 الميزات الرئيسية

- **واجهة محادثة ذكية** مع دعم العربية والإنجليزية (RTL/LTR)
- **11 وكيل متخصص**: تخطيط، برمجة، تصميم، محتوى، بوتات، كتابة، فحص، بحث، تسويق، ألعاب، دفع
- **نظام دفع متكامل**: USDT (TRC20/BEP20/ERC20), TRX, BTC, ETH, TON, BNB + Stripe + Paymob
- **مراقبة المحافظ** كل 30 ثانية مع نظام Memo للمطابقة
- **30+ قالب احترافي**: مواقع، متاجر، بوتات، ألعاب، SaaS
- **لوحة تحكم** مع إحصائيات وتقارير دورية
- **إدارة API Keys** لـ 17 خدمة مختلفة
- **نظام CRM** لإدارة العملاء والفواتير والتذاكر
- **Dark Theme** افتراضي مع دعم Light Mode

## 📋 متطلبات التشغيل

- Node.js 22+
- PostgreSQL 16+ (أو Supabase)
- Redis 7+ (اختياري للـ cache)

## ⚡ التشغيل السريع

```bash
# 1. نسخ المتغيرات
cp .env.example .env
# 2. تعديل .env بمعلوماتك
# 3. تثبيت المكتبات
pnpm install
# 4. إنشاء قاعدة البيانات
psql $DATABASE_URL < drizzle/migrations/001_init.sql
# 5. تشغيل المشروع
pnpm dev
```

## 🐳 النشر بـ Docker (Contabo VPS)

```bash
# 1. نسخ وتعديل .env
cp .env.example .env
# 2. تشغيل كل الخدمات
docker-compose up -d
# 3. المنصة تعمل على http://localhost:3000
```

## 🔑 المتغيرات المطلوبة

| المتغير | الوصف | مطلوب |
|---------|-------|--------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | مفتاح تشفير الجلسات | ✅ |
| `ANTHROPIC_API_KEY` | Claude AI | للـ AI |
| `OPENAI_API_KEY` | GPT-4o | للـ AI |
| `STRIPE_SECRET_KEY` | مدفوعات Stripe | للدفع |
| `WALLET_USDT_TRC20` | محفظة USDT | للـ Crypto |

## 📁 هيكل المشروع

```
├── client/src/
│   ├── pages/          # صفحات المنصة
│   ├── components/     # مكونات قابلة للإعادة
│   ├── contexts/       # React contexts (Lang, Theme)
│   └── lib/            # مكتبات مساعدة (i18n, trpc)
├── server/
│   ├── routers/        # tRPC routers (chat, projects, admin, payments, crm, templates)
│   ├── cron/           # Cron Jobs (wallet monitor, reports)
│   └── _core/          # Server infrastructure
├── drizzle/
│   ├── schema.ts       # Database schema
│   └── migrations/     # SQL migrations
├── Dockerfile          # Production Docker image
├── docker-compose.yml  # Full stack deployment
└── README.md
```

## 🌐 الصفحات المتاحة

| الصفحة | الرابط | الوصف |
|--------|--------|-------|
| الرئيسية | `/` | Landing page |
| المحادثة | `/chat` | Chat interface |
| لوحة التحكم | `/dashboard` | Dashboard |
| المشاريع | `/projects` | Projects list |
| القوالب | `/templates` | Templates library |
| الإدارة | `/admin` | Admin panel + API keys |
| الدفع | `/payments` | Payment system |
| العملاء | `/crm` | CRM |
| الإعدادات | `/settings` | Settings |

## 🔒 الأمان

- جميع مفاتيح API مشفرة في قاعدة البيانات
- JWT للمصادقة
- Rate limiting على API endpoints
- CORS محدد
- SSL عبر Let's Encrypt (في docker-compose)

## 📊 الاختبارات

```bash
pnpm test
# 16 tests passing ✅
```
