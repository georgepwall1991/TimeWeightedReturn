import React, { useState, useCallback, useMemo, memo } from "react";
import { api } from "../../services/api";
import { ClientNode, PortfolioNode, AccountNode } from "./TreeNode";
import { AlertCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { TreeNodeSkeleton } from "../common/Skeleton";
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

  // Render account nodes
  const renderAccountNodes = useCallback(
    (accounts: AccountNodeDto[], level: number) => {
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
    },
    [selectedNode, selectNode]
  );

  // Render portfolio nodes
  const renderPortfolioNodes = useCallback(
    (portfolios: PortfolioNodeDto[], level: number) => {
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
            {isExpanded && renderAccountNodes(portfolio.accounts, level + 1)}
          </PortfolioNode>
        );
      });
    },
    [expandedNodes, selectedNode, toggleNode, selectNode, renderAccountNodes]
  );

  // Render client nodes
  const renderClientNodes = useCallback(
    (clients: ClientNodeDto[]) => {
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
            {isExpanded && renderPortfolioNodes(client.portfolios, 1)}
          </ClientNode>
        );
      });
    },
    [expandedNodes, selectedNode, toggleNode, selectNode, renderPortfolioNodes]
  );

  // Memoize expensive operations (must be before conditional returns)
  const lastUpdatedFormatted = useMemo(
    () => data ? new Date(data.lastUpdated).toLocaleString("en-GB") : "",
    [data]
  );

  const clientsRendered = useMemo(
    () => data ? renderClientNodes(data.clients) : null,
    [data, renderClientNodes]
  );

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <TreeNodeSkeleton key={i} />
        ))}
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
          Last updated: {lastUpdatedFormatted}
        </div>
      </div>

      {/* Tree content */}
      <div className="overflow-auto max-h-screen">
        {clientsRendered}
      </div>
    </div>
  );
};

export default memo(PortfolioTree);
