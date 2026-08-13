#!/usr/bin/env bash
# Contabo Ubuntu VPS bootstrap: Node 20, PostgreSQL, Nginx, Certbot, PM2, firewall.
# Run as root on a fresh Ubuntu 22.04/24.04 VPS:
#   bash scripts/contabo-setup.sh
set -euo pipefail

APP_USER="${APP_USER:-deploy}"
APP_DIR="${APP_DIR:-/var/www/lazer}"
DB_NAME="${DB_NAME:-lazer}"
DB_USER="${DB_USER:-lazer}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 24)}"
NODE_MAJOR="${NODE_MAJOR:-20}"

export DEBIAN_FRONTEND=noninteractive

echo "==> Updating system packages"
apt-get update -y
apt-get upgrade -y
apt-get install -y curl ca-certificates gnupg ufw git build-essential nginx certbot python3-certbot-nginx

echo "==> Configuring firewall (22/80/443)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Installing Node.js ${NODE_MAJOR}"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" != "$NODE_MAJOR" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
npm install -g pm2

echo "==> Installing PostgreSQL"
apt-get install -y postgresql postgresql-contrib

echo "==> Creating database role and database"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

# Postgres 15+: grant schema usage for app user
sudo -u postgres psql -d "${DB_NAME}" -v ON_ERROR_STOP=1 <<SQL
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
SQL

echo "==> Creating app user and directory"
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$APP_USER"
fi
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}?schema=public"
JWT_SECRET="$(openssl rand -base64 48)"

ENV_FILE="${APP_DIR}/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SWAGGER_PATH=api/docs
MAX_IMPORT_FILE_SIZE_MB=10
LOYALTY_VISITS_BEFORE_FREE_ZONE=6
EOF
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
fi

NGINX_SITE="/etc/nginx/sites-available/lazer"
if [[ ! -f "$NGINX_SITE" ]]; then
  cat > "$NGINX_SITE" <<'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
  ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/lazer
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
fi

cat <<EOF

========================================
Contabo bootstrap complete
========================================
App dir:       ${APP_DIR}
App user:      ${APP_USER}
Database:      ${DB_NAME}
DB user:       ${DB_USER}
DB password:   ${DB_PASSWORD}
DATABASE_URL:  ${DATABASE_URL}
Env file:      ${ENV_FILE}

IMPORTANT: Copy the DB password and JWT from ${ENV_FILE} to a password manager.

Next (after code is ready):
  1. Clone repo into ${APP_DIR}
  2. npm ci && npx prisma migrate deploy && npm run build
  3. npm run seed:admin -- admin@example.com 'StrongPass!' 'Admin'
  4. pm2 start dist/main.js --name lazer-api && pm2 save && pm2 startup
  5. DNS A record → this VPS, then: certbot --nginx -d your.domain.com
========================================
EOF
