import React, { useState } from "react";
import { X, User, Briefcase, Building, Calculator, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import TwrCalculator from "../analytics/TwrCalculator";
import HoldingsExplorer from "../holdings/HoldingsExplorer";
import type { ClientNodeDto, PortfolioNodeDto, AccountNodeDto } from "../../types/api";

interface NodeSelection {
  type: "client" | "portfolio" | "account";
  id: string;
  name: string;
}

interface DetailPanelProps {
  selectedNode: NodeSelection | null;
  nodeData: ClientNodeDto | PortfolioNodeDto | AccountNodeDto | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  selectedNode,
  nodeData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "holdings">("overview");
  if (!selectedNode || !nodeData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No Selection
          </h3>
          <p className="text-sm text-gray-400">
            Select a client, portfolio, or account from the tree to view details
          </p>
        </div>
      </div>
    );
  }

  const getIcon = () => {
    switch (selectedNode.type) {
      case "client":
        return <User className="w-5 h-5 text-blue-600" />;
      case "portfolio":
        return <Briefcase className="w-5 h-5 text-green-600" />;
      case "account":
        return <Building className="w-5 h-5 text-purple-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTitle = () => {
    switch (selectedNode.type) {
      case "client":
        return "Client Details";
      case "portfolio":
        return "Portfolio Details";
      case "account":
        return "Account Details";
      default:
        return "Details";
    }
  };

  const getColorTheme = () => {
    switch (selectedNode.type) {
      case "client":
        return "blue";
      case "portfolio":
        return "green";
      case "account":
        return "purple";
      default:
        return "gray";
    }
  };

  const theme = getColorTheme();

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className={`bg-${theme}-50 border-b border-${theme}-100 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${theme}-100 rounded-lg`}>
              {getIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {getTitle()}
              </h2>
              <p className="text-sm text-gray-600">{selectedNode.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close details panel"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium text-gray-900">
                  {nodeData.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Value:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(nodeData.totalValueGBP)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Holdings Count:</span>
                <span className="text-sm font-medium text-gray-900">
                  {nodeData.holdingsCount}
                </span>
              </div>

              {/* Account-specific details */}
              {selectedNode.type === "account" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Number:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(nodeData as AccountNodeDto).accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Currency:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(nodeData as AccountNodeDto).currency}
                    </span>
                  </div>
                </>
              )}

              {/* Portfolio-specific details */}
              {selectedNode.type === "portfolio" && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accounts Count:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(nodeData as PortfolioNodeDto).accountsCount}
                  </span>
                </div>
              )}

              {/* Client-specific details */}
              {selectedNode.type === "client" && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Portfolios Count:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(nodeData as ClientNodeDto).portfoliosCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation - Only for accounts */}
          {selectedNode.type === "account" && (
            <div>
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "overview"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Overview
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("holdings")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "holdings"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Holdings
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "analytics"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <Calculator className="w-4 h-4 mr-2" />
                      Analytics
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-800">
                      Account Overview
                    </h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Quick overview of account performance and key metrics.
                  </p>
                  <div className="text-xs text-blue-600">
                    Coming soon:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Account performance summary</li>
                      <li>Asset allocation breakdown</li>
                      <li>Historical value chart</li>
                      <li>Performance vs benchmark</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "holdings" && (
                <HoldingsExplorer
                  accountId={selectedNode.id}
                  accountName={selectedNode.name}
                />
              )}

              {activeTab === "analytics" && (
                <TwrCalculator
                  accountId={selectedNode.id}
                  accountName={selectedNode.name}
                />
              )}
            </div>
          )}

          {/* Placeholder for Portfolio/Client level analytics */}
          {selectedNode.type !== "account" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-blue-800">
                  Performance Analytics
                </h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                {selectedNode.type === "portfolio"
                  ? "Portfolio-level performance analytics will be available soon."
                  : "Client-level performance analytics will be available soon."}
              </p>
              <div className="text-xs text-blue-600">
                Features coming soon:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Aggregate time-weighted returns</li>
                  <li>Asset allocation analysis</li>
                  <li>Performance attribution</li>
                  <li>Risk metrics</li>
                </ul>
              </div>
            </div>
          )}

          {/* Current Metrics (if available) */}
          {nodeData.metrics && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-3">
                Current Performance Metrics
              </h3>
              <div className="space-y-2">
                {nodeData.metrics.timeWeightedReturn !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">TWR:</span>
                    <span className="text-sm font-medium text-green-900">
                      {(nodeData.metrics.timeWeightedReturn * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
                {nodeData.metrics.annualizedReturn !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Annualized:</span>
                    <span className="text-sm font-medium text-green-900">
                      {(nodeData.metrics.annualizedReturn * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
