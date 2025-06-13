// Number formatters following UK conventions
export const formatters = {
  currency: new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),

  percentage: new Intl.NumberFormat('en-GB', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }),

  decimal: new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }),

  units: new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }),
};

// Safe number validation
const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

export const formatCurrency = (value: number | undefined | null): string => {
  if (!isValidNumber(value)) return '£0.00';
  return formatters.currency.format(value);
};

export const formatPercentage = (value: number | undefined | null): string => {
  if (!isValidNumber(value)) return '0.00%';
  return formatters.percentage.format(value);
};

export const formatDecimal = (value: number | undefined | null): string => {
  if (!isValidNumber(value)) return '0.00';
  return formatters.decimal.format(value);
};

export const formatUnits = (value: number | undefined | null): string => {
  if (!isValidNumber(value)) return '0';
  return formatters.units.format(value);
};

// Get CSS class for performance values
export const getPerformanceClass = (value: number | undefined | null): string => {
  if (!isValidNumber(value)) return 'neutral';
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
};

// Format dates consistently
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Invalid Date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateForApi = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};
