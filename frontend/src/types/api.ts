// Core domain types
export interface HoldingDto {
  instrumentId: string;  // Maps to HoldingId from backend
  ticker: string;
  name: string;         // Maps to InstrumentName from backend
  units: number;
  price: number;
  valueGBP: number;
  instrumentType: 'Cash' | 'Security';
  currency: string;
  localValue?: number;  // Units × Price in original currency
  fxRate?: number;      // Exchange rate to GBP
}

// Account Holdings Response (matches backend)
export interface GetAccountHoldingsResponse {
  accountId: string;
  accountName: string;
  date: string;
  holdings: HoldingDto[];
  totalValueGBP: number;
  count: number;
}

// Portfolio Tree DTOs
export interface AccountNodeDto {
  id: string;
  name: string;
  accountNumber: string;
  currency: string;
  portfolioId: string;
  totalValueGBP: number;
  holdingsCount: number;
  nodeType: string;
  metrics?: PerformanceMetricsDto;
}

export interface PortfolioNodeDto {
  id: string;
  name: string;
  clientId: string;
  totalValueGBP: number;
  holdingsCount: number;
  accountsCount: number;
  nodeType: string;
  accounts: AccountNodeDto[];
  metrics?: PerformanceMetricsDto;
}

export interface ClientNodeDto {
  id: string;
  name: string;
  totalValueGBP: number;
  holdingsCount: number;
  portfoliosCount: number;
  nodeType: string;
  portfolios: PortfolioNodeDto[];
  metrics?: PerformanceMetricsDto;
}

export interface PortfolioTreeResponse {
  clients: ClientNodeDto[];
  totalValueGBP: number;
  lastUpdated: string;
}

export interface PerformanceMetricsDto {
  timeWeightedReturn?: number;
  annualizedReturn?: number;
  startDate?: string;
  endDate?: string;
  days?: number;
}

// Portfolio Holdings
export interface GetPortfolioHoldingsResponse {
  holdings: HoldingDto[];
  totalValueGBP: number;
  holdingsDate: string;
  portfolioId: string;
  portfolioName: string;
}

// TWR Analytics
export interface SubPeriodDto {
  startDate: string;
  endDate: string;
  startValue: number;
  endValue: number;
  netFlow: number;
  periodReturn: number;
}

export interface TwrResult {
  timeWeightedReturn: number;
  annualizedReturn: number;
  calculationPeriod: {
    startDate: string;
    endDate: string;
  };
  subPeriods: SubPeriodDto[];
}

// Contribution Analysis
export interface ContributionData {
  instrumentId: string;
  ticker: string;
  name: string;
  startWeight: number;
  endWeight: number;
  instrumentReturn: number;
  contribution: number;
  valueGBP: number;
}

export interface ContributionAnalysisResult {
  totalReturn: number;
  totalContribution: number;
  contributions: ContributionData[];
  analysisDate: string;
  accountId: string;
}

// API Request types
export interface TwrRequest {
  accountId: string;
  startDate: string;
  endDate: string;
}

export interface HoldingsRequest {
  portfolioId: string;
  date: string;
}

export interface ContributionRequest {
  accountId: string;
  startDate: string;
  endDate: string;
}

export interface AccountHoldingsRequest {
  accountId: string;
  date?: string;
}

// Account Details
export interface AccountDetails {
  id: string;
  name: string;
  accountNumber: string;
  currency: string;
  portfolioId: string;
  createdAt: string;
}

// Account Value
export interface AccountValue {
  accountId: string;
  date: string;
  valueGBP: number;
}
