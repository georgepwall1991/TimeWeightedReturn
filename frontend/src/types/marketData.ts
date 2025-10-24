export type PriceSource = 'Manual' | 'AlphaVantage' | 'Finnhub' | 'YahooFinance';

export interface InstrumentPriceStatus {
  instrumentId: string;
  ticker: string;
  name: string;
  lastPriceDate: string | null;
  lastPriceSource: PriceSource | null;
  needsUpdate: boolean;
}

export interface MarketDataStatus {
  provider: PriceSource;
  isAvailable: boolean;
  lastUpdateTime: string;
  totalInstruments: number;
  updatedInstruments: number;
  failedInstruments: number;
  errors: Record<string, string>;
}

export interface TickerValidationResult {
  ticker: string;
  isValid: boolean;
}
