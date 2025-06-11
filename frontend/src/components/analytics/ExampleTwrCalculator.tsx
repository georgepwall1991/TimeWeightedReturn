import React, { useState } from 'react';
import { CalculationErrorBoundary } from '../layout/CalculationErrorBoundary';

interface ExampleTwrCalculatorProps {
  accountId: string;
  startDate?: string;
  endDate?: string;
}

// This is a mock component that demonstrates error boundary usage
const TwrCalculationCore: React.FC<ExampleTwrCalculatorProps> = ({ accountId, startDate, endDate }) => {
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateTwr = async () => {
    setIsLoading(true);
    try {
      // Mock API call that might throw an error
      const response = await fetch(`/api/accounts/${accountId}/twr?from=${startDate}&to=${endDate}`);
      if (!response.ok) {
        throw new Error(`Failed to calculate TWR: ${response.statusText}`);
      }
      const data = await response.json();
      setResult(data.twr);
    } catch (error) {
      // Re-throw to let error boundary catch it
      throw new Error(`TWR calculation failed for account ${accountId}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate a component that might throw an error
  const triggerError = () => {
    throw new Error('Simulated calculation error for testing');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Time Weighted Return
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account ID: {accountId}
          </label>
          <p className="text-sm text-gray-500">
            Period: {startDate} to {endDate}
          </p>
        </div>

        {result !== null && (
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-sm font-medium text-green-800">
              TWR: {(result * 100).toFixed(4)}%
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={calculateTwr}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? 'Calculating...' : 'Calculate TWR'}
          </button>

          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={triggerError}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              Test Error
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ExampleTwrCalculator: React.FC<ExampleTwrCalculatorProps> = (props) => {
  const handleRetry = () => {
    // Force component re-mount by changing key
    window.location.reload();
  };

  return (
    <CalculationErrorBoundary onRetry={handleRetry}>
      <TwrCalculationCore {...props} />
    </CalculationErrorBoundary>
  );
};
