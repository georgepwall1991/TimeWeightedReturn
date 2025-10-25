// Reconciliation Enums
export enum BookOfRecord {
  IBoR = 1,
  ABoR = 2,
}

export enum ReconciliationStatus {
  Pending = 1,
  Matched = 2,
  Approved = 3,
  Rejected = 4,
  Break = 5,
}

export enum ReconciliationBreakType {
  MissingTransaction = 1,
  QuantityMismatch = 2,
  AmountMismatch = 3,
  CashMismatch = 4,
  PriceDifference = 5,
  ValuationMismatch = 6,
  InstrumentMismatch = 7,
  ValidationError = 8,
  Duplicate = 9,
  Other = 99,
}

// Reconciliation Batch DTO
export interface ReconciliationBatchDto {
  id: string;
  batchDate: string;
  source: string;
  sourceFileName?: string;
  status: ReconciliationStatus;
  itemCount: number;
  matchedCount: number;
  breakCount: number;
  submittedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

// Reconciliation Break DTO
export interface ReconciliationBreakDto {
  id: string;
  batchId: string;
  breakType: ReconciliationBreakType;
  entityType: string;
  description: string;
  expectedValue?: string;
  actualValue?: string;
  variance?: number;
  status: ReconciliationStatus;
  breakDate?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

// Dashboard Statistics
export interface ReconciliationDashboard {
  totalBatches: number;
  pendingBatches: number;
  approvedBatches: number;
  unresolvedBreaks: number;
  breaksByType: Array<{
    breakType: string;
    count: number;
  }>;
  recentBatches: ReconciliationBatchDto[];
}

// Import Request/Response
export interface ImportFileRequest {
  file: File;
  importType: 'Transactions' | 'Holdings' | 'Prices';
  submittedBy: string;
}

export interface ImportFileResponse {
  success: boolean;
  batchId?: string;
  recordsProcessed: number;
  recordsImported: number;
  recordsFailed: number;
  errors: string[];
  warnings: string[];
}

// Run Reconciliation Request
export interface RunReconciliationRequest {
  batchId: string;
  reconciliationDate: string;
  reconciliationType: 'Transactions' | 'Holdings' | 'Cash' | 'Prices' | 'Full';
  useTolerance?: 'strict' | 'standard' | 'relaxed';
}

// Reconciliation Result
export interface ReconciliationResult {
  batchId: string;
  reconciliationDate: string;
  totalItems: number;
  matchedItems: number;
  unmatchedItems: number;
  breakCount: number;
  isFullyReconciled: boolean;
  breaks: ReconciliationBreakInfo[];
  matchedTransactions: MatchedItemInfo[];
  unmatchedIBorItems: UnmatchedItemInfo[];
  unmatchedABorItems: UnmatchedItemInfo[];
}

export interface ReconciliationBreakInfo {
  breakId: string;
  breakType: ReconciliationBreakType;
  entityType: string;
  description: string;
  expectedValue?: string;
  actualValue?: string;
  variance?: number;
  accountId?: string;
  instrumentId?: string;
  breakDate?: string;
}

export interface MatchedItemInfo {
  iborEntityId: string;
  aborEntityId: string;
  entityType: string;
  date: string;
  amount?: number;
  instrumentTicker?: string;
  isExactMatch: boolean;
  difference?: number;
}

export interface UnmatchedItemInfo {
  entityId: string;
  source: BookOfRecord;
  entityType: string;
  date: string;
  amount?: number;
  units?: number;
  instrumentTicker?: string;
  description?: string;
}

// Approve/Reject Batch Request
export interface ApproveBatchRequest {
  approvedBy: string;
  comments?: string;
}

export interface RejectBatchRequest {
  approvedBy: string; // rejectedBy
  comments: string;  // Required for rejection
}

// Resolve Break Request
export interface ResolveBreakRequest {
  resolvedBy: string;
  resolutionAction: string;
  comments?: string;
}

// Filter interfaces for queries
export interface GetBatchesFilters {
  fromDate?: string;
  toDate?: string;
  status?: ReconciliationStatus;
}

export interface GetBreaksFilters {
  batchId?: string;
  status?: ReconciliationStatus;
  breakType?: ReconciliationBreakType;
}
