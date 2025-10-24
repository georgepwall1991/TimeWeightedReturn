import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { api } from "../../services/api";
import { ClientNode, PortfolioNode, AccountNode } from "./TreeNode";
import { AlertCircle, TrendingUp, Search, X, ChevronsDown, ChevronsUp } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { TreeNodeSkeleton } from "../common/Skeleton";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Use the updated API hook with empty object as parameter
  const { data, error, isLoading, refetch } = api.useGetPortfolioTreeQuery({});

  // Debounce search term (300ms delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const toggleNode = useCallback((nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  }, [expandedNodes]);

  // Expand all nodes
  const expandAll = useCallback(() => {
    if (!data) return;
    const allNodeIds = new Set<string>();
    data.clients.forEach(client => {
      allNodeIds.add(client.id);
      client.portfolios.forEach(portfolio => {
        allNodeIds.add(portfolio.id);
      });
    });
    setExpandedNodes(allNodeIds);
  }, [data]);

  // Collapse all nodes
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

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

  // Filter clients based on search term (using debounced value)
  const filteredClients = useMemo(() => {
    if (!data || !debouncedSearchTerm.trim()) return data?.clients || [];

    const term = debouncedSearchTerm.trim();
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
  }, [data, debouncedSearchTerm, filterMatches]);

  // Auto-expand nodes when searching
  const autoExpandedNodes = useMemo(() => {
    if (!debouncedSearchTerm.trim() || !filteredClients.length) return expandedNodes;

    const expanded = new Set(expandedNodes);
    filteredClients.forEach(client => {
      expanded.add(client.id);
      client.portfolios.forEach(portfolio => {
        expanded.add(portfolio.id);
      });
    });
    return expanded;
  }, [filteredClients, debouncedSearchTerm, expandedNodes]);

  // Flatten filtered items for keyboard navigation
  const filteredNavigableItems = useMemo(() => {
    const items: Array<{ id: string; type: 'client' | 'portfolio' | 'account'; name: string }> = [];

    filteredClients.forEach(client => {
      items.push({ id: client.id, type: 'client', name: client.name });
      client.portfolios.forEach(portfolio => {
        items.push({ id: portfolio.id, type: 'portfolio', name: portfolio.name });
        portfolio.accounts?.forEach(account => {
          items.push({ id: account.id, type: 'account', name: account.name });
        });
      });
    });

    return items;
  }, [filteredClients]);

  // Keyboard navigation
  const { highlightedItem } = useKeyboardNavigation({
    items: filteredNavigableItems,
    onSelect: selectNode,
    onClear: () => setSearchTerm(""),
    enabled: true,
  });

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
          searchTerm={debouncedSearchTerm}
          isKeyboardHighlighted={highlightedItem?.id === account.id}
        />
      ));
    },
    [selectedNode, selectNode, debouncedSearchTerm, highlightedItem]
  );

  // Render portfolio nodes
  const renderPortfolioNodes = useCallback(
    (portfolios: PortfolioNodeDto[], level: number) => {
      const nodesToUse = debouncedSearchTerm.trim() ? autoExpandedNodes : expandedNodes;

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
            searchTerm={debouncedSearchTerm}
            isKeyboardHighlighted={highlightedItem?.id === portfolio.id}
          >
            {isExpanded && renderAccountNodes(portfolio.accounts, level + 1)}
          </PortfolioNode>
        );
      });
    },
    [expandedNodes, autoExpandedNodes, debouncedSearchTerm, selectedNode, toggleNode, selectNode, renderAccountNodes, highlightedItem]
  );

  // Render client nodes
  const renderClientNodes = useCallback(
    (clients: ClientNodeDto[]) => {
      const nodesToUse = debouncedSearchTerm.trim() ? autoExpandedNodes : expandedNodes;

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
            searchTerm={debouncedSearchTerm}
            isKeyboardHighlighted={highlightedItem?.id === client.id}
          >
            {isExpanded && renderPortfolioNodes(client.portfolios, 1)}
          </ClientNode>
        );
      });
    },
    [expandedNodes, autoExpandedNodes, debouncedSearchTerm, selectedNode, toggleNode, selectNode, renderPortfolioNodes, highlightedItem]
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

        {/* Search Box and Expand/Collapse Buttons */}
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients, portfolios, accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-search-input="true"
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
          <button
            onClick={expandAll}
            className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 flex items-center gap-1.5 text-gray-700 transition-colors"
            title="Expand all nodes"
          >
            <ChevronsDown className="w-4 h-4" />
            <span className="hidden sm:inline">Expand</span>
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 flex items-center gap-1.5 text-gray-700 transition-colors"
            title="Collapse all nodes"
          >
            <ChevronsUp className="w-4 h-4" />
            <span className="hidden sm:inline">Collapse</span>
          </button>
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
        {searchTerm && filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No results found</h3>
            <p className="text-xs text-gray-500 mb-4">
              No clients, portfolios, or accounts match "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear search
            </button>
          </div>
        ) : (
          clientsRendered
        )}
      </div>
    </div>
  );
};

export default memo(PortfolioTree);
