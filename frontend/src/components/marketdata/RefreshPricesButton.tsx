import { RefreshCw } from 'lucide-react';
import { useRefreshAllPricesMutation } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface RefreshPricesButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  showText?: boolean;
}

export default function RefreshPricesButton({
  size = 'md',
  variant = 'primary',
  showText = true,
}: RefreshPricesButtonProps) {
  const [refreshAllPrices, { isLoading: isRefreshing }] = useRefreshAllPricesMutation();
  const { success, error: showError } = useToast();

  const handleRefresh = async () => {
    try {
      const result = await refreshAllPrices({}).unwrap();
      success(`Updated ${result.updatedInstruments} of ${result.totalInstruments} instruments`);
    } catch (err) {
      showError('Failed to refresh prices. Please try again.');
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200',
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`inline-flex items-center ${sizeClasses[size]} ${variantClasses[variant]} font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
      title="Refresh market prices"
    >
      <RefreshCw className={`${iconSizes[size]} ${isRefreshing ? 'animate-spin' : ''} ${showText ? 'mr-2' : ''}`} />
      {showText && (isRefreshing ? 'Refreshing...' : 'Refresh Prices')}
    </button>
  );
}
