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

export const formatCurrency = (value: number): string => {
  return formatters.currency.format(value);
};

export const formatPercentage = (value: number): string => {
  return formatters.percentage.format(value);
};

export const formatDecimal = (value: number): string => {
  return formatters.decimal.format(value);
};

export const formatUnits = (value: number): string => {
  return formatters.units.format(value);
};

// Get CSS class for performance values
export const getPerformanceClass = (value: number): string => {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
};

// Format dates consistently
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};
