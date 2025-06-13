import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  PortfolioTreeResponse,
  GetPortfolioHoldingsResponse,
  TwrResult,
  ContributionAnalysisResult,
  RiskMetricsAnalysisResult,
  HoldingsRequest,
  ContributionRequest,
  RiskRequest,
  HoldingDto,
} from '../types/api';

// Account holdings response interface
interface GetAccountHoldingsResponse {
  accountId: string;
  accountName: string;
  requestedDate: string;
  actualDate: string;
  holdings: HoldingDto[];
  totalValueGBP: number;
  count: number;
  dataStatus: 'Exact' | 'Nearest' | 'NoData';
  message?: string;
  availableDateRange?: {
    earliest: string;
    latest: string;
    totalDates: number;
  };
}

// Account dates response interface
interface GetAccountDatesResponse {
  accountId: string;
  accountName: string;
  dates: string[];
  startDate: string;
  endDate: string;
}

// Account holdings history response interface
interface GetAccountHoldingsHistoryResponse {
  accountId: string;
  accountName: string;
  startDate: string;
  endDate: string;
  historicalData: Array<{
    date: string;
    holdings: Array<{
      instrumentId: string;
      ticker: string;
      name: string;
      units: number;
      price: number;
      valueGBP: number;
      instrumentType: string;
      currency: string;
    }>;
    totalValueGBP: number;
    count: number;
  }>;
  availableDateRange: {
    earliest: string;
    latest: string;
    totalDates: number;
  };
}

export interface ExportHoldingsRequest {
  accountId: string;
  date: string;
  format: 'csv' | 'excel';
}

// Base API configuration
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5011/api',
    prepareHeaders: (headers) => {
      headers.set('accept', 'application/json');
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['PortfolioTree', 'Holdings', 'AccountHoldings', 'TWR', 'Contribution', 'RiskMetrics'],
  endpoints: (builder) => ({
    // Portfolio Tree Navigation
    getPortfolioTree: builder.query<PortfolioTreeResponse, { clientId?: string }>({
      query: ({ clientId }) => ({
        url: 'tree',
        params: {
          ...(clientId ? { clientId } : {}),
          date: new Date().toISOString().split('T')[0] // Always include today's date
        },
      }),
      providesTags: ['PortfolioTree'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Portfolio Holdings
    getPortfolioHoldings: builder.query<GetPortfolioHoldingsResponse, HoldingsRequest>({
      query: ({ portfolioId, date }) => ({
        url: `portfolio/${portfolioId}/holdings`,
        params: { date },
      }),
      providesTags: (_result, _error, { portfolioId }) => [
        { type: 'Holdings', id: portfolioId },
        'Holdings',
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Account Holdings
    getAccountHoldings: builder.query<GetAccountHoldingsResponse, { accountId: string; date?: string }>({
      query: ({ accountId, date }) => ({
        url: `account/${accountId}/holdings`,
        params: date ? { date } : {},
      }),
      providesTags: (_result, _error, { accountId }) => [
        { type: 'AccountHoldings', id: accountId },
        'AccountHoldings',
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Time Weighted Return Calculation
    calculateTWR: builder.query<TwrResult, { accountId: string; from: string; to: string }>({
      query: ({ accountId, from, to }) => ({
        url: `account/${accountId}/twr`,
        params: { from, to },
      }),
      providesTags: (_result, _error, { accountId }) => [
        { type: 'TWR', id: accountId },
        'TWR',
      ],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Contribution Analysis
    calculateContribution: builder.query<ContributionAnalysisResult, ContributionRequest>({
      query: ({ accountId, startDate, endDate }) => ({
        url: `account/${accountId}/contribution`,
        params: { from: startDate, to: endDate },
      }),
      providesTags: (_result, _error, { accountId }) => [
        { type: 'Contribution', id: accountId },
        'Contribution',
      ],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Account Details
    getAccount: builder.query<{
      id: string;
      name: string;
      accountNumber: string;
      currency: string;
      portfolioId: string;
      createdAt: string;
    }, { accountId: string }>({
      query: ({ accountId }) => ({
        url: `account/${accountId}`,
      }),
      providesTags: (_result, _error, { accountId }) => [
        { type: 'AccountHoldings', id: accountId },
      ],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Account Value
    getAccountValue: builder.query<{
      accountId: string;
      date: string;
      valueGBP: number;
    }, { accountId: string; date?: string }>({
      query: ({ accountId, date }) => ({
        url: `account/${accountId}/value`,
        params: date ? { date } : {},
      }),
      providesTags: (_result, _error, { accountId }) => [
        { type: 'AccountHoldings', id: accountId },
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Risk Metrics Analysis
    calculateRiskMetrics: builder.query<RiskMetricsAnalysisResult, RiskRequest>({
      query: ({ accountId, startDate, endDate, riskFreeRate }) => {
        const params = new URLSearchParams({
          from: startDate,
          to: endDate,
        });
        if (riskFreeRate !== undefined) {
          params.append('riskFreeRate', riskFreeRate.toString());
        }
        return `account/${accountId}/risk?${params.toString()}`;
      },
      providesTags: (_result, _error, { accountId }) => [
        { type: 'RiskMetrics', id: accountId },
        'RiskMetrics',
      ],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Account Available Dates
    getAccountDates: builder.query<GetAccountDatesResponse, { accountId: string }>({
      query: ({ accountId }) => ({
        url: `account/${accountId}/dates`,
      }),
      providesTags: (_result, _error, { accountId }) => [
        { type: 'AccountHoldings', id: accountId },
      ],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    getAccountHoldingsHistory: builder.query<GetAccountHoldingsHistoryResponse, {
      accountId: string;
      startDate: string;
      endDate: string;
    }>({
      query: ({ accountId, startDate, endDate }) => ({
        url: `account/${accountId}/holdings/history`,
        params: { startDate, endDate }
      })
    }),

    exportHoldings: builder.mutation<Blob, ExportHoldingsRequest>({
      query: ({ accountId, date, format }) => ({
        url: `accounts/${accountId}/holdings/export`,
        method: 'GET',
        params: { date, format },
        responseHandler: async (response) => response.blob()
      })
    })
  }),
});

// Export hooks for use in components
export const {
  useGetPortfolioTreeQuery,
  useGetPortfolioHoldingsQuery,
  useGetAccountHoldingsQuery,
  useCalculateTWRQuery,
  useCalculateContributionQuery,
  useCalculateRiskMetricsQuery,
  useGetAccountQuery,
  useGetAccountValueQuery,
  useGetAccountDatesQuery,
  useGetAccountHoldingsHistoryQuery,
  useExportHoldingsMutation,
} = api;

// Export types for convenience
export type { GetAccountHoldingsResponse, GetAccountDatesResponse };
