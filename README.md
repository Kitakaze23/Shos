# Fleet Cost Tracker

Modern collaborative financial modeling platform for equipment/fleet cost tracking and expense allocation.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Shas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

### Using Docker Compose

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Run migrations:**
   ```bash
   npm run db:migrate:deploy
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## 📋 Features

### Phase 1: Authentication & User Management ✅
- Email/password authentication
- OAuth (Google, GitHub)
- Two-factor authentication (TOTP)
- User profile management
- Activity logging
- Account deletion with grace period

### Phase 2: Core Financial Calculator ✅
- Project management
- Equipment/Asset tracking with depreciation
- Operating parameters (fixed & variable costs)
- Team member management
- Real-time financial calculations
- Cost allocation methods

### Phase 3: Reports & Analysis ✅
- Monthly Summary Report
- Annual Forecast
- Depreciation Schedule
- Scenario Analysis
- Financial health score

### Phase 4: Mobile Experience ✅
- Responsive design
- Touch-friendly UI
- PWA support
- Mobile navigation
- Offline-ready

### Phase 5: Export & Reporting ✅
- PDF export
- Excel export
- CSV export
- Email reports

### Phase 6: Backend Architecture ✅
- Enhanced database schema
- Error handling
- Caching system
- Audit logging
- Project sharing

### Phase 7: Frontend Architecture ✅
- React Query for state management
- Context API for local state
- Framer Motion animations
- Performance optimizations
- Design system

### Phase 8: Deployment & DevOps ✅
- Vercel deployment configuration
- Docker support
- CI/CD pipeline
- Database migrations
- Environment management

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Authentication:** NextAuth.js v4
- **Database:** PostgreSQL with Prisma ORM
- **State Management:** React Query + Context API
- **Animations:** Framer Motion
- **Email:** Resend
- **2FA:** Speakeasy (TOTP)
- **Calculations:** Decimal.js
- **Charts:** Recharts
- **PDF Export:** jsPDF
- **Excel Export:** ExcelJS
- **CSV Export:** PapaParse

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Protected dashboard pages
├── components/            # React components
│   ├── common/            # Reusable components
│   ├── ui/                # UI components (shadcn/ui)
│   └── [feature]/         # Feature-specific components
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── calculations.ts   # Financial calculations
│   ├── reports.ts        # Report generation
│   ├── exports/          # Export utilities
│   ├── errors.ts         # Error handling
│   ├── cache.ts          # Caching utilities
│   └── audit.ts         # Audit logging
├── prisma/               # Prisma schema and migrations
├── scripts/              # Utility scripts
├── types/                # TypeScript types
└── utils/                # Utility functions
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:migrate       # Create and apply migrations
npm run db:migrate:deploy # Apply migrations (production)
npm run db:migrate:status # Check migration status
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Docker
npm run docker:build     # Build Docker image
npm run docker:run      # Run Docker container
npm run docker:up        # Start Docker Compose
npm run docker:down      # Stop Docker Compose
npm run docker:logs      # View Docker logs

# Utilities
npm run setup            # Setup development environment
npm run migrate          # Run migration script
```

## 🌐 Deployment

### Frontend (Vercel)

1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Backend (Railway/Render)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`

Or use Docker:
```bash
docker build -t sharedasset-app .
docker run -p 3000:3000 sharedasset-app
```

## 🔐 Environment Variables

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret key (generate with `openssl rand -base64 32`)
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - Email address for sending emails

See `.env.example` for all available variables.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e           # E2E tests (Cypress)
npm run test:performance   # Performance tests (Lighthouse)

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## 📚 Documentation

- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [Frontend Architecture](./FRONTEND_ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security & Compliance](./SECURITY.md)
- [Testing Strategy](./TESTING.md)
- [Monitoring & Analytics](./MONITORING.md)
- [Documentation](./DOCUMENTATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

[Your License Here]

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

---

Built with ❤️ using Next.js, TypeScript, and Prisma
