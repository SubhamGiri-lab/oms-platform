# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for manual deployment)
- PostgreSQL 12+ (for manual deployment)
- Nginx (for reverse proxy)
- SSL certificates (Let's Encrypt recommended)

## Docker Deployment (Recommended)

### 1. Prepare Environment

```bash
cd oms-project

# Copy and update environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with production values
nano backend/.env
nano frontend/.env
```

### 2. Build and Start Services

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run db:migrate

# Seed sample data (optional)
docker-compose exec backend npm run db:seed
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- pgAdmin: http://localhost:5050 (admin@admin.com / admin)

## Production Deployment

### 1. SSL/HTTPS Configuration

```bash
# Generate SSL certificate with Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com

# Create .env with HTTPS enabled
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### 2. Nginx Configuration

Create `/etc/nginx/sites-available/oms`:

```nginx
upstream backend {
  server backend:5000;
}

upstream frontend {
  server frontend:3000;
}

server {
  listen 80;
  server_name api.yourdomain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

server {
  listen 80;
  server_name yourdomain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  location / {
    proxy_pass http://frontend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 3. Enable Nginx Configuration

```bash
sudo ln -s /etc/nginx/sites-available/oms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Auto-Renewal of SSL Certificates

```bash
sudo certbot renew --dry-run
sudo systemctl enable certbot.timer
```

## Environment Variables for Production

### Backend (.env)

```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://produser:strongpassword@postgres-host:5432/oms_prod
JWT_SECRET=generate-strong-random-key-here
FRONTEND_URL=https://yourdomain.com
LOG_LEVEL=info
```

### Frontend (.env)

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Database Setup (Manual)

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE oms_prod;

-- Create user
CREATE USER oms_user WITH PASSWORD 'strong_password_here';

-- Grant privileges
ALTER ROLE oms_user SET client_encoding TO 'utf8';
ALTER ROLE oms_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE oms_user SET default_transaction_deferrable TO on;
ALTER ROLE oms_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE oms_prod TO oms_user;

-- Connect to new database
\c oms_prod

-- Enable extensions
CREATE EXTENSION uuid-ossp;
```

## Monitoring and Maintenance

### Docker Logs

```bash
# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

### Database Backups

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres oms_db > backup-$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U postgres oms_db < backup-20240215.sql
```

### Health Checks

```bash
# Check backend health
curl http://localhost:5000/health

# Check database connection
docker-compose exec backend npm run db:check
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing** - Use nginx or AWS ELB
2. **Database** - Use PostgreSQL replication/clustering
3. **Session Management** - Store sessions in Redis
4. **File Storage** - Use AWS S3 for uploads

### Performance Optimization

1. **Caching** - Implement Redis caching layer
2. **CDN** - Use CloudFlare or AWS CloudFront
3. **Database Optimization** - Add appropriate indexes
4. **API Throttling** - Implement rate limiting

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Keep dependencies updated
- [ ] Implement WAF rules
- [ ] Set up monitoring and alerting
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
docker-compose exec backend npm run db:check

# View logs
docker-compose logs postgres
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Restart services
docker-compose restart backend frontend
```

### Slow Queries

```bash
# Enable query logging
docker-compose exec postgres psql -U postgres -d oms_db -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"

# View slow query log
docker-compose exec postgres tail /var/log/postgresql/postgresql.log
```

## Disaster Recovery

### Full System Recovery

1. Restore database backup
2. Rebuild Docker images
3. Pull latest code from repository
4. Run migrations if needed
5. Restore configuration files
6. Start services
7. Verify all systems online

### RTO/RPO Targets

- **RTO (Recovery Time Objective)**: 30 minutes
- **RPO (Recovery Point Objective)**: 1 hour

## Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Review environment variables
3. Test connectivity between services
4. Verify firewall rules
5. Check resource availability
