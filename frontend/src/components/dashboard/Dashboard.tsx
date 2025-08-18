import React from 'react';
import { TrendingUp, Users, Briefcase, DollarSign, ShieldCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    // These would be fetched from an API
    const stats = {
        totalValue: 1234567.89,
        totalClients: 2,
        totalPortfolios: 2,
        totalAccounts: 3,
        overallReturn: 0.05,
        alerts: 2,
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Value</p>
                            <p className="text-2xl font-semibold text-gray-900">${stats.totalValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Overall Return</p>
                            <p className="text-2xl font-semibold text-gray-900">{(stats.overallReturn * 100).toFixed(2)}%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Clients</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalClients}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <Briefcase className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Portfolios</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalPortfolios}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Alerts</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.alerts}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Accounts</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalAccounts}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/portfolio-tree" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                    <Briefcase className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Portfolio Tree</h3>
                    <p className="text-sm text-gray-600 mt-1">View and manage all portfolios</p>
                </Link>
                <Link to="/attribution" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                    <BarChart3 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Attribution Analysis</h3>
                    <p className="text-sm text-gray-600 mt-1">Analyze portfolio performance</p>
                </Link>
                <Link to="/risk" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                    <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Risk Analysis</h3>
                    <p className="text-sm text-gray-600 mt-1">Assess portfolio risk metrics</p>
                </Link>
                <Link to="/reports" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                    <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Reporting</h3>
                    <p className="text-sm text-gray-600 mt-1">Generate client reports</p>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
