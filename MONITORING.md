# Monitoring & Analytics

## Phase 11: Monitoring & Analytics ✅

### Overview

Comprehensive monitoring and analytics system for tracking application performance, errors, user behavior, and system metrics.

### Implemented Features

#### 1. Error Tracking (Sentry)

**Configuration:**
- ✅ Client-side error tracking
- ✅ Server-side error tracking
- ✅ Edge runtime support
- ✅ Session replay
- ✅ Source maps support
- ✅ User context tracking
- ✅ Sensitive data filtering

**Setup:**
```typescript
// Automatically initialized via sentry.client.config.ts
// and sentry.server.config.ts
```

**Usage:**
```typescript
import * as Sentry from "@sentry/nextjs"

// Capture exception
Sentry.captureException(error)

// Capture message
Sentry.captureMessage("Something went wrong")

// Set user context
Sentry.setUser({ id: userId, email: userEmail })
```

#### 2. Analytics (Google Analytics 4)

**Configuration:**
- ✅ Google Analytics 4 integration
- ✅ Page view tracking
- ✅ Event tracking
- ✅ User property tracking
- ✅ Custom events

**Events Tracked:**
- User authentication (sign up, login, logout)
- Project management (create, update, delete)
- Equipment management (add, update)
- Report generation and export
- Team member management
- Feature usage

**Usage:**
```typescript
import { analytics } from "@/lib/analytics"

// Track events
analytics.projectCreated(projectId, equipmentCount)
analytics.reportExported("monthly", "pdf", projectId)
analytics.featureUsed("scenario_analysis")
```

#### 3. Performance Monitoring

**Metrics Tracked:**
- ✅ API response times (P50, P95, P99)
- ✅ Request counts by endpoint
- ✅ Error rates
- ✅ Average response time
- ✅ Endpoint-specific metrics

**Implementation:**
- Middleware for automatic tracking
- In-memory storage (Redis-ready)
- Percentile calculations
- Time-based filtering

#### 4. System Statistics

**User Stats:**
- Total users
- Active users (last 30 days)
- New users (last 30 days)

**Project Stats:**
- Total projects
- Projects with equipment
- Recent projects (last 30 days)

**Report Stats:**
- Report generations (last 30 days)

**Feature Usage:**
- Top 10 most used features
- Usage counts by feature

#### 5. Monitoring Dashboard

**Features:**
- Real-time metrics display
- Performance charts
- Error breakdown
- System statistics
- Feature usage analytics
- Time period selection (1h, 24h, 7d, 30d)
- Auto-refresh (every minute)

**Access:**
- `/dashboard/admin/monitoring`
- Admin-only access
- Configured via `ADMIN_EMAILS` environment variable

### Files Created

- `sentry.client.config.ts` - Sentry client configuration
- `sentry.server.config.ts` - Sentry server configuration
- `sentry.edge.config.ts` - Sentry edge configuration
- `lib/analytics.ts` - Google Analytics utilities
- `lib/monitoring.ts` - Performance monitoring utilities
- `lib/tracking.ts` - Combined tracking utilities
- `middleware-performance.ts` - Performance middleware
- `components/analytics/google-analytics.tsx` - GA4 component
- `app/api/admin/metrics/route.ts` - Metrics API endpoint
- `app/dashboard/admin/monitoring/page.tsx` - Monitoring dashboard

### Environment Variables

**Sentry:**
```
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**Google Analytics:**
```
NEXT_PUBLIC_GTAG=G-XXXXXXXXXX
```

**Admin Access:**
```
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Monitoring Dashboard

**Key Metrics:**
- Total Requests
- Average Response Time
- Error Rate
- Active Users

**Charts:**
- Response Time Percentiles (P50, P95, P99)
- Requests by Endpoint
- Feature Usage
- Errors by Endpoint

**Tabs:**
1. **Performance** - Response times and request counts
2. **Errors** - Error breakdown by endpoint
3. **Statistics** - User, project, and report stats
4. **Feature Usage** - Most used features

### Event Tracking

**User Events:**
- `sign_up` - User registration
- `login` - User login
- `logout` - User logout

**Project Events:**
- `project_created` - New project
- `project_updated` - Project update
- `project_deleted` - Project deletion

**Equipment Events:**
- `equipment_added` - New equipment
- `equipment_updated` - Equipment update

**Report Events:**
- `report_generated` - Report generation
- `report_exported` - Report export (PDF/Excel/CSV)

**Team Events:**
- `member_added` - Team member added
- `member_removed` - Team member removed

**Feature Events:**
- `feature_used` - Feature usage tracking

### Performance Targets

**Response Times:**
- P50: < 200ms
- P95: < 500ms
- P99: < 1000ms

**Error Rate:**
- Target: < 1%
- Alert: > 5%

**Availability:**
- Target: 99.9%
- Uptime monitoring via Sentry

### Integration Points

**Automatic Tracking:**
- API routes (via middleware)
- Page views (via Google Analytics)
- Errors (via Sentry)

**Manual Tracking:**
- User actions (via analytics utilities)
- Feature usage (via analytics.featureUsed)
- Custom events (via trackEvent)

### Best Practices

1. **Error Tracking:**
   - Don't log sensitive data
   - Use appropriate error levels
   - Include context (user, action, etc.)

2. **Analytics:**
   - Track meaningful events
   - Use consistent naming
   - Include relevant metadata

3. **Performance:**
   - Monitor slow endpoints
   - Track database query times
   - Monitor external API calls

4. **Privacy:**
   - Anonymize user data
   - Respect user consent
   - Comply with GDPR/CCPA

### Setup Instructions

1. **Sentry:**
   ```bash
   # Install Sentry CLI
   npm install -g @sentry/cli
   
   # Configure DSN in .env
   SENTRY_DSN=your-dsn
   NEXT_PUBLIC_SENTRY_DSN=your-dsn
   ```

2. **Google Analytics:**
   ```bash
   # Add to .env
   NEXT_PUBLIC_GTAG=G-XXXXXXXXXX
   ```

3. **Admin Access:**
   ```bash
   # Add admin emails
   ADMIN_EMAILS=admin@example.com
   ```

### Monitoring Workflow

1. **Daily:**
   - Review error rates
   - Check performance metrics
   - Review user activity

2. **Weekly:**
   - Analyze feature usage
   - Review error trends
   - Check system health

3. **Monthly:**
   - Review user growth
   - Analyze performance trends
   - Review and optimize

### Alerts

**Recommended Alerts:**
- Error rate > 5%
- P95 response time > 1000ms
- API endpoint down
- Database connection issues
- High memory usage

**Setup:**
- Configure in Sentry dashboard
- Set up email/Slack notifications
- Configure alert thresholds

### Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Monitoring](https://nextjs.org/docs/advanced-features/measuring-performance)

---

**Last Updated:** {new Date().toLocaleDateString()}
