import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  PortfolioTreeResponse,
  GetPortfolioHoldingsResponse,
  TwrResult,
  ContributionAnalysisResult,
  HoldingsRequest,
  ContributionRequest,
  HoldingDto,
} from '../types/api';

// Account holdings response interface
interface GetAccountHoldingsResponse {
  accountId: string;
  accountName: string;
  date: string;
  holdings: HoldingDto[];
  totalValueGBP: number;
  count: number;
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
  tagTypes: ['PortfolioTree', 'Holdings', 'AccountHoldings', 'TWR', 'Contribution'],
  endpoints: (builder) => ({
    // Portfolio Tree Navigation
    getPortfolioTree: builder.query<PortfolioTreeResponse, { clientId?: string }>({
      query: ({ clientId }) => ({
        url: 'tree',
        params: clientId ? { clientId } : {},
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
  }),
});

// Export hooks for use in components
export const {
  useGetPortfolioTreeQuery,
  useGetPortfolioHoldingsQuery,
  useGetAccountHoldingsQuery,
  useCalculateTWRQuery,
  useCalculateContributionQuery,
  useGetAccountQuery,
  useGetAccountValueQuery,
} = api;

// Export types for convenience
export type { GetAccountHoldingsResponse };
