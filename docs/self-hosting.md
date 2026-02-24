# Self-Hosting Migration Guide

> Guide for migrating Strapi from Strapi Cloud to a self-hosted VPS (Hetzner recommended).

---

## Why Self-Host?

- **Strapi Cloud free tier is slow** and has limited resources
- **Cost-effective for agencies** — one VPS can host multiple Strapi instances for different clients
- **Full control** over database, media storage, backups, and performance
- **No vendor lock-in** — same Strapi code runs anywhere

---

## Recommended Architecture (Agency Setup)

For a marketing agency running multiple client CMS instances:

```
Hetzner VPS (CX22 or CX32, ~4-8 EUR/month)
├── Nginx (reverse proxy + SSL via Let's Encrypt)
├── PostgreSQL 16 (shared database server)
│   ├── vane_cms (database for Vanessa's CMS)
│   ├── client2_cms (database for another client)
│   └── ...
├── Strapi Instance 1 — vane-cms.yourdomain.com (port 1337)
├── Strapi Instance 2 — client2-cms.yourdomain.com (port 1338)
└── ...
```

**Process manager:** Use PM2 or Docker Compose to manage multiple Strapi instances.

**Recommended VPS specs:**
- **CX22** (2 vCPU, 4GB RAM, 40GB disk) — Good for 2-3 Strapi instances
- **CX32** (4 vCPU, 8GB RAM, 80GB disk) — Good for 5+ instances

**Keep this separate** from your AI chatbot server. Different workload profiles, simpler to manage, and avoids resource contention.

---

## Migration Steps

### 1. Provision the Server

```bash
# On your new Hetzner VPS (Ubuntu 22.04 or 24.04)
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx postgresql postgresql-contrib nodejs npm certbot python3-certbot-nginx

# Install Node.js 22.x (or use nvm)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Set Up PostgreSQL

```bash
# Create database and user
sudo -u postgres psql

CREATE USER vane_strapi WITH PASSWORD 'secure-password-here';
CREATE DATABASE vane_cms OWNER vane_strapi;
GRANT ALL PRIVILEGES ON DATABASE vane_cms TO vane_strapi;
\q
```

### 3. Clone and Configure Strapi

```bash
# Clone the CMS repo
cd /opt
sudo mkdir strapi && sudo chown $USER:$USER strapi
cd strapi
git clone https://github.com/3333444n/vane-website-cms.git vane-cms
cd vane-cms
npm install
```

### 4. Create Production .env

```bash
# /opt/strapi/vane-cms/.env
HOST=0.0.0.0
PORT=1337

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=vane_cms
DATABASE_USERNAME=vane_strapi
DATABASE_PASSWORD=secure-password-here
DATABASE_SSL=false

# Security keys — GENERATE NEW ONES for production!
# Use: openssl rand -base64 32
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=generate-random-salt
ADMIN_JWT_SECRET=generate-random-secret
TRANSFER_TOKEN_SALT=generate-random-salt
JWT_SECRET=generate-random-secret
ENCRYPTION_KEY=generate-random-key
```

**Generate secure keys:**
```bash
# Run this 6 times for each key/salt
openssl rand -base64 32
```

### 5. Build and Start

```bash
# Build the admin panel
npm run build

# Start with PM2
pm2 start npm --name "vane-cms" -- run start
pm2 save
pm2 startup  # Auto-start on reboot
```

### 6. Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/vane-cms
server {
    listen 80;
    server_name vane-cms.yourdomain.com;

    client_max_body_size 50M;  # For media uploads

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site and get SSL
sudo ln -s /etc/nginx/sites-available/vane-cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d vane-cms.yourdomain.com
```

### 7. Migrate Data from Strapi Cloud

Strapi has a built-in transfer feature:

```bash
# On local machine, transfer FROM Strapi Cloud TO your new server
npx strapi transfer --from https://meaningful-fitness-6cded77ff5.strapiapp.com/admin \
  --to https://vane-cms.yourdomain.com

# You'll need transfer tokens from both instances
# Generate in: Admin > Settings > Transfer Tokens
```

Alternatively, export/import content manually:
1. Export content from Strapi Cloud (Admin > Settings > Data Management)
2. Import into self-hosted instance

### 8. Update Frontend Environment

In the website project's `.env` and Vercel environment variables:

```env
# Old
STRAPI_URL=https://meaningful-fitness-6cded77ff5.strapiapp.com

# New
STRAPI_URL=https://vane-cms.yourdomain.com
```

**Also update:** CORS configuration in `config/middlewares.ts` if your domain changes.

### 9. Update CORS for New Domain

In `config/middlewares.ts`, add your new domain:

```typescript
{
  name: 'strapi::cors',
  config: {
    origin: [
      'http://localhost:4321',
      'http://localhost:3000',
      'https://vane-preview.vercel.app',
      /https:\/\/.*\.vercel\.app/,
      'https://vanessaramirezcoach.com',  // Production domain
      'https://vane-cms.yourdomain.com',  // Self-hosted CMS
    ],
  },
}
```

---

## Media Storage

### Local Storage (Default)

By default, Strapi stores uploads in `/public/uploads/`. This works for self-hosted setups.

**Backup strategy:** Include `/public/uploads/` in your backup script.

### S3-Compatible Storage (Optional, Recommended for Production)

For better reliability, use an S3-compatible provider:

```bash
npm install @strapi/provider-upload-aws-s3
```

Then configure in `config/plugins.ts`:

```typescript
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_ACCESS_SECRET'),
          },
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_BUCKET'),
          },
        },
      },
    },
  },
});
```

Hetzner Object Storage or Cloudflare R2 are cost-effective S3-compatible options.

---

## Backups

### Database Backup (Cron Job)

```bash
# /opt/strapi/backup.sh
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/opt/strapi/backups
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U vane_strapi vane_cms > $BACKUP_DIR/vane_cms_$TIMESTAMP.sql

# Backup uploads
tar -czf $BACKUP_DIR/vane_uploads_$TIMESTAMP.tar.gz /opt/strapi/vane-cms/public/uploads/

# Keep last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

```bash
# Add to crontab (daily at 3 AM)
crontab -e
0 3 * * * /opt/strapi/backup.sh
```

---

## Docker Compose Alternative

If you prefer Docker for managing multiple instances:

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: vane_cms
      POSTGRES_USER: vane_strapi
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  vane-cms:
    build: ./vane-cms
    ports:
      - "1337:1337"
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: vane_cms
      DATABASE_USERNAME: vane_strapi
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      # ... other env vars
    volumes:
      - vane_uploads:/opt/app/public/uploads
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
  vane_uploads:
```

---

## Monitoring

### PM2 Monitoring

```bash
pm2 status          # Check all instances
pm2 logs vane-cms   # View logs
pm2 monit           # Real-time monitoring
```

### Health Check

Add a simple health check endpoint or just verify the API responds:

```bash
curl -s https://vane-cms.yourdomain.com/api/homepage-quote | jq '.data'
```

---

## Scaling for Multiple Clients

When adding a new client's CMS:

1. Create a new PostgreSQL database
2. Clone their Strapi project to `/opt/strapi/client-name/`
3. Configure `.env` with the new database and unique ports
4. Add PM2 process: `pm2 start npm --name "client-cms" -- run start`
5. Add Nginx server block with their subdomain
6. Get SSL certificate with certbot

Each Strapi instance uses ~200-400MB RAM, so a 4GB VPS handles about 5-8 instances comfortably.
