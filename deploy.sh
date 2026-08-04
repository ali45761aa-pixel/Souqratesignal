#!/bin/bash
# ─── AI Agent Platform — Contabo VPS Setup Script ────────────────────────────
# Server: 194.163.155.52 (shared with SouqrateX)
# Domain: souqratesignal.online
# Run this ONCE on your Contabo server
# Usage: bash deploy.sh

set -e

DOMAIN="souqratesignal.online"
APP_DIR="/opt/ai-agent-platform"
NGINX_CONF="/etc/nginx/sites-available/ai-agent-platform"

echo "🚀 Setting up AI Agent Platform on Contabo VPS"
echo "Domain: $DOMAIN | Server: 194.163.155.52"
echo ""

# ── 1. Install Docker if not installed ───────────────────────────────────────
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi
echo "✅ Docker $(docker --version)"

# ── 2. Clone or update project ────────────────────────────────────────────────
echo "📥 Setting up project..."
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR && git pull origin main
else
    git clone https://github.com/YOUR_USERNAME/ai-agent-platform $APP_DIR
    cd $APP_DIR
fi

# ── 3. Check .env.production ─────────────────────────────────────────────────
if [ ! -f "$APP_DIR/.env.production" ]; then
    cp $APP_DIR/.env.production.example $APP_DIR/.env.production
    echo ""
    echo "⚠️  IMPORTANT: Fill in your .env.production file!"
    echo "   nano $APP_DIR/.env.production"
    echo ""
    echo "Required values:"
    echo "  DATABASE_URL=postgresql://... (from Supabase)"
    echo "  JWT_SECRET=random_64_char_string"
    echo "  ANTHROPIC_API_KEY=sk-ant-..."
    echo "  DEEPSEEK_API_KEY=sk-..."
    echo ""
    echo "After filling, run: bash $APP_DIR/deploy.sh again"
    exit 1
fi

# ── 4. Get SSL Certificate for souqratesignal.online ─────────────────────────
echo "🔒 Setting up SSL for $DOMAIN..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi

if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    # Temporarily stop nginx to get certificate
    systemctl stop nginx
    certbot certonly --standalone \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN
    systemctl start nginx
    echo "✅ SSL certificate obtained!"
else
    echo "✅ SSL certificate already exists"
fi

# ── 5. Add Nginx virtual host for AI Agent Platform ──────────────────────────
echo "⚙️  Configuring Nginx virtual host..."
cat > $NGINX_CONF << 'NGINXEOF'
# AI Agent Platform — souqratesignal.online
server {
    listen 80;
    server_name souqratesignal.online www.souqratesignal.online;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name souqratesignal.online www.souqratesignal.online;

    ssl_certificate     /etc/letsencrypt/live/souqratesignal.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/souqratesignal.online/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    client_max_body_size 50M;

    # Main proxy to Node.js app
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # SSE streaming for AI agents
    location /api/agents/execute-step {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Connection '';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_buffering    off;
        proxy_cache        off;
        proxy_read_timeout 600s;
        chunked_transfer_encoding on;
    }
}
NGINXEOF

# Enable the site
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/ai-agent-platform

# Test and reload Nginx
nginx -t && systemctl reload nginx
echo "✅ Nginx configured for $DOMAIN"

# ── 6. Start Docker containers ────────────────────────────────────────────────
echo "🚀 Starting AI Agent Platform..."
cd $APP_DIR
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Wait for startup
sleep 10
docker-compose ps

# ── 7. Setup SSL auto-renewal ─────────────────────────────────────────────────
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | sort -u | crontab -

echo ""
echo "✅ ═══════════════════════════════════════════════════"
echo "✅  AI Agent Platform is LIVE!"
echo "✅  URL: https://$DOMAIN"
echo "✅  Logs: docker-compose -f $APP_DIR/docker-compose.yml logs -f"
echo "✅ ═══════════════════════════════════════════════════"
