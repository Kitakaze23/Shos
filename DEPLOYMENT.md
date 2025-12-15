# Deployment Guide

## Phase 8: Deployment & DevOps ✅

### Overview

This guide covers deploying the Fleet Cost Tracker application to production using Vercel (frontend) and Railway/Render (backend).

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for local development)
- GitHub account
- Vercel account
- Railway or Render account
- PostgreSQL database (managed or self-hosted)
- Redis (optional, for caching)

---

## 1. Frontend Deployment (Vercel)

### Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link your project:**
   ```bash
   vercel link
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
RESEND_API_KEY=your-resend-key
EMAIL_FROM=noreply@yourdomain.com
REDIS_URL=redis://... (optional)
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Configuration

The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Framework: Next.js
- Security headers
- API rewrites

---

## 2. Backend Deployment (Docker + Railway/Render)

### Option A: Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   railway init
   ```

4. **Add services:**
   - PostgreSQL database
   - Redis (optional)
   - Your application

5. **Set environment variables** in Railway dashboard

6. **Deploy:**
   ```bash
   railway up
   ```

### Option B: Render

1. **Create a new Web Service** in Render dashboard

2. **Connect your GitHub repository**

3. **Configure:**
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Environment: Node

4. **Add PostgreSQL database** service

5. **Set environment variables**

6. **Deploy**

### Docker Deployment

**Build image:**
```bash
docker build -t sharedasset-app .
```

**Run container:**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  sharedasset-app
```

---

## 3. Local Development with Docker Compose

### Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env`** with your configuration

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations:**
   ```bash
   npm run db:migrate:deploy
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

---

## 4. Database Migrations

### Prisma Migrations

**Create a new migration:**
```bash
npm run db:migrate
# or
npx prisma migrate dev --name migration_name
```

**Apply migrations in production:**
```bash
npm run db:migrate:deploy
# or
npx prisma migrate deploy
```

**Check migration status:**
```bash
npm run db:migrate:status
# or
npx prisma migrate status
```

**Using migration script:**
```bash
./scripts/migrate.sh up        # Apply migrations
./scripts/migrate.sh down      # Rollback last migration
./scripts/migrate.sh create    # Create new migration
./scripts/migrate.sh status    # Check status
```

### Migration Best Practices

1. **Always test migrations locally first**
2. **Backup database before production migrations**
3. **Use descriptive migration names**
4. **Review generated SQL before applying**
5. **Run migrations during maintenance windows for large changes**

---

## 5. CI/CD Pipeline (GitHub Actions)

### Setup

1. **Add GitHub Secrets:**
   - `VERCEL_TOKEN` - Get from Vercel dashboard
   - `VERCEL_ORG_ID` - Get from Vercel dashboard
   - `VERCEL_PROJECT_ID` - Get from Vercel dashboard
   - `RAILWAY_TOKEN` - Get from Railway CLI: `railway whoami`

2. **Workflows:**
   - `ci.yml` - Runs on every push/PR (lint, type-check, test, build)
   - `deploy.yml` - Deploys to production on main branch

### Workflow Steps

1. **Lint** - ESLint checks
2. **Type Check** - TypeScript validation
3. **Test** - Run test suite (if configured)
4. **Build** - Build Next.js application
5. **Deploy Frontend** - Deploy to Vercel
6. **Deploy Backend** - Deploy to Railway

### Manual Deployment

Trigger manual deployment:
```bash
gh workflow run deploy.yml
```

---

## 6. Environment Variables

### Required Variables

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)
- `RESEND_API_KEY` - Resend API key for emails
- `EMAIL_FROM` - Email address for sending emails

**Frontend (Public):**
- `NEXT_PUBLIC_API_URL` - API endpoint URL
- `NEXT_PUBLIC_APP_URL` - Application URL

### Optional Variables

- `REDIS_URL` - Redis connection string (for caching)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `NEXT_PUBLIC_GTAG` - Google Analytics
- `SENTRY_DSN` - Sentry error tracking

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT secret
openssl rand -hex 32
```

---

## 7. Production Checklist

### Pre-Deployment

- [ ] All environment variables set
- [ ] Database migrations tested
- [ ] Build succeeds locally
- [ ] Tests pass
- [ ] Security headers configured
- [ ] Error tracking set up (Sentry)
- [ ] Monitoring configured
- [ ] Backup strategy in place

### Post-Deployment

- [ ] Verify application loads
- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Test email sending
- [ ] Verify API endpoints
- [ ] Check mobile responsiveness

---

## 8. Monitoring & Maintenance

### Logs

**Vercel:**
- View logs in Vercel dashboard → Deployments → Logs

**Railway:**
- View logs: `railway logs`
- Or in Railway dashboard

**Docker:**
```bash
docker-compose logs -f app
```

### Health Checks

Add health check endpoint:
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

### Database Backups

**Automated backups:**
- Railway: Automatic daily backups
- Render: Automatic backups
- Self-hosted: Use `pg_dump` in cron job

**Manual backup:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

---

## 9. Troubleshooting

### Common Issues

**Build fails:**
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

**Database connection fails:**
- Verify DATABASE_URL format
- Check database is accessible
- Verify network/firewall rules

**Migrations fail:**
- Check database permissions
- Verify migration files are correct
- Review migration status

**Environment variables not working:**
- Restart application after adding variables
- Verify variable names match code
- Check for typos

---

## 10. Scaling

### Horizontal Scaling

- Use load balancer
- Multiple application instances
- Database connection pooling
- Redis for session storage

### Vertical Scaling

- Increase database resources
- Increase application resources
- Optimize queries
- Add caching layer

---

## Support

For deployment issues:
1. Check logs
2. Review environment variables
3. Verify database connectivity
4. Check GitHub Actions workflow status
5. Review Vercel/Railway status pages
