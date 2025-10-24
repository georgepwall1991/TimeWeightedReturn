import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { updateAccessToken, logout } from '../store/authSlice';
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
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  AuthResponse,
  UserInfo,
} from '../types/auth';
import type {
  BenchmarkDto,
  BenchmarkComparisonDto,
  CreateBenchmarkRequest,
  UpdateBenchmarkRequest,
} from '../types/benchmark';
import type {
  InstrumentPriceStatus,
  MarketDataStatus,
  TickerValidationResult,
} from '../types/marketData';

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

// Create base query
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5011/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from state
    const token = (getState() as { auth?: { accessToken?: string } }).auth?.accessToken;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('accept', 'application/json');
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Create base query with automatic token refresh on 401
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error, try to refresh the token
  if (result.error && result.error.status === 401) {
    const state = api.getState() as { auth?: { refreshToken?: string; accessToken?: string } };
    const refreshToken = state.auth?.refreshToken;
    const accessToken = state.auth?.accessToken;

    if (refreshToken && accessToken) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        {
          url: 'auth/refresh',
          method: 'POST',
          body: {
            accessToken,
            refreshToken,
          },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new token
        const newTokens = refreshResult.data as AuthResponse;
        api.dispatch(
          updateAccessToken({
            accessToken: newTokens.accessToken,
            expiresAt: newTokens.expiresAt,
          })
        );

        // Retry the original query with the new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, log out the user
        api.dispatch(logout());
      }
    } else {
      // No refresh token available, log out
      api.dispatch(logout());
    }
  }

  return result;
};

// User preferences types
export interface UserPreferencesDto {
  theme: string;
}

export interface UpdateUserPreferencesRequest {
  theme: string;
}

// Base API configuration
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PortfolioTree', 'Holdings', 'AccountHoldings', 'TWR', 'Contribution', 'RiskMetrics', 'Auth', 'Benchmark', 'UserPreferences', 'MarketData'],
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
    }),

    // Authentication endpoints
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: 'auth/register',
        method: 'POST',
        body: credentials
      }),
      invalidatesTags: ['Auth']
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials
      }),
      invalidatesTags: ['Auth']
    }),

    refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (tokens) => ({
        url: 'auth/refresh',
        method: 'POST',
        body: tokens
      }),
      invalidatesTags: ['Auth']
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST'
      }),
      invalidatesTags: ['Auth']
    }),

    getCurrentUser: builder.query<UserInfo, void>({
      query: () => 'auth/me',
      providesTags: ['Auth']
    }),

    // Email verification
    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: (body) => ({
        url: 'auth/verify-email',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Auth']
    }),

    // Password reset
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body
      })
    }),

    resetPassword: builder.mutation<{ message: string }, { token: string; newPassword: string }>({
      query: (body) => ({
        url: 'auth/reset-password',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Auth']
    }),

    // Benchmark endpoints
    getBenchmarks: builder.query<BenchmarkDto[], void>({
      query: () => 'benchmark',
      providesTags: ['Benchmark'],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    getBenchmarkById: builder.query<BenchmarkDto, { benchmarkId: string }>({
      query: ({ benchmarkId }) => `benchmark/${benchmarkId}`,
      providesTags: (_result, _error, { benchmarkId }) => [
        { type: 'Benchmark', id: benchmarkId },
        'Benchmark',
      ],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    createBenchmark: builder.mutation<BenchmarkDto, CreateBenchmarkRequest>({
      query: (body) => ({
        url: 'benchmark',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Benchmark'],
    }),

    updateBenchmark: builder.mutation<BenchmarkDto, { benchmarkId: string; body: UpdateBenchmarkRequest }>({
      query: ({ benchmarkId, body }) => ({
        url: `benchmark/${benchmarkId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { benchmarkId }) => [
        { type: 'Benchmark', id: benchmarkId },
        'Benchmark',
      ],
    }),

    deleteBenchmark: builder.mutation<void, { benchmarkId: string }>({
      query: ({ benchmarkId }) => ({
        url: `benchmark/${benchmarkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Benchmark'],
    }),

    compareToBenchmark: builder.query<BenchmarkComparisonDto, {
      accountId: string;
      benchmarkId: string;
      startDate: string;
      endDate: string;
    }>({
      query: ({ accountId, benchmarkId, startDate, endDate }) => ({
        url: `benchmark/compare/${accountId}`,
        params: { benchmarkId, startDate, endDate },
      }),
      providesTags: (_result, _error, { accountId, benchmarkId }) => [
        { type: 'Benchmark', id: `${accountId}-${benchmarkId}` },
      ],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // User preferences endpoints
    getUserPreferences: builder.query<UserPreferencesDto, void>({
      query: () => 'user/preferences',
      providesTags: ['UserPreferences'],
      keepUnusedDataFor: 3600, // Cache for 1 hour
    }),

    updateUserPreferences: builder.mutation<UserPreferencesDto, UpdateUserPreferencesRequest>({
      query: (body) => ({
        url: 'user/preferences',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UserPreferences'],
    }),

    // Market Data endpoints
    getMarketDataStatus: builder.query<InstrumentPriceStatus[], void>({
      query: () => 'marketdata/status',
      providesTags: ['MarketData'],
      keepUnusedDataFor: 60, // Cache for 1 minute
    }),

    refreshAllPrices: builder.mutation<MarketDataStatus, { date?: string }>({
      query: (params) => ({
        url: 'marketdata/refresh',
        method: 'POST',
        params,
      }),
      invalidatesTags: ['MarketData', 'Holdings', 'AccountHoldings'],
    }),

    refreshInstrumentPrice: builder.mutation<{ message: string }, { instrumentId: string; date?: string }>({
      query: ({ instrumentId, date }) => ({
        url: `marketdata/refresh/${instrumentId}`,
        method: 'POST',
        params: date ? { date } : undefined,
      }),
      invalidatesTags: ['MarketData', 'Holdings', 'AccountHoldings'],
    }),

    validateTicker: builder.mutation<TickerValidationResult, { ticker: string }>({
      query: ({ ticker }) => ({
        url: `marketdata/validate/${ticker}`,
        method: 'POST',
      }),
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
  useCalculateRiskMetricsQuery,
  useGetAccountQuery,
  useGetAccountValueQuery,
  useGetAccountDatesQuery,
  useGetAccountHoldingsHistoryQuery,
  useExportHoldingsMutation,
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetBenchmarksQuery,
  useGetBenchmarkByIdQuery,
  useCreateBenchmarkMutation,
  useUpdateBenchmarkMutation,
  useDeleteBenchmarkMutation,
  useCompareToBenchmarkQuery,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useGetMarketDataStatusQuery,
  useRefreshAllPricesMutation,
  useRefreshInstrumentPriceMutation,
  useValidateTickerMutation,
} = api;

// Export types for convenience
export type { GetAccountHoldingsResponse, GetAccountDatesResponse };
