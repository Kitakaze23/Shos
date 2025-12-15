# Frontend Architecture Implementation

## Phase 7: Frontend Architecture ✅

### Implemented Features

#### 1. State Management

**React Query (TanStack Query):**
- ✅ Configured with QueryClient
- ✅ Default options: 5min staleTime, 10min cacheTime
- ✅ Automatic refetch on window focus disabled
- ✅ Retry logic (1 retry)

**Context API + useReducer:**
- ✅ `ProjectContext` - Current project state
- ✅ `ThemeContext` - Theme management (light/dark/system)
- ✅ Local state management for forms and UI

**Custom Hooks:**
- ✅ `useAuth` - Authentication state
- ✅ `useProject` - Project data with React Query
- ✅ `useCalculations` - Monthly/annual calculations
- ✅ `useFetch` - Generic API fetching hooks
- ✅ `useLocalStorage` - Local storage persistence

#### 2. Project Structure

**Organized Components:**
```
components/
├── common/          # Reusable components
│   ├── animated-card.tsx
│   ├── loading-spinner.tsx
│   └── page-transition.tsx
├── ui/              # shadcn/ui components
└── [feature]/       # Feature-specific components
```

**Utilities:**
```
utils/
├── formatting.ts    # Currency, number, date formatting
├── validation.ts    # Zod schemas and validation
├── api.ts          # API request utilities
└── constants.ts    # App constants
```

**Types:**
```
types/
└── index.ts        # TypeScript type definitions
```

#### 3. Design System

**Color Palette:**
- Primary: `#0891b2` (cyan)
- Secondary: `#8b5cf6` (purple)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (amber)
- Error: `#ef4444` (red)
- Neutral: `#6b7280` (gray)

**Spacing (8px base grid):**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

**Border Radius:**
- sm: 4px
- md: 8px
- lg: 12px

**Shadows:**
- sm: Subtle shadow
- md: Medium shadow
- lg: Large shadow

**Typography:**
- System fonts: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- Font smoothing: Antialiased

#### 4. Animations (Framer Motion)

**Implemented:**
- ✅ Page transitions (fade + slide)
- ✅ Button hover/tap animations
- ✅ Card hover effects
- ✅ Modal animations (slide-in)
- ✅ Loading spinner rotation

**Animation Patterns:**
- Smooth transitions (0.2-0.3s duration)
- Subtle scale effects on interaction
- Fade in/out for page changes

#### 5. Performance Optimizations

**Memoization:**
- ✅ `EquipmentList` - Memoized to prevent unnecessary re-renders
- ✅ `FinancialDashboard` - Memoized component
- ✅ `useMemo` for expensive calculations

**Code Splitting:**
- ✅ Next.js automatic code splitting
- ✅ Dynamic imports ready for large components

**Image Optimization:**
- ✅ Next.js Image component support
- ✅ Lazy loading ready

**Bundle Optimization:**
- ✅ Tree shaking enabled
- ✅ Production builds optimized

#### 6. UI Components

**Enhanced Components:**
- ✅ `Button` - With Framer Motion animations
- ✅ `Dialog` - With backdrop blur and animations
- ✅ `AnimatedCard` - Reusable animated card
- ✅ `LoadingSpinner` - Animated loading indicator
- ✅ `PageTransition` - Page transition wrapper

**Touch-Friendly:**
- ✅ Minimum 44x44px touch targets
- ✅ Touch manipulation CSS
- ✅ Mobile-optimized interactions

#### 7. Utility Functions

**Formatting:**
- `formatCurrency()` - Currency formatting with symbols
- `formatNumber()` - Number formatting
- `formatPercentage()` - Percentage formatting
- `formatDate()` - Date formatting
- `formatCompactNumber()` - Compact number (K, M, B)

**Validation:**
- `emailSchema` - Email validation
- `passwordSchema` - Password validation
- `positiveNumberSchema` - Positive number validation
- `percentageSchema` - Percentage validation (0-100)
- `operatingHoursSchema` - Operating hours validation (0-1000)
- `validateForm()` - Generic form validation helper

**API:**
- `apiRequest()` - Generic API request
- `api.get/post/put/patch/delete` - Convenience methods

**Constants:**
- Currency list
- Equipment categories
- Depreciation methods
- Cost allocation methods
- Member roles/statuses
- Report types
- Export formats

#### 8. Type Safety

**Type Definitions:**
- `User` - User type
- `Organization` - Organization type
- `Project` - Project type
- `Equipment` - Equipment type
- `OperatingParameters` - Operating parameters type
- `ProjectMember` - Team member type
- `FinancialMetrics` - Financial metrics type
- `MonthlyReport` - Monthly report type
- `ApiError` - API error type

### React Query Integration

**Query Keys:**
- `["project", projectId]` - Project data
- `["calculation", "monthly", projectId, month, year]` - Monthly calculations
- `["calculation", "annual", projectId, startMonth, startYear]` - Annual forecasts

**Mutation Patterns:**
```typescript
const updateProject = useMutation({
  mutationFn: (data) => updateProjectAPI(projectId, data),
  onSuccess: () => {
    queryClient.invalidateQueries(["project", projectId])
  }
})
```

### Theme System

**Theme Modes:**
- Light mode (default)
- Dark mode
- System preference

**Implementation:**
- LocalStorage persistence
- System preference detection
- Automatic theme switching
- CSS variables for colors

### Performance Metrics

**Optimizations:**
- Component memoization reduces re-renders
- React Query caching reduces API calls
- Code splitting reduces initial bundle size
- Image optimization reduces load times
- Lazy loading improves perceived performance

### Accessibility

**Features:**
- ✅ Focus management
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Color contrast compliance
- ✅ Touch target sizes (44x44px minimum)

### Mobile Optimization

**Features:**
- ✅ Responsive layouts
- ✅ Touch-friendly interactions
- ✅ Mobile navigation
- ✅ Full-width modals on mobile
- ✅ Safe area insets support
- ✅ Landscape mode optimizations

### Next Steps

1. **Virtualization:** Add `react-window` for long lists
2. **Error Boundaries:** Add error boundaries for better error handling
3. **Suspense:** Use React Suspense for loading states
4. **Bundle Analysis:** Run bundle analyzer to identify optimization opportunities
5. **Performance Monitoring:** Add performance monitoring (Web Vitals)

### Usage Examples

**Using React Query:**
```typescript
const { data, isLoading, error } = useProject(projectId)
const { data: monthly } = useMonthlyCalculation(projectId, month, year)
```

**Using Context:**
```typescript
const { state, setProject } = useProjectContext()
const { theme, setTheme } = useTheme()
```

**Using Hooks:**
```typescript
const { user, isAuthenticated } = useAuth()
const [value, setValue] = useLocalStorage("key", defaultValue)
```

**Formatting:**
```typescript
formatCurrency(amount, "RUB") // "₽1,234.56"
formatCompactNumber(1234567) // "1.2M"
formatDate(new Date()) // "January 15, 2025"
```
