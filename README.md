# 📊 Time Weighted Return Portfolio Analytics

> **A comprehensive portfolio analytics platform for private wealth management, built with .NET Core and React**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]
[![.NET Version](https://img.shields.io/badge/.NET-9.0-blue.svg)]
[![React](https://img.shields.io/badge/React-19-61dafb.svg)]
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)]
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg)]
[![License](https://img.shields.io/badge/license-MIT-green.svg)]

## 🌟 Features Overview

### 📈 **Advanced Analytics Engine**

- **Time Weighted Return (TWR)** calculation with multi-period support
- **Performance Attribution** analysis using Brinson-Fachler methodology
- **Contribution Analysis** at instrument and portfolio level
- **Interactive Charts** with professional financial visualizations

### 🌳 **Hierarchical Portfolio Management**

- **Tree Navigation**: Client → Portfolio → Account structure
- **Resizable Interface** with keyboard shortcuts (Ctrl+B, Ctrl+Shift+R)
- **Context-Aware Detail Panel** with dynamic content
- **Real-time Data Updates** via RTK Query

### 💱 **Multi-Currency Support**

- **Base Currency**: GBP with automatic conversion
- **Daily FX Rates** for USD, EUR, and other currencies
- **Historical Rate Support** for accurate period calculations

### 🎨 **Professional UI/UX**

- **Modern React Design** with TypeScript type safety
- **Responsive Layout** optimized for desktop and mobile
- **Error Boundaries** with comprehensive logging
- **Loading States** and graceful error handling

---

## 🚀 Quick Start

### Option 1: 🐳 Docker (Recommended)

**Prerequisites:** Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))

```bash
# Clone the repository
git clone https://github.com/yourusername/TimeWeightedReturn.git
cd TimeWeightedReturn

# Start all services with one command
./scripts/docker-dev.sh start        # Linux/macOS
.\scripts\docker-dev.ps1 -Command start  # Windows PowerShell

# Or use docker-compose directly
docker-compose up -d
```

**🎯 That's it!** Access:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:8080
- **Swagger:** http://localhost:8080/swagger

**Default Login:**
```
Email: admin@portfolioanalytics.com
Password: Admin123!@#
```

📖 **Full Docker Guide:** See [DOCKER.md](DOCKER.md) for complete documentation.

---

### Option 2: 🔧 Local Development Setup

**Prerequisites:**
- **.NET 9 SDK** - [Download here](https://dotnet.microsoft.com/download)
- **Node.js 20+** - [Download here](https://nodejs.org/)

```bash
# Clone the repository
git clone https://github.com/yourusername/TimeWeightedReturn.git
cd TimeWeightedReturn

# Backend setup
dotnet restore
dotnet ef database update --project src/Infrastructure

# Frontend setup
cd frontend
npm install
npm run dev

# Start the API (in another terminal)
cd ..
dotnet run --project src/Api
```

**🎯 That's it!** Open `http://localhost:5173` to see the application.

---

## 🏗️ Architecture

### **Clean Architecture with Vertical Slices**

```
📁 src/
├── 🌐 Api/                 # Controllers & HTTP layer
├── 🧠 Application/         # MediatR handlers & DTOs (by feature)
│   ├── Portfolio/          # Portfolio queries & commands
│   ├── Analytics/          # TWR & attribution calculations
│   └── Common/             # Shared interfaces & behaviors
├── 🏢 Domain/              # Pure business logic
└── 🗄️  Infrastructure/     # EF Core & external services

📁 frontend/
├── 🎨 components/          # React components
│   ├── tree/              # Tree navigation
│   ├── analytics/         # TWR calculator & charts
│   ├── charts/            # Recharts visualizations
│   └── layout/            # Layout & error boundaries
├── 🏪 store/              # RTK Query & state management
└── 🛠️  utils/             # Formatters & helpers
```

### **Technology Stack**

| Layer                | Technology            | Purpose                               |
| -------------------- | --------------------- | ------------------------------------- |
| **Frontend**         | React 18 + TypeScript | Modern UI with type safety            |
| **State Management** | RTK Query             | API caching & state management        |
| **Charts**           | Recharts              | Professional financial visualizations |
| **Styling**          | Tailwind CSS          | Utility-first styling                 |
| **Backend**          | .NET Core 8           | High-performance API                  |
| **Architecture**     | MediatR + CQRS        | Clean request/response handling       |
| **Database**         | EF Core + SQL Server  | Enterprise-grade data access          |
| **Testing**          | xUnit + Vitest        | Comprehensive test coverage           |

---

## 📊 Application Screenshots

### 🌳 **Portfolio Tree Navigation**

Navigate through your client hierarchy with an intuitive tree interface:

_Interactive tree with expand/collapse, resizable sidebar, and context-sensitive detail panel_

### 📈 **Time Weighted Return Calculator**

Calculate accurate TWR with beautiful performance charts:

_Professional TWR calculation with date range selector and historical performance visualization_

### 🥧 **Holdings Composition Analysis**

Visualize portfolio allocation with interactive charts:

_Pie chart showing portfolio composition with detailed breakdown and statistics_

### 📋 **Holdings Explorer**

Analyze individual positions with powerful filtering and sorting:

_Comprehensive holdings table with search, filters, and performance indicators_

---

## 🧮 Financial Calculations

### **Time Weighted Return (TWR)**

```
For each sub-period i:
Ri = (Vi,end - Vi,start - Fi) / Vi,start

Chain sub-periods:
TWR = ∏(1 + Ri) - 1
```

**Features:**

- ✅ Multi-period calculation with cash flow handling
- ✅ Annualized return computation
- ✅ Sub-period breakdown and analysis
- ✅ Currency conversion integration

### **Contribution Analysis**

```
Contribution of instrument j in period t:
Cj,t = wj,t-1 × Rj,t
```

**Features:**

- ✅ Instrument-level contribution tracking
- ✅ Weight-based performance attribution
- ✅ Interactive drill-down capabilities

### **Attribution Analysis (Brinson-Fachler)**

```
Allocation Effect:   AAi = (wi - wiB) × RiB
Selection Effect:    ASi = wiB × (Ri - RiB)
Interaction Effect:  AIi = (wi - wiB) × (Ri - RiB)
```

---

## 🗃️ Database Schema

### **Core Entities**

```sql
Client (1) ──→ (M) Portfolio (1) ──→ (M) Account (1) ──→ (M) Holding
                                                    │
                                                    └──→ (1) Instrument
```

### **Market Data**

```sql
Instrument (1) ──→ (M) Price
FxRate (independent currency conversion table)
```

**Sample Data Included:**

- 🏦 **3 Clients** with realistic portfolios
- 📊 **15+ Holdings** across multiple asset types
- 💰 **Price History** with daily updates
- 💱 **FX Rates** for USD/GBP conversion

---

## 🧪 Testing Strategy

### **Test Pyramid**

```
📊 E2E Tests           (Playwright - Critical user flows)
🔧 Integration Tests   (EF Core + WebApplicationFactory)
⚡ Unit Tests          (xUnit + Vitest - Fast feedback)
```

### **Financial Calculation Testing**

- ✅ **TWR Edge Cases**: Zero flows, negative returns, multi-period
- ✅ **Currency Conversion**: Cross-rate validation
- ✅ **Performance Benchmarks**: Large portfolio testing

```bash
# Run all tests
dotnet test                    # Backend tests
cd frontend && npm test        # Frontend tests
```

---

## 🔒 Security & Compliance

### **Security Features**

- 🔐 **JWT Authentication** with role-based access
- 🛡️ **Input Validation** using FluentValidation
- 🔍 **Audit Trail** with comprehensive logging
- 🌐 **CORS & Security Headers** for production

### **Financial Compliance**

- 📝 **SOX Controls**: Segregation of duties, change management
- 🇪🇺 **GDPR Ready**: Data minimization, right to be forgotten
- 📊 **MiFID II**: Transaction reporting capabilities

---

## 🚀 Performance Optimizations

### **Backend Performance**

- ⚡ **EF Core Compiled Queries** for frequent operations
- 🗃️ **Multi-level Caching** (Memory + Distributed)
- 🔄 **Connection Pooling** with optimized DbContext
- 📦 **Batch Operations** to reduce database roundtrips

### **Frontend Performance**

- 🌊 **Virtual Scrolling** for large datasets
- 🧠 **React.memo** and useMemo optimization
- 📦 **Code Splitting** with lazy loading
- 🔄 **RTK Query Caching** with intelligent invalidation

---

## 🎯 Error Handling

### **Comprehensive Error Management**

The application includes robust error handling at all levels:

#### **Frontend Error Boundaries**

```typescript
// Global error boundary catches all React errors
<ErrorBoundary>
  <Provider store={store}>
    <AppLayout />
  </Provider>
</ErrorBoundary>

// Specialized boundaries for financial calculations
<CalculationErrorBoundary onRetry={() => refetch()}>
  <TwrCalculator accountId="123" />
</CalculationErrorBoundary>
```

#### **Backend Error Logging**

- 📡 **Centralized Logging**: All errors sent to `/api/error/client`
- 📊 **Structured Logging**: Context, stack traces, user info
- 🔔 **Monitoring Integration**: Ready for Serilog, ElasticSearch

#### **Common Issues & Solutions**

**❌ "TypeError: 0 is read-only"**

- **Cause**: Mutating Redux/RTK Query state with `.sort()`
- **Solution**: Always create copies: `const sorted = [...array].sort()`

**❌ "No TWR data available"**

- **Cause**: Missing price data or invalid date range
- **Solution**: Check price data completeness and date format

---

## 📚 Development Workflow

### **Sprint Roadmap**

- ✅ **Sprint 0**: Project foundation & CI/CD
- ✅ **Sprint 1**: Core holdings data & API
- ✅ **Sprint 2**: TWR calculation engine
- ✅ **Sprint 3**: Portfolio tree navigation
- ✅ **Polish Phase**: Charts, error handling, documentation

### **Daily Development**

```bash
# Start development environment
docker-compose up -d          # Optional: External services
dotnet run --project src/Api  # Terminal 1: API
cd frontend && npm run dev     # Terminal 2: Frontend

# Database operations
dotnet ef migrations add [Name] --project src/Infrastructure
dotnet ef database update --project src/Infrastructure

# Testing
dotnet test                    # All .NET tests
cd frontend && npm test        # Frontend tests
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Standards**

- 🧪 **TDD Approach**: Write tests first
- 📝 **Clean Code**: Follow SOLID principles
- 🎨 **UI/UX**: Maintain design consistency
- 📖 **Documentation**: Update as you go

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Acknowledgments

- 🏦 **Financial Calculation Standards**: CFA Institute guidelines
- 🎨 **Design Inspiration**: Modern fintech applications
- 🛠️ **Technology Stack**: Microsoft, Facebook, and open-source communities

---

<div align="center">

**[⭐ Star this repo](https://github.com/yourusername/TimeWeightedReturn)** • **[🐛 Report Bug](https://github.com/yourusername/TimeWeightedReturn/issues)** • **[✨ Request Feature](https://github.com/yourusername/TimeWeightedReturn/issues)**

_Built with ❤️ for the financial technology community_

</div>
