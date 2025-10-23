import React, { useState, useCallback, useMemo, memo } from "react";
import { api } from "../../services/api";
import { ClientNode, PortfolioNode, AccountNode } from "./TreeNode";
import { AlertCircle, TrendingUp, Search, X } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  // Filter function for search
  const filterMatches = useCallback((item: { name: string }, term: string): boolean => {
    return item.name.toLowerCase().includes(term.toLowerCase());
  }, []);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!data || !searchTerm.trim()) return data?.clients || [];

    const term = searchTerm.trim();
    return data.clients.filter(client => {
      // Check if client name matches
      if (filterMatches(client, term)) return true;

      // Check if any portfolio matches
      const hasMatchingPortfolio = client.portfolios.some(portfolio => {
        if (filterMatches(portfolio, term)) return true;

        // Check if any account matches
        return portfolio.accounts?.some(account => filterMatches(account, term));
      });

      return hasMatchingPortfolio;
    }).map(client => ({
      ...client,
      portfolios: client.portfolios.filter(portfolio => {
        // Keep portfolio if it matches or has matching accounts
        if (filterMatches(portfolio, term)) return true;
        return portfolio.accounts?.some(account => filterMatches(account, term));
      }).map(portfolio => ({
        ...portfolio,
        accounts: portfolio.accounts?.filter(account => filterMatches(account, term))
      }))
    }));
  }, [data, searchTerm, filterMatches]);

  // Auto-expand nodes when searching
  const autoExpandedNodes = useMemo(() => {
    if (!searchTerm.trim() || !filteredClients.length) return expandedNodes;

    const expanded = new Set(expandedNodes);
    filteredClients.forEach(client => {
      expanded.add(client.id);
      client.portfolios.forEach(portfolio => {
        expanded.add(portfolio.id);
      });
    });
    return expanded;
  }, [filteredClients, searchTerm, expandedNodes]);

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
      const nodesToUse = searchTerm.trim() ? autoExpandedNodes : expandedNodes;

      return portfolios.map((portfolio) => {
        const isExpanded = nodesToUse.has(portfolio.id);
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
    [expandedNodes, autoExpandedNodes, searchTerm, selectedNode, toggleNode, selectNode, renderAccountNodes]
  );

  // Render client nodes
  const renderClientNodes = useCallback(
    (clients: ClientNodeDto[]) => {
      const nodesToUse = searchTerm.trim() ? autoExpandedNodes : expandedNodes;

      return clients.map((client) => {
        const isExpanded = nodesToUse.has(client.id);
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
    [expandedNodes, autoExpandedNodes, searchTerm, selectedNode, toggleNode, selectNode, renderPortfolioNodes]
  );

  // Memoize expensive operations (must be before conditional returns)
  const lastUpdatedFormatted = useMemo(
    () => data ? new Date(data.lastUpdated).toLocaleString("en-GB") : "",
    [data]
  );

  const clientsRendered = useMemo(
    () => filteredClients.length ? renderClientNodes(filteredClients) : null,
    [filteredClients, renderClientNodes]
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
        <div className="flex items-center justify-between mb-3">
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

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients, portfolios, accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-xs text-gray-600">
            Found {filteredClients.length} {filteredClients.length === 1 ? 'result' : 'results'}
          </div>
        )}
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
