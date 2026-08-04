#!/bin/bash
# ─── AI Agent Platform — Contabo VPS Setup Script ────────────────────────────
# Run this ONCE on your Contabo server to set everything up
# Usage: bash deploy.sh

set -e

DOMAIN="souqratesignal.online"
APP_DIR="/opt/ai-agent-platform"
GITHUB_REPO="YOUR_GITHUB_USERNAME/ai-agent-platform"  # Change this!

echo "🚀 Setting up AI Agent Platform on Contabo VPS"
echo "Domain: $DOMAIN"
echo ""

# ── 1. Update system ─────────────────────────────────────────────────────────
echo "📦 Updating system..."
apt-get update -y && apt-get upgrade -y

# ── 2. Install Docker ─────────────────────────────────────────────────────────
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Docker $(docker --version)"
echo "✅ Docker Compose $(docker-compose --version)"

# ── 3. Install Certbot (SSL) ──────────────────────────────────────────────────
echo "🔒 Installing Certbot for SSL..."
apt-get install -y certbot

# ── 4. Clone project ──────────────────────────────────────────────────────────
echo "📥 Cloning project..."
mkdir -p $APP_DIR
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR && git pull origin main
else
    git clone https://github.com/$GITHUB_REPO $APP_DIR
    cd $APP_DIR
fi

# ── 5. Setup environment ──────────────────────────────────────────────────────
if [ ! -f "$APP_DIR/.env.production" ]; then
    echo ""
    echo "⚠️  IMPORTANT: Create your .env.production file!"
    echo "   cp $APP_DIR/.env.production.example $APP_DIR/.env.production"
    echo "   nano $APP_DIR/.env.production"
    echo ""
    echo "Fill in: DATABASE_URL (Supabase), ANTHROPIC_API_KEY, DEEPSEEK_API_KEY, JWT_SECRET"
    echo "Then run: bash $APP_DIR/deploy.sh again"
    exit 1
fi

# ── 6. Get SSL Certificate ────────────────────────────────────────────────────
echo "🔒 Getting SSL certificate for $DOMAIN..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    # Temporarily stop nginx if running
    docker-compose -f $APP_DIR/docker-compose.yml stop nginx 2>/dev/null || true
    
    certbot certonly --standalone \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN
    
    echo "✅ SSL certificate obtained!"
else
    echo "✅ SSL certificate already exists"
fi

# ── 7. Start application ──────────────────────────────────────────────────────
echo "🚀 Starting application..."
cd $APP_DIR
docker-compose down 2>/dev/null || true
docker-compose build
docker-compose up -d

# ── 8. Setup auto-renewal for SSL ────────────────────────────────────────────
echo "🔄 Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f $APP_DIR/docker-compose.yml restart nginx") | crontab -

# ── 9. Setup auto-start on reboot ────────────────────────────────────────────
echo "🔄 Setting up auto-start on reboot..."
cat > /etc/systemd/system/ai-agent-platform.service << EOF
[Unit]
Description=AI Agent Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ai-agent-platform

echo ""
echo "✅ ═══════════════════════════════════════════════════"
echo "✅  AI Agent Platform is running!"
echo "✅  URL: https://$DOMAIN"
echo "✅  Logs: docker-compose -f $APP_DIR/docker-compose.yml logs -f"
echo "✅ ═══════════════════════════════════════════════════"

