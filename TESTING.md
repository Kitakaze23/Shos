# Testing Strategy

## Phase 10: Testing Strategy ✅

### Overview

Comprehensive testing strategy covering unit tests, integration tests, E2E tests, and performance testing.

### Test Structure

```
__tests__/
├── unit/              # Unit tests
│   ├── calculations.test.ts
│   ├── formatting.test.ts
│   └── validation.test.ts
├── integration/       # Integration tests
│   └── api/
│       ├── projects.test.ts
│       └── auth.test.ts
└── helpers/           # Test utilities
    └── test-utils.tsx

cypress/
├── e2e/               # E2E tests
│   ├── auth.cy.ts
│   ├── projects.cy.ts
│   └── equipment.cy.ts
└── support/           # Cypress support files
    ├── commands.ts
    └── e2e.ts
```

### 1. Unit Tests (Jest)

**Coverage:**
- ✅ Financial calculations
- ✅ Formatting utilities
- ✅ Validation schemas
- ✅ Utility functions

**Run:**
```bash
npm run test:unit
```

**Example:**
```typescript
describe('calculateAnnualDepreciation', () => {
  it('should calculate correctly', () => {
    const result = calculateAnnualDepreciation(
      new Decimal(1000000),
      new Decimal(100000),
      10
    )
    expect(result.toNumber()).toBe(90000)
  })
})
```

### 2. Integration Tests (Jest + Supertest)

**Coverage:**
- ✅ API endpoints
- ✅ Database operations
- ✅ Authentication flows
- ✅ Error handling

**Run:**
```bash
npm run test:integration
```

**Example:**
```typescript
describe('POST /api/projects', () => {
  it('should create project with valid data', async () => {
    const response = await POST(request)
    expect(response.status).toBe(201)
    expect(data.id).toBeDefined()
  })
})
```

### 3. E2E Tests (Cypress)

**Coverage:**
- ✅ User authentication flows
- ✅ Project management
- ✅ Equipment management
- ✅ Form submissions
- ✅ Navigation

**Run:**
```bash
npm run test:e2e        # Headless
npm run test:e2e:open   # Interactive
```

**Example:**
```javascript
describe('Create Project Flow', () => {
  it('should create and save project', () => {
    cy.login('user@example.com', 'password')
    cy.visit('/dashboard')
    cy.contains('Create Project').click()
    cy.get('[data-testid="project-name"]').type('New Project')
    cy.get('[data-testid="submit"]').click()
    cy.contains('Project created').should('be.visible')
  })
})
```

### 4. Performance Tests (Lighthouse)

**Targets:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

**Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Run:**
```bash
npm run test:performance
```

### Test Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Performance
npm run test:performance
```

### Test Coverage

**Targets:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**View Coverage:**
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html
```

### CI/CD Integration

**GitHub Actions:**
- ✅ Unit tests on every push
- ✅ Integration tests with database
- ✅ E2E tests with Cypress
- ✅ Performance tests with Lighthouse
- ✅ Coverage reporting

**Workflow:**
1. Lint and type check
2. Run unit tests
3. Run integration tests
4. Run E2E tests
5. Run performance tests
6. Upload coverage reports

### Test Utilities

**Custom Render:**
```typescript
import { render } from '@/__tests__/helpers/test-utils'

// Automatically wraps with providers
render(<Component />)
```

**Mock Data:**
```typescript
import { createMockUser, createMockProject } from '@/__tests__/helpers/test-utils'

const user = createMockUser({ email: 'custom@example.com' })
```

**Cypress Commands:**
```typescript
cy.login('email', 'password')
cy.logout()
cy.createProject('Project Name')
cy.waitForApi('@createProject')
```

### Best Practices

1. **Unit Tests:**
   - Test one thing at a time
   - Use descriptive test names
   - Test edge cases
   - Mock external dependencies

2. **Integration Tests:**
   - Test API contracts
   - Use real database (test instance)
   - Clean up after tests
   - Test error scenarios

3. **E2E Tests:**
   - Test critical user flows
   - Use data-testid attributes
   - Keep tests independent
   - Use custom commands

4. **Performance Tests:**
   - Run on production builds
   - Test multiple pages
   - Monitor trends over time
   - Set realistic thresholds

### Debugging Tests

**Jest:**
```bash
# Run specific test
npm test -- calculations.test.ts

# Run with verbose output
npm test -- --verbose

# Run in watch mode
npm run test:watch
```

**Cypress:**
```bash
# Open Cypress UI
npm run test:e2e:open

# Run specific test
npx cypress run --spec "cypress/e2e/auth.cy.ts"
```

### Continuous Improvement

1. **Monitor Coverage:**
   - Track coverage trends
   - Identify untested code
   - Set coverage goals

2. **Review Test Results:**
   - Fix failing tests immediately
   - Refactor flaky tests
   - Update tests for new features

3. **Performance Monitoring:**
   - Track Lighthouse scores
   - Monitor Web Vitals
   - Optimize slow pages

### Resources

- [Jest Documentation](https://jestjs.io/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Testing Library](https://testing-library.com/)

---

**Last Updated:** {new Date().toLocaleDateString()}
