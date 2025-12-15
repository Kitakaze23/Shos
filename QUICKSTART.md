# Quick Start Guide

Get up and running with Fleet Cost Tracker in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Resend account (for emails) - [Sign up here](https://resend.com)

## Step 1: Clone and Install

```bash
# Install dependencies
npm install
```

## Step 2: Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and update these values:

```env
# Database - Update with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/fleet_cost_tracker?schema=public"

# NextAuth - The app URL (use http://localhost:3000 for local dev)
NEXTAUTH_URL="http://localhost:3000"

# NextAuth Secret - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

# Email Service - Get from Resend dashboard
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# Optional: OAuth (leave empty to disable)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

## Step 3: Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

## Step 4: Run the Application

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Create Your First Account

1. Click "Get Started" on the landing page
2. Fill in your details and sign up
3. Check your email for verification link
4. Click the verification link
5. Sign in with your credentials

## Troubleshooting

### Database Connection Issues

If you see database errors:
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database permissions

### Email Not Sending

If verification emails aren't arriving:
- Check your `RESEND_API_KEY` is correct
- Verify `EMAIL_FROM` domain is verified in Resend
- Check Resend dashboard for delivery status

### OAuth Not Working

If social login buttons are grayed out:
- This is expected if OAuth credentials aren't set
- Configure OAuth in `.env` to enable social login
- Or use email/password authentication

## Next Steps

- Explore the dashboard
- Update your profile
- Enable 2FA for extra security
- Create API keys for integrations
- Review your activity log

## Need Help?

- Check `README.md` for detailed documentation
- Review `IMPLEMENTATION.md` for technical details
- Open an issue if you encounter problems

## Production Deployment

When ready for production:

1. Set production environment variables
2. Run `npm run build` to build the app
3. Run `npx prisma migrate deploy` to apply migrations
4. Start with `npm start`
5. Set up reverse proxy (nginx, etc.)
6. Configure SSL/TLS
7. Set up monitoring and logging

Happy tracking! 🚀
