// Transaction (CashFlow) types

export enum CashFlowType {
  // Performance-Influencing (keep in TWR calculation)
  Dividend = 1,
  DividendReinvested = 2,
  BondCoupon = 3,
  InterestEarned = 4,
  RealizedGainLoss = 5,
  ManagementFee = 6,
  CustodyFee = 7,
  TransactionCost = 8,
  TaxWithholding = 9,
  TaxReclaim = 10,
  ForeignExchangeGainLoss = 11,

  // Non-Performance-Influencing (external flows - break TWR periods)
  ClientContribution = 20,
  ClientWithdrawal = 21,
  IncomeDistribution = 22,
  TransferIn = 23,
  TransferOut = 24,
  ReturnOfCapital = 25,
  CapitalCall = 26,
  PerformanceFeePayment = 27,
  EstimatedTaxPayment = 28,

  // Internal Movements (no impact on TWR)
  InternalTransfer = 30,
  CashSweep = 31,
  SettlementAdjustment = 32,
  AccruedInterestAdjustment = 33,
}

export enum CashFlowCategory {
  PerformanceInfluencing = 1,
  ExternalFlow = 2,
  Internal = 3,
}

export enum ReconciliationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export enum BookOfRecord {
  ABoR = 0, // Accounting Book of Record
  IBoR = 1, // Investment Book of Record
}

export interface TransactionDto {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  description: string;
  type: CashFlowType;
  category: CashFlowCategory;
  transactionReference?: string;
  bookOfRecord: BookOfRecord;
  status: ReconciliationStatus;
  batchId?: string;
  submittedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  accountId: string;
  date: string;
  amount: number;
  description: string;
  type: CashFlowType;
  transactionReference?: string;
}

export interface UpdateTransactionRequest {
  date: string;
  amount: number;
  description: string;
  type: CashFlowType;
  transactionReference?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  types?: CashFlowType[];
  categories?: CashFlowCategory[];
  status?: ReconciliationStatus;
}

// Helper metadata for transaction types
export interface TransactionTypeInfo {
  type: CashFlowType;
  label: string;
  description: string;
  category: CashFlowCategory;
  icon: string; // emoji or icon identifier
  color: string; // tailwind color class
}

export const transactionTypeMetadata: Record<CashFlowType, TransactionTypeInfo> = {
  // Performance-Influencing
  [CashFlowType.Dividend]: {
    type: CashFlowType.Dividend,
    label: 'Dividend',
    description: 'Cash dividends received from equities',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.DividendReinvested]: {
    type: CashFlowType.DividendReinvested,
    label: 'Dividend Reinvested',
    description: 'Dividends automatically reinvested to purchase more shares',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.BondCoupon]: {
    type: CashFlowType.BondCoupon,
    label: 'Bond Coupon',
    description: 'Interest payments from bonds',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.InterestEarned]: {
    type: CashFlowType.InterestEarned,
    label: 'Interest Earned',
    description: 'Interest earned on cash balances',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.RealizedGainLoss]: {
    type: CashFlowType.RealizedGainLoss,
    label: 'Realized Gain/Loss',
    description: 'Profit or loss from selling securities',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.ManagementFee]: {
    type: CashFlowType.ManagementFee,
    label: 'Management Fee',
    description: 'Investment management fees (for net-of-fee returns)',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.CustodyFee]: {
    type: CashFlowType.CustodyFee,
    label: 'Custody Fee',
    description: 'Custodian and administrative fees',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.TransactionCost]: {
    type: CashFlowType.TransactionCost,
    label: 'Transaction Cost',
    description: 'Brokerage commissions and trading costs',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.TaxWithholding]: {
    type: CashFlowType.TaxWithholding,
    label: 'Tax Withholding',
    description: 'Dividend withholding tax deducted',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.TaxReclaim]: {
    type: CashFlowType.TaxReclaim,
    label: 'Tax Reclaim',
    description: 'Withholding tax reclaimed and credited',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },
  [CashFlowType.ForeignExchangeGainLoss]: {
    type: CashFlowType.ForeignExchangeGainLoss,
    label: 'FX Gain/Loss',
    description: 'Foreign exchange revaluation adjustments',
    category: CashFlowCategory.PerformanceInfluencing,
    icon: '✅',
    color: 'green',
  },

  // External Flows
  [CashFlowType.ClientContribution]: {
    type: CashFlowType.ClientContribution,
    label: 'Client Contribution',
    description: 'Cash deposited by client (breaks TWR period)',
    category: CashFlowCategory.ExternalFlow,
    icon: '🔴',
    color: 'red',
  },
  [CashFlowType.ClientWithdrawal]: {
    type: CashFlowType.ClientWithdrawal,
    label: 'Client Withdrawal',
    description: 'Cash withdrawn by client (breaks TWR period)',
    category: CashFlowCategory.ExternalFlow,
    icon: '🔴',
    color: 'red',
  },
  [CashFlowType.IncomeDistribution]: {
    type: CashFlowType.IncomeDistribution,
    label: 'Income Distribution',
    description: 'Income distributed to client (breaks TWR period)',
    category: CashFlowCategory.ExternalFlow,
    icon: '🔴',
    color: 'red',
  },
  [CashFlowType.TransferIn]: {
    type: CashFlowType.TransferIn,
    label: 'Transfer In',
    description: 'Securities or cash transferred into account (breaks TWR period)',
    category: CashFlowCategory.ExternalFlow,
    icon: '🔴',
    color: 'red',
  },
  [CashFlowType.TransferOut]: {
    type: CashFlowType.TransferOut,
    label: 'Transfer Out',
    description: 'Securities or cash transferred out of account (breaks TWR period)',
    category: CashFlowCategory.ExternalFlow,
    icon: '🔴',
    color: 'red',
  },
  [CashFlowType.ReturnOfCapital]: {
    type: CashFlowType.ReturnOfCapital,
    label: 'Return of Capital',
    description: 'REIT/MLP return of capital distributions (breaks TWR period)',
    category: CashFlowCategory.ExternalFlow,
    icon: '🔴',
    color: 'red',
  },
  [CashFlowType.CapitalCall]: {
    type: CashFlowType.CapitalCall,
    label: 'Capital Call',
    description: 'Private equity capital call (breaks TWR period)',
    category: CashFlowCategory.ExternalFlow,
    icon: '🔴',
    color: 'red',
  },
  [CashFlowType.PerformanceFeePayment]: {
    type: CashFlowType.PerformanceFeePayment,
    label: 'Performance Fee',
    description: 'Performance fees paid to external party (breaks TWR period)',
    category: CashFlowCategory.ExternalFlow,
    icon: '🔴',
    color: 'red',
  },
  [CashFlowType.EstimatedTaxPayment]: {
    type: CashFlowType.EstimatedTaxPayment,
    label: 'Estimated Tax Payment',
    description: 'Tax payments made on behalf of client (breaks TWR period)',
    category: CashFlowCategory.ExternalFlow,
    icon: '🔴',
    color: 'red',
  },

  // Internal
  [CashFlowType.InternalTransfer]: {
    type: CashFlowType.InternalTransfer,
    label: 'Internal Transfer',
    description: 'Transfer between accounts/sleeves (no TWR impact)',
    category: CashFlowCategory.Internal,
    icon: '⚪',
    color: 'gray',
  },
  [CashFlowType.CashSweep]: {
    type: CashFlowType.CashSweep,
    label: 'Cash Sweep',
    description: 'Automatic cash management (no TWR impact)',
    category: CashFlowCategory.Internal,
    icon: '⚪',
    color: 'gray',
  },
  [CashFlowType.SettlementAdjustment]: {
    type: CashFlowType.SettlementAdjustment,
    label: 'Settlement Adjustment',
    description: 'Trade settlement corrections (no TWR impact)',
    category: CashFlowCategory.Internal,
    icon: '⚪',
    color: 'gray',
  },
  [CashFlowType.AccruedInterestAdjustment]: {
    type: CashFlowType.AccruedInterestAdjustment,
    label: 'Accrued Interest Adjustment',
    description: 'Bond accrued interest adjustments (no TWR impact)',
    category: CashFlowCategory.Internal,
    icon: '⚪',
    color: 'gray',
  },
};

// Helper functions
export function getCategoryInfo(category: CashFlowCategory): {
  label: string;
  description: string;
  badgeColor: string;
} {
  switch (category) {
    case CashFlowCategory.PerformanceInfluencing:
      return {
        label: 'Performance',
        description: 'Affects portfolio returns in TWR calculation',
        badgeColor: 'bg-green-100 text-green-800 border-green-300',
      };
    case CashFlowCategory.ExternalFlow:
      return {
        label: 'External Flow',
        description: 'Client-driven flow that breaks TWR periods',
        badgeColor: 'bg-red-100 text-red-800 border-red-300',
      };
    case CashFlowCategory.Internal:
      return {
        label: 'Internal',
        description: 'Accounting adjustment with no TWR impact',
        badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
      };
  }
}

export function getTransactionTypesByCategory(category: CashFlowCategory): TransactionTypeInfo[] {
  return Object.values(transactionTypeMetadata).filter((t) => t.category === category);
}
