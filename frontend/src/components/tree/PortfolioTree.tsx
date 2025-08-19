import React, { useState, useCallback } from "react";
import { api } from "../../services/api";
import { ClientNode, PortfolioNode, AccountNode } from "./TreeNode";
import { Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import type {
  ClientNodeDto,
  PortfolioNodeDto,
  AccountNodeDto,
} from "../../types/api";

interface NodeSelection {
  type: "client" | "portfolio" | "account";
  id: string;
  name: string;
}

interface PortfolioTreeProps {
  onNodeSelect: (selection: NodeSelection | null) => void;
}

// Helper functions for rendering nodes
const renderAccountNodes = (
  accounts: AccountNodeDto[],
  level: number,
  selectedNode: string | null,
  selectNode: (selection: NodeSelection | null) => void
) => {
  return accounts.map((account) => (
    <AccountNode
      key={account.id}
      node={account}
      level={level}
      isExpanded={false}
      hasChildren={false}
      onToggle={() => {}}
      onSelect={() =>
        selectNode({ type: "account", id: account.id, name: account.name })
      }
      isSelected={selectedNode === account.id}
    />
  ));
};

const renderPortfolioNodes = (
  portfolios: PortfolioNodeDto[],
  level: number,
  expandedNodes: Set<string>,
  selectedNode: string | null,
  toggleNode: (nodeId: string) => void,
  selectNode: (selection: NodeSelection | null) => void
) => {
  return portfolios.map((portfolio) => {
    const isExpanded = expandedNodes.has(portfolio.id);
    const hasChildren = portfolio.accounts.length > 0;

    return (
      <PortfolioNode
        key={portfolio.id}
        node={portfolio}
        level={level}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onToggle={() => toggleNode(portfolio.id)}
        onSelect={() =>
          selectNode({
            type: "portfolio",
            id: portfolio.id,
            name: portfolio.name,
          })
        }
        isSelected={selectedNode === portfolio.id}
      >
        {isExpanded && renderAccountNodes(portfolio.accounts, level + 1, selectedNode, selectNode)}
      </PortfolioNode>
    );
  });
};

const renderClientNodes = (
  clients: ClientNodeDto[],
  expandedNodes: Set<string>,
  selectedNode: string | null,
  toggleNode: (nodeId: string) => void,
  selectNode: (selection: NodeSelection | null) => void
) => {
  return clients.map((client) => {
    const isExpanded = expandedNodes.has(client.id);
    const hasChildren = client.portfolios.length > 0;

    return (
      <ClientNode
        key={client.id}
        node={client}
        level={0}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onToggle={() => toggleNode(client.id)}
        onSelect={() =>
          selectNode({ type: "client", id: client.id, name: client.name })
        }
        isSelected={selectedNode === client.id}
      >
        {isExpanded && renderPortfolioNodes(client.portfolios, 1, expandedNodes, selectedNode, toggleNode, selectNode)}
      </ClientNode>
    );
  });
};


const PortfolioTree: React.FC<PortfolioTreeProps> = ({ onNodeSelect }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Use the updated API hook with empty object as parameter
  const { data, error, isLoading, refetch } = api.useGetPortfolioTreeQuery({});

  const toggleNode = useCallback((nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  }, [expandedNodes]);

  // Select node
  const selectNode = useCallback(
    (selection: NodeSelection | null) => {
      setSelectedNode(selection?.id ?? null);
      onNodeSelect(selection);
    },
    [onNodeSelect]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-gray-600">Loading portfolio tree...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center text-red-600 mb-3">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Failed to load portfolio tree</span>
        </div>
        <button onClick={() => refetch()} className="btn-primary text-sm">
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.clients.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No portfolio data available</p>
      </div>
    );
  }

  return (
    <div className="portfolio-tree">
      {/* Header with summary */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Portfolio Overview
          </h2>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Value</div>
            <div className="text-lg font-semibold currency">
              {formatCurrency(data.totalValueGBP)}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Last updated: {new Date(data.lastUpdated).toLocaleString("en-GB")}
        </div>
      </div>

      {/* Tree content */}
      <div className="overflow-auto max-h-screen">
        {renderClientNodes(data.clients, expandedNodes, selectedNode, toggleNode, selectNode)}
      </div>
    </div>
  );
};

export default PortfolioTree;
