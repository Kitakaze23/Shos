# Backend Architecture Implementation

## Phase 6: Backend Architecture ✅

### Implemented Features

#### 1. Enhanced Database Schema

**New Models:**
- ✅ **Organization**: Workspace/company management
- ✅ **OrganizationMember**: Organization membership
- ✅ **AuditLog**: Comprehensive audit trail
- ✅ **ProjectShare**: Project sharing functionality
- ✅ Enhanced **OperatingParameters**: Historical tracking with month field
- ✅ Enhanced **FinancialCalculation**: Cache with expiration

**Schema Improvements:**
- ✅ Default currency changed to RUB
- ✅ Added `lastLogin` to User
- ✅ Added `archivedAt` to Project
- ✅ Added `photosUrl` array to Equipment
- ✅ Added `month` field to OperatingParameters for history
- ✅ Added `expiresAt` to FinancialCalculation for caching
- ✅ Proper indexes on foreign keys and frequently queried fields

#### 2. Error Handling System

**Error Utilities (`lib/errors.ts`):**
- ✅ Standardized error codes (ErrorCode enum)
- ✅ Structured error responses (ApiError interface)
- ✅ AppError class for typed errors
- ✅ Error response formatter
- ✅ Common error creators (unauthorized, notFound, validation, etc.)

**Error Codes:**
- `VALIDATION_ERROR`: Input validation failures
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Duplicate or invalid state
- `TOO_MANY_REQUESTS`: Rate limiting
- `INTERNAL_ERROR`: Server errors

**Error Response Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "operating_hours",
        "message": "Must be between 0 and 1000"
      }
    ]
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### 3. Organization Management

**API Endpoints:**
- ✅ `GET /api/orgs` - List organizations
- ✅ `POST /api/orgs` - Create organization
- ✅ `GET /api/orgs/[id]` - Get organization details
- ✅ `PUT /api/orgs/[id]` - Update organization
- ✅ `DELETE /api/orgs/[id]` - Delete organization
- ✅ `GET /api/orgs/[id]/members` - List members
- ✅ `POST /api/orgs/[id]/members` - Add member

**Features:**
- Organization ownership
- Member roles (owner, admin, member)
- Project association with organizations
- Cache invalidation on updates

#### 4. Audit Logging System

**Audit Utilities (`lib/audit.ts`):**
- ✅ `createAuditLog()`: Log all changes
- ✅ `getAuditLogs()`: Retrieve audit history
- ✅ Tracks: action, entity type, changes before/after
- ✅ User attribution
- ✅ Project association

**Audit Log Fields:**
- `projectId`: Associated project
- `userId`: User who made the change
- `action`: create, update, delete, share, etc.
- `entityType`: project, equipment, member, etc.
- `entityId`: ID of the changed entity
- `changesBefore`: Previous state (JSON)
- `changesAfter`: New state (JSON)
- `createdAt`: Timestamp

**API Endpoint:**
- ✅ `GET /api/projects/[id]/audit` - Get audit logs

#### 5. Project Sharing

**API Endpoints:**
- ✅ `POST /api/projects/[id]/share` - Share project
- ✅ `GET /api/projects/[id]/share` - List shares
- ✅ `DELETE /api/projects/[id]/shares/[shareId]` - Revoke share

**Features:**
- Permission levels: view, edit, admin
- Soft delete (revokedAt timestamp)
- Share tracking (who shared, when)
- Access control integration

#### 6. Caching System

**Cache Utilities (`lib/cache.ts`):**
- ✅ Memory cache implementation (Redis-ready)
- ✅ TTL support
- ✅ Cache key generators
- ✅ Pattern-based deletion
- ✅ Automatic cleanup

**Cache Keys:**
- `session:{userId}` - User sessions
- `calc:{projectId}:{type}:{month}` - Calculations
- `report:{projectId}:{type}` - Reports
- `equipment:{projectId}` - Equipment lists
- `project:{projectId}` - Project data

**Cache TTLs:**
- Session: 24 hours
- Calculation: 1 hour
- Report: 4 hours
- Equipment: 30 minutes
- Project: 10 minutes

**Cache Invalidation:**
- `invalidateProjectCache()`: Clears all project-related cache
- Automatic on project/equipment/member updates

#### 7. Calculation Endpoints

**API Endpoints:**
- ✅ `GET /api/projects/[id]/calculations/monthly` - Monthly summary (cached)
- ✅ `GET /api/projects/[id]/calculations/annual` - Annual forecast (cached)

**Features:**
- Cache integration
- Automatic cache invalidation
- Query parameter support (month, year)
- Access control

#### 8. Database Optimization

**Connection Pooling:**
- ✅ Prisma connection pooling (configured via DATABASE_URL)
- ✅ Graceful shutdown handling
- ✅ Production-ready configuration

**Indexes:**
- ✅ Foreign keys indexed
- ✅ Frequently queried fields indexed
- ✅ Composite indexes for common queries
- ✅ Timestamp indexes for sorting

**Query Optimization:**
- ✅ Selective field loading
- ✅ Relationship includes
- ✅ Pagination support
- ✅ Efficient filtering

### API Endpoint Summary

#### Auth Endpoints
- ✅ `POST /api/auth/signup` - Register user
- ✅ `POST /api/auth/login` - Login (via NextAuth)
- ✅ `POST /api/auth/logout` - Logout
- ✅ `POST /api/auth/password-reset` - Reset password
- ✅ `GET /api/auth/verify/:token` - Verify email
- ✅ `POST /api/auth/2fa/enable` - Enable 2FA (via /api/user/two-factor)

#### User Endpoints
- ✅ `GET /api/user/profile` - Get current user
- ✅ `PATCH /api/user/profile` - Update profile
- ✅ `GET /api/user/activity` - Activity log
- ✅ `POST /api/user/delete-account` - Delete account

#### Organization Endpoints
- ✅ `GET /api/orgs` - List organizations
- ✅ `POST /api/orgs` - Create organization
- ✅ `GET /api/orgs/[id]` - Get organization
- ✅ `PUT /api/orgs/[id]` - Update organization
- ✅ `DELETE /api/orgs/[id]` - Delete organization
- ✅ `GET /api/orgs/[id]/members` - List members
- ✅ `POST /api/orgs/[id]/members` - Add member

#### Project Endpoints
- ✅ `GET /api/projects` - List projects
- ✅ `POST /api/projects` - Create project
- ✅ `GET /api/projects/[id]` - Get project details
- ✅ `PATCH /api/projects/[id]` - Update project
- ✅ `DELETE /api/projects/[id]` - Delete project
- ✅ `GET /api/projects/[id]/calculations/monthly` - Monthly summary
- ✅ `GET /api/projects/[id]/calculations/annual` - Annual forecast
- ✅ `POST /api/projects/[id]/share` - Share project
- ✅ `GET /api/projects/[id]/share` - List shares
- ✅ `DELETE /api/projects/[id]/shares/[shareId]` - Revoke share
- ✅ `GET /api/projects/[id]/audit` - Get audit logs

#### Equipment Endpoints
- ✅ `GET /api/projects/[id]/equipment` - List equipment
- ✅ `POST /api/projects/[id]/equipment` - Create equipment
- ✅ `GET /api/projects/[id]/equipment/[equipmentId]` - Get equipment
- ✅ `PATCH /api/projects/[id]/equipment/[equipmentId]` - Update equipment
- ✅ `DELETE /api/projects/[id]/equipment/[equipmentId]` - Delete equipment

#### Operating Parameters Endpoints
- ✅ `GET /api/projects/[id]/operating-parameters` - Get parameters
- ✅ `PUT /api/projects/[id]/operating-parameters` - Update parameters

#### Team Members Endpoints
- ✅ `GET /api/projects/[id]/members` - List members
- ✅ `POST /api/projects/[id]/members` - Add member
- ✅ `PATCH /api/projects/[id]/members/[memberId]` - Update member
- ✅ `DELETE /api/projects/[id]/members/[memberId]` - Remove member

#### Reports Endpoints
- ✅ `GET /api/projects/[id]/reports/monthly` - Monthly report
- ✅ `GET /api/projects/[id]/reports/annual` - Annual forecast
- ✅ `GET /api/projects/[id]/reports/depreciation` - Depreciation schedule
- ✅ `POST /api/projects/[id]/reports/scenarios` - Scenario analysis
- ✅ `GET /api/projects/[id]/reports/export/pdf` - Export PDF
- ✅ `GET /api/projects/[id]/reports/export/excel` - Export Excel
- ✅ `GET /api/projects/[id]/reports/export/csv` - Export CSV
- ✅ `POST /api/projects/[id]/reports/email` - Email report

### HTTP Status Codes

All endpoints use proper HTTP status codes:
- `200 OK`: Successful GET/PUT/PATCH
- `201 Created`: Successful POST
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate or invalid state
- `429 Too Many Requests`: Rate limiting
- `500 Internal Server Error`: Server errors

### Error Handling

All endpoints use standardized error handling:
- Consistent error format
- Detailed validation errors
- Proper HTTP status codes
- Error logging
- User-friendly messages

### Caching Strategy

**Current Implementation:**
- In-memory cache (development)
- Redis-ready architecture
- TTL-based expiration
- Pattern-based invalidation

**Production Setup:**
To use Redis, replace `lib/cache.ts` implementation with Redis client:
```typescript
import Redis from "ioredis"
const redis = new Redis(process.env.REDIS_URL)
```

### Database Connection

**Connection Pooling:**
Configure via DATABASE_URL:
```
postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=20
```

**Recommended Settings:**
- Connection limit: 10-20
- Pool timeout: 20 seconds
- Use connection pooler (PgBouncer) in production

### Security Features

- ✅ Input validation (Zod schemas)
- ✅ Authentication checks (NextAuth)
- ✅ Authorization checks (role-based)
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention (React)
- ✅ CSRF protection (NextAuth)
- ✅ Rate limiting ready
- ✅ Audit logging

### Performance Optimizations

- ✅ Database indexes on foreign keys
- ✅ Selective field loading
- ✅ Query result caching
- ✅ Connection pooling
- ✅ Efficient relationship loading
- ✅ Pagination support

### Next Steps

1. **Redis Integration**: Replace memory cache with Redis
2. **Rate Limiting**: Implement rate limiting middleware
3. **Background Jobs**: Add job queue for email reports
4. **Monitoring**: Add logging and monitoring
5. **Load Testing**: Test with production-like load
