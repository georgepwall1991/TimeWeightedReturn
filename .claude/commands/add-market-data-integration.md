# Add Market Data Integration

Integrate external market data providers for automatic price fetching.

## Implementation
- Add Alpha Vantage API integration (free tier)
- Create MarketDataService abstraction (support multiple providers)
- Automatic price fetching (scheduled job):
  - Fetch daily prices for all instruments
  - Update Price table
  - Handle rate limiting
  - Cache API responses
- Manual price refresh button
- Price data validation

## Configuration
- API keys in appsettings.json
- Rate limit configuration
- Provider selection (Alpha Vantage, IEX Cloud, Yahoo Finance, etc.)

## Frontend
- Price data status indicator
- Last updated timestamp
- Refresh prices button
- Configure provider (admin settings)

## Testing
- Test API integration
- Test rate limiting
- Test error handling (API down, invalid symbol)
- Mock API responses for testing

Execute end-to-end autonomously.
