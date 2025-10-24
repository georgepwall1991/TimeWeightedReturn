import React, { useState } from "react";
import { X, User, Briefcase, Building, Calculator, TrendingUp, BarChart3, DollarSign, Shield, Target, Sparkles, Home } from "lucide-react";
import HoldingsExplorer from "../holdings/HoldingsExplorer";
import AccountDashboard from "../analytics/AccountDashboard";
import PerformanceDashboard from "../analytics/PerformanceDashboard";
import ContributionAnalysis from "../analytics/ContributionAnalysis";
import AttributionAnalysis from "../analytics/AttributionAnalysis";
import RiskAnalyticsDashboard from "../analytics/RiskAnalyticsDashboard";
import AdvancedChartsGallery from "../analytics/AdvancedChartsGallery";
import PortfolioOverview from "../analytics/PortfolioOverview";
import ClientOverview from "../analytics/ClientOverview";
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "performance" | "holdings" | "contributions" | "attribution" | "risk" | "advanced">("dashboard");

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab as typeof activeTab);
  };

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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {getTitle()}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedNode.name}</p>
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
          {/* Tab Navigation - 7 Tabs for accounts */}
          {selectedNode.type === "account" && (
            <div>
              <div className="border-b-2 border-gradient-to-r from-purple-200 via-indigo-200 to-blue-200 dark:from-purple-800/30 dark:via-indigo-800/30 dark:to-blue-800/30 mb-6 bg-gradient-to-r from-purple-50/20 via-indigo-50/20 to-blue-50/20 dark:from-purple-950/10 dark:via-indigo-950/10 dark:to-blue-950/10 rounded-t-lg">
                <nav className="-mb-0.5 flex space-x-1 sm:space-x-2 overflow-x-auto px-2">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`py-3 px-4 border-b-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 rounded-t-lg ${
                      activeTab === "dashboard"
                        ? "border-purple-500 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent shadow-glow"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30"
                    }`}
                  >
                    <div className="flex items-center">
                      <Home className={`w-4 h-4 mr-2 ${activeTab === "dashboard" ? "text-purple-600 dark:text-purple-400" : ""}`} />
                      <span className="text-xs sm:text-sm">Dashboard</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("performance")}
                    className={`py-3 px-4 border-b-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 rounded-t-lg ${
                      activeTab === "performance"
                        ? "border-blue-500 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent shadow-glow"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
                    }`}
                  >
                    <div className="flex items-center">
                      <TrendingUp className={`w-4 h-4 mr-2 ${activeTab === "performance" ? "text-blue-600 dark:text-blue-400" : ""}`} />
                      <span className="text-xs sm:text-sm">Performance</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("holdings")}
                    className={`py-3 px-4 border-b-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 rounded-t-lg ${
                      activeTab === "holdings"
                        ? "border-fuchsia-500 bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent shadow-glow"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-950/30"
                    }`}
                  >
                    <div className="flex items-center">
                      <BarChart3 className={`w-4 h-4 mr-2 ${activeTab === "holdings" ? "text-fuchsia-600 dark:text-fuchsia-400" : ""}`} />
                      <span className="text-xs sm:text-sm">Holdings</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("contributions")}
                    className={`py-3 px-4 border-b-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 rounded-t-lg ${
                      activeTab === "contributions"
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent shadow-glow"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    <div className="flex items-center">
                      <DollarSign className={`w-4 h-4 mr-2 ${activeTab === "contributions" ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                      <span className="text-xs sm:text-sm">Contributions</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("attribution")}
                    className={`py-3 px-4 border-b-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 rounded-t-lg ${
                      activeTab === "attribution"
                        ? "border-amber-500 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent shadow-glow"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30"
                    }`}
                  >
                    <div className="flex items-center">
                      <Target className={`w-4 h-4 mr-2 ${activeTab === "attribution" ? "text-amber-600 dark:text-amber-400" : ""}`} />
                      <span className="text-xs sm:text-sm">Attribution</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("risk")}
                    className={`py-3 px-4 border-b-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 rounded-t-lg ${
                      activeTab === "risk"
                        ? "border-red-500 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent shadow-glow"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30"
                    }`}
                  >
                    <div className="flex items-center">
                      <Shield className={`w-4 h-4 mr-2 ${activeTab === "risk" ? "text-red-600 dark:text-red-400" : ""}`} />
                      <span className="text-xs sm:text-sm">Risk</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("advanced")}
                    className={`py-3 px-4 border-b-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 rounded-t-lg ${
                      activeTab === "advanced"
                        ? "border-indigo-500 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent shadow-glow"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
                    }`}
                  >
                    <div className="flex items-center">
                      <Sparkles className={`w-4 h-4 mr-2 ${activeTab === "advanced" ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                      <span className="text-xs sm:text-sm">Advanced</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === "dashboard" && (
                <AccountDashboard
                  accountId={selectedNode.id}
                  accountName={selectedNode.name}
                  onNavigateToTab={handleNavigateToTab}
                />
              )}

              {activeTab === "performance" && (
                <PerformanceDashboard
                  accountId={selectedNode.id}
                  accountName={selectedNode.name}
                />
              )}

              {activeTab === "holdings" && (
                <HoldingsExplorer
                  accountId={selectedNode.id}
                  accountName={selectedNode.name}
                />
              )}

              {activeTab === "contributions" && (
                <ContributionAnalysis
                  accountId={selectedNode.id}
                  accountName={selectedNode.name}
                />
              )}

              {activeTab === "attribution" && (
                <AttributionAnalysis
                  data={[]}
                  accountName={selectedNode.name}
                  period="90 days"
                />
              )}

              {activeTab === "risk" && (
                <RiskAnalyticsDashboard
                  accountId={selectedNode.id}
                  accountName={selectedNode.name}
                />
              )}

              {activeTab === "advanced" && (
                <AdvancedChartsGallery
                  accountId={selectedNode.id}
                  accountName={selectedNode.name}
                />
              )}
            </div>
          )}

          {/* Portfolio/Client level analytics */}
          {selectedNode.type === "portfolio" && (
            <PortfolioOverview
              portfolioId={selectedNode.id}
              portfolioData={nodeData as PortfolioNodeDto}
            />
          )}

          {selectedNode.type === "client" && (
            <ClientOverview
              clientId={selectedNode.id}
              clientData={nodeData as ClientNodeDto}
            />
          )}

          {/* Current Metrics (if available) */}
          {nodeData.metrics && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
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
