// Benchmark type definitions

export interface BenchmarkDto {
  id: string;
  name: string;
  indexSymbol: string;
  description?: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BenchmarkPriceDto {
  id: string;
  benchmarkId: string;
  date: string;
  value: number;
  dailyReturn?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyComparisonDto {
  date: string;
  benchmarkValue: number;
  benchmarkCumulativeReturn: number;
  portfolioValue: number;
  portfolioCumulativeReturn: number;
}

export interface BenchmarkComparisonDto {
  accountId: string;
  accountName: string;
  benchmarkId: string;
  benchmarkName: string;
  startDate: string;
  endDate: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  activeReturn: number;
  trackingError: number;
  dailyComparisons: DailyComparisonDto[];
}

export interface CreateBenchmarkRequest {
  name: string;
  indexSymbol: string;
  description?: string;
  currency?: string;
}

export interface UpdateBenchmarkRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CompareToBenchmarkRequest {
  accountId: string;
  benchmarkId: string;
  startDate: string;
  endDate: string;
}
