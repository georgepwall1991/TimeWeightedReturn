# Time Weighted Return Portfolio Analytics Tool

## Project Status: Sprint 2 Complete + Resizable Sidebar ✅

This is a private wealth management tool for calculating portfolio performance metrics including Time Weighted Return (TWR), Contribution, and Attribution analysis. The system supports hierarchical portfolio structures (Client → Portfolio → Account) with multi-currency support using GBP as the base currency.

### 🎉 Latest Features Added

- **✅ Resizable Sidebar**: Drag-to-resize functionality with persistent width storage
- **✅ Keyboard Shortcuts**: Ctrl+B (toggle), Ctrl+Shift+R (reset width)
- **✅ Enhanced UX**: Smooth animations, visual feedback, and accessibility support
- **✅ Currency Support**: Added Currency field to Account entities and DTOs

### ✅ Core Features Completed

- **✅ NaN Values Issue RESOLVED**: Backend/frontend data synchronization fixed
- **✅ Portfolio Tree Navigation**: Hierarchical Client → Portfolio → Account display
- **✅ Holdings Data**: Real-time portfolio valuations with multi-currency conversion
- **✅ TWR Calculations**: Time Weighted Return algorithm implementation
- **✅ Modern UI**: Professional React interface with Tailwind CSS
- **✅ Type Safety**: Full TypeScript coverage across frontend and backend

### 🛠️ Technology Stack

- **Frontend**: React 18 + Vite + TypeScript + RTK Query + Tailwind CSS
- **Backend**: .NET 8 + Entity Framework Core + MediatR + SQL Server
- **Architecture**: Clean Architecture with vertical slice organization
- **Testing**: xUnit (.NET) + Vitest (React) with TDD approach

---

## 🚀 Quick Start

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- SQL Server LocalDB (or Docker)

### Development Setup

```bash
# Clone repository
git clone [repository-url]
cd TimeWeightedReturn

# Backend setup
dotnet restore
dotnet ef database update --project src/Infrastructure

# Frontend setup
cd frontend
npm install
npm run dev

# Start API (separate terminal)
cd ../src/Api
dotnet run --urls "http://localhost:5011"
```

### Access Points

- **Frontend**: <http://localhost:5173>
- **API**: <http://localhost:5011/api>
- **Database**: LocalDB `PerformanceCalculationDb`

---

## 💡 Key Features in Action

### Resizable Sidebar

- **Drag Handle**: Grip icon on sidebar edge for smooth resizing
- **Constraints**: 240px - 600px width range for optimal UX
- **Persistence**: Width saved across browser sessions
- **Shortcuts**: Ctrl+B (toggle), Ctrl+Shift+R (reset)

### Portfolio Tree Navigation

- **Hierarchical Display**: Client → Portfolio → Account structure
- **Real-time Values**: Live portfolio valuations in GBP
- **Currency Support**: Multi-currency holdings with automatic conversion
- **Expandable Nodes**: Click to drill down through portfolio hierarchy

### Financial Calculations

- **Time Weighted Return**: Industry-standard TWR calculations
- **Multi-currency**: Automatic FX conversion to GBP base currency
- **Date Range Flexibility**: Calculate returns for any period
- **Performance Metrics**: Annualized returns and sub-period breakdowns

---

## 🏗️ Architecture Overview

### Backend (.NET Core)

```json
/src
  /Domain        - Business entities and rules
  /Application   - MediatR handlers and DTOs (feature slices)
  /Infrastructure- EF Core, repositories, external services
  /Api           - Controllers and dependency injection
```

### Frontend (React)

```json
/frontend/src
  /components    - Reusable UI components
  /services      - RTK Query API definitions
  /types         - TypeScript interfaces
  /store         - Redux toolkit store configuration
```

### Database Schema

- **Hierarchical Structure**: Client → Portfolio → Account → Holding
- **Market Data**: Instruments, Prices, FX Rates
- **Time-series Design**: Daily snapshots for performance calculations

---

## 📊 Sample Data

The application includes realistic sample data:

- **Smith Family Trust**: £63,234.25 total value
- **Multiple Accounts**: ISA and General Investment accounts
- **Diversified Holdings**: Mix of equities and cash positions
- **Historical Data**: Price and FX rate data for calculations

---

## 🧪 Testing Strategy

### Backend Testing

- **Unit Tests**: Domain logic and financial calculations
- **Integration Tests**: Database operations and API endpoints
- **Test Coverage**: Comprehensive coverage of critical financial logic

### Frontend Testing

- **Component Tests**: React Testing Library for UI components
- **API Integration**: MSW for mocking backend responses
- **Type Safety**: TypeScript compiler catches interface mismatches

---

## 📈 Performance & Scalability

### Optimizations Applied

- **Efficient Queries**: EF Core compiled queries for frequent operations
- **Caching Strategy**: RTK Query with intelligent cache invalidation
- **Virtual Scrolling**: Ready for large portfolio datasets
- **Lazy Loading**: Components load on demand

### Database Performance

- **Indexed Queries**: Optimized for portfolio and holdings lookups
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Raw SQL for complex aggregations

---

## 🛣️ Development Roadmap

### Sprint 3: Advanced Analytics (Next)

- [ ] Contribution Analysis implementation
- [ ] Attribution Analysis (Brinson-Fachler method)
- [ ] Performance charts and visualizations
- [ ] Export functionality (PDF/Excel)

### Future Enhancements

- [ ] Real-time price feeds integration
- [ ] Risk metrics (volatility, Sharpe ratio)
- [ ] Benchmark comparison tools
- [ ] Multi-user support with authentication
- [ ] Mobile responsive optimizations

---

## 🔧 Developer Resources

### Key Commands

```bash
# Database operations
dotnet ef migrations add [MigrationName] --project src/Infrastructure
dotnet ef database update --project src/Infrastructure

# Testing
dotnet test                    # Backend tests
cd frontend && npm test       # Frontend tests

# Building
dotnet build                  # Backend
cd frontend && npm run build  # Frontend
```

### Documentation

- `docs/SPRINT_STATUS.md` - Current sprint progress
- `docs/RESIZABLE_SIDEBAR_FEATURE.md` - Detailed feature documentation
- API documentation available at `/swagger` endpoint

---

## 🎯 Success Metrics

### User Experience

- ✅ **Smooth Navigation**: Responsive tree with sub-second load times
- ✅ **Accurate Calculations**: Financial calculations match industry standards
- ✅ **Professional UI**: Clean, modern interface suitable for financial professionals
- ✅ **Accessibility**: Full keyboard navigation and screen reader support

### Technical Quality

- ✅ **Type Safety**: Zero runtime type errors with TypeScript
- ✅ **Test Coverage**: Comprehensive testing of business logic
- ✅ **Performance**: Optimized for large portfolios (1000+ holdings)
- ✅ **Maintainability**: Clean architecture with separation of concerns

---

## Error Handling

The application implements comprehensive error handling across both frontend and backend:

### Frontend Error Boundaries

The React application uses error boundaries to catch and handle errors gracefully:

- **Global Error Boundary**: Wraps the entire application to catch unhandled errors
- **Calculation Error Boundary**: Specialized boundary for financial calculations with retry functionality
- **Automatic Error Logging**: All caught errors are automatically logged to the backend

### Backend Error Logging

The API provides endpoints to receive and log frontend errors:

- `POST /api/error/client` - Logs React component errors with full context
- `POST /api/error/javascript` - Logs unhandled JavaScript errors

### Usage Examples

```tsx
// Wrap calculations in error boundaries
import { CalculationErrorBoundary } from './components/layout';

<CalculationErrorBoundary onRetry={() => refetch()}>
  <TwrCalculator accountId="123" />
</CalculationErrorBoundary>

// Use higher-order component for automatic error boundaries
import { withErrorBoundary } from './components/layout';

const SafeComponent = withErrorBoundary(MyComponent);

// Manual error logging
import { errorService } from './services/errorService';

try {
  // Some operation that might fail
} catch (error) {
  errorService.logClientError(error, errorInfo, {
    context: 'user-action',
    additionalData: {...}
  });
}
```

### Global Error Setup

Error handling is automatically initialized in the main App component:

```tsx
// App.tsx
import { errorService } from "./services/errorService";

// Set up global error handlers
errorService.setupGlobalErrorHandlers();
```

This captures:

- Unhandled JavaScript errors
- Unhandled promise rejections
- React component errors (via error boundaries)

## Troubleshooting

### Common Issues

#### "0 is read-only" TypeError

This error occurs when trying to mutate arrays that come from Redux/RTK Query state.

**Solution**: Always create a copy before sorting or mutating:

```tsx
// ❌ Wrong - mutates Redux state
filtered.sort((a, b) => a.value - b.value);

// ✅ Correct - creates copy first
const sorted = [...filtered].sort((a, b) => a.value - b.value);
```

**Fixed in**: HoldingsExplorer.tsx and ContributionDashboard.tsx components.

#### Error Boundary Recovery

When an error occurs:

1. Check browser console for detailed error information
2. Use "Try Again" button in error boundary UI
3. Use "Report Problem" to log additional context
4. In development, check the stack trace in the error boundary display

_Built with modern web technologies and financial industry best practices for portfolio performance analysis._
