# 🚀 دليل النشر على Contabo — souqratesignal.online

## المتطلبات
- سيرفر Contabo (Ubuntu 20.04/22.04/24.04)
- دومين: `souqratesignal.online` (DNS على Cloudflare)
- حساب Supabase (قاعدة البيانات)
- حساب GitHub (للكود)

---

## الخطوة 1: إعداد Supabase

### 1.1 إنشاء الجداول
1. اذهب إلى [app.supabase.com](https://app.supabase.com)
2. افتح مشروعك → **SQL Editor**
3. انسخ محتوى ملف `drizzle/migrations/supabase_migration.sql` والصقه
4. اضغط **Run** — ستُنشأ 21 جدول تلقائياً

### 1.2 الحصول على Connection String
1. **Project Settings** → **Database** → **Connection string** → **URI**
2. انسخ الـ URI (يبدأ بـ `postgresql://`)
3. ستحتاجه في الخطوة 3

---

## الخطوة 2: رفع الكود على GitHub

### من Manus (الأسهل):
1. في لوحة Manus → **Code** → **GitHub** → **Export to GitHub**
2. اختر اسم المستودع: `ai-agent-platform`
3. اختر **Private**
4. اضغط Export

### أو من Terminal:
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/ai-agent-platform.git
git add .
git commit -m "Initial deployment"
git push -u origin main
```

---

## الخطوة 3: إعداد Contabo Server

### 3.1 الاتصال بالسيرفر
```bash
ssh root@YOUR_CONTABO_IP
```

### 3.2 تشغيل سكريبت الإعداد التلقائي
```bash
# تحميل وتشغيل سكريبت الإعداد
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/ai-agent-platform/main/deploy.sh | bash
```

**أو يدوياً:**
```bash
# 1. تثبيت Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# 2. تثبيت Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 3. استنساخ المشروع
git clone https://github.com/YOUR_USERNAME/ai-agent-platform /opt/ai-agent-platform
cd /opt/ai-agent-platform
```

### 3.3 إنشاء ملف البيئة
```bash
cp .env.production.example .env.production
nano .env.production
```

**القيم الإلزامية:**
```env
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
JWT_SECRET=اكتب_هنا_نص_عشوائي_طويل_64_حرف
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
```

---

## الخطوة 4: إعداد DNS في Cloudflare

### 4.1 تغيير A Record
1. اذهب إلى [dash.cloudflare.com](https://dash.cloudflare.com)
2. اختر `souqratesignal.online`
3. **DNS** → **Records**
4. احذف الـ A records الحالية
5. أضف:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `YOUR_CONTABO_IP` | 🟠 Proxied |
| A | `www` | `YOUR_CONTABO_IP` | 🟠 Proxied |

### 4.2 إعداد SSL في Cloudflare
1. **SSL/TLS** → **Overview** → اختر **Full (strict)**
2. **SSL/TLS** → **Edge Certificates** → فعّل **Always Use HTTPS**

---

## الخطوة 5: الحصول على SSL Certificate

```bash
# على السيرفر
apt-get install -y certbot

# احصل على شهادة SSL
certbot certonly --standalone \
  -d souqratesignal.online \
  -d www.souqratesignal.online \
  --non-interactive \
  --agree-tos \
  --email admin@souqratesignal.online
```

> **ملاحظة:** إذا كنت تستخدم Cloudflare Proxy (🟠)، يمكنك استخدام **Cloudflare Origin Certificate** بدلاً من Let's Encrypt.

---

## الخطوة 6: تشغيل التطبيق

```bash
cd /opt/ai-agent-platform

# بناء وتشغيل الـ containers
docker-compose up -d --build

# التحقق من أن كل شيء يعمل
docker-compose ps
docker-compose logs -f app
```

### التحقق من النجاح:
```bash
# اختبار محلي
curl http://localhost:3000/api/health

# اختبار الدومين
curl https://souqratesignal.online/api/health
```

---

## الخطوة 7: إعداد GitHub Actions للنشر التلقائي

### 7.1 إضافة SSH Key
```bash
# على السيرفر — إنشاء SSH key
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# انسخ المفتاح الخاص
cat ~/.ssh/github_deploy
```

### 7.2 إضافة Secrets في GitHub
اذهب إلى: **GitHub Repo** → **Settings** → **Secrets and variables** → **Actions**

أضف:
| Secret | Value |
|--------|-------|
| `SERVER_HOST` | IP سيرفر Contabo |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | محتوى `~/.ssh/github_deploy` |
| `SERVER_PORT` | `22` |

### 7.3 الآن كل push على main سيُنشر تلقائياً! 🎉

---

## أوامر مفيدة

```bash
# عرض logs
docker-compose logs -f app

# إعادة تشغيل
docker-compose restart app

# تحديث يدوي
cd /opt/ai-agent-platform && git pull && docker-compose up -d --build

# إيقاف
docker-compose down

# مساحة القرص
docker system df
```

---

## استكشاف الأخطاء

### المنصة لا تعمل على الدومين
```bash
# تحقق من Nginx
docker-compose logs nginx

# تحقق من SSL
ls /etc/letsencrypt/live/souqratesignal.online/
```

### خطأ في قاعدة البيانات
```bash
# تحقق من DATABASE_URL في .env.production
docker-compose exec app env | grep DATABASE
```

### منفذ 80/443 مشغول
```bash
# تحقق من العمليات على المنافذ
netstat -tlnp | grep -E ':80|:443'
# أوقف Apache/Nginx القديم إن وجد
systemctl stop apache2 nginx 2>/dev/null
```
