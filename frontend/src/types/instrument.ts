// Instrument/Security types

export type InstrumentType = 'Cash' | 'Security';

export type AssetClass = 'Equity' | 'Bond' | 'Commodity' | 'Currency' | 'RealEstate' | 'Alternative' | 'Cash';

export type PriceSource = 'Manual' | 'AlphaVantage' | 'Finnhub' | 'YahooFinance';

export interface InstrumentDto {
  id: string;
  ticker: string;
  name: string;
  currency: string;
  type: InstrumentType;
  isin?: string | null;
  sedol?: string | null;
  cusip?: string | null;
  assetClass?: AssetClass | null;
  sector?: string | null;
  exchange?: string | null;
  country?: string | null;
  preferredDataProvider?: PriceSource | null;
  dataProviderConfig?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstrumentRequest {
  ticker: string;
  name: string;
  currency: string;
  type: InstrumentType;
  isin?: string | null;
  sedol?: string | null;
  cusip?: string | null;
  assetClass?: AssetClass | null;
  sector?: string | null;
  exchange?: string | null;
  country?: string | null;
  preferredDataProvider?: PriceSource | null;
  dataProviderConfig?: string | null;
}

export interface UpdateInstrumentRequest {
  ticker: string;
  name: string;
  currency: string;
  type: InstrumentType;
  isin?: string | null;
  sedol?: string | null;
  cusip?: string | null;
  assetClass?: AssetClass | null;
  sector?: string | null;
  exchange?: string | null;
  country?: string | null;
  preferredDataProvider?: PriceSource | null;
  dataProviderConfig?: string | null;
}
