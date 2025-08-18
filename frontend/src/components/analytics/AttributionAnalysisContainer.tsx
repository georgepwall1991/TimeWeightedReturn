import React, { useState } from 'react';
import { useGetPortfolioTreeQuery, useGetBenchmarksQuery, useCalculateAttributionMutation } from '../../services/api';
import AttributionAnalysis from './AttributionAnalysis';
import { Loader2, AlertCircle } from 'lucide-react';

export const AttributionAnalysisContainer: React.FC = () => {
    const [portfolioId, setPortfolioId] = useState<string>('');
    const [benchmarkId, setBenchmarkId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const { data: portfolioTree } = useGetPortfolioTreeQuery({ date: new Date().toISOString().split('T')[0] });
    const { data: benchmarks } = useGetBenchmarksQuery();
    const [calculateAttribution, { data: attributionData, isLoading, error }] = useCalculateAttributionMutation();

    const handleCalculate = () => {
        if (portfolioId && benchmarkId && startDate && endDate) {
            calculateAttribution({ portfolioId, benchmarkId, startDate, endDate });
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Performance Attribution Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">Portfolio</label>
                    <select
                        id="portfolio"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={portfolioId}
                        onChange={(e) => setPortfolioId(e.target.value)}
                    >
                        <option value="">Select a portfolio</option>
                        {portfolioTree?.clients.map(client => (
                            client.portfolios.map(portfolio => (
                                <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
                            ))
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="benchmark" className="block text-sm font-medium text-gray-700">Benchmark</label>
                    <select
                        id="benchmark"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={benchmarkId}
                        onChange={(e) => setBenchmarkId(e.target.value)}
                    >
                        <option value="">Select a benchmark</option>
                        {benchmarks?.map(benchmark => (
                            <option key={benchmark.id} value={benchmark.id}>{benchmark.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                        type="date"
                        id="startDate"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                        type="date"
                        id="endDate"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
            <button
                onClick={handleCalculate}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calculate'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Failed to calculate attribution analysis.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {attributionData && (
                <div className="mt-6">
                    <AttributionAnalysis
                        data={attributionData.results}
                        accountName={portfolioTree?.clients.flatMap(c => c.portfolios).find(p => p.id === portfolioId)?.name ?? ''}
                        benchmarkName={benchmarks?.find(b => b.id === benchmarkId)?.name ?? ''}
                        period={`${startDate} to ${endDate}`}
                    />
                </div>
            )}
        </div>
    );
};
