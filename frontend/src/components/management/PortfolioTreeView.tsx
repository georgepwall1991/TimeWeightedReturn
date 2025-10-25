import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Briefcase,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import {
  useGetClientsQuery,
  useGetPortfoliosQuery,
  useGetAccountsQuery,
  useGetAccountHoldingsQuery,
} from '../../services/api';
import type { ClientDto, PortfolioDto, AccountDto } from '../../types/management';

export type TreeNodeType = 'client' | 'portfolio' | 'account' | 'holding';

export interface SelectedNode {
  type: TreeNodeType;
  id: string;
  data: ClientDto | PortfolioDto | AccountDto | any;
}

interface PortfolioTreeViewProps {
  onNodeSelect: (node: SelectedNode | null) => void;
  selectedNode: SelectedNode | null;
}

export default function PortfolioTreeView({ onNodeSelect, selectedNode }: PortfolioTreeViewProps) {
  const { data: clients = [], isLoading: clientsLoading } = useGetClientsQuery();
  const { data: portfolios = [], isLoading: portfoliosLoading } = useGetPortfoliosQuery();
  const { data: accounts = [], isLoading: accountsLoading } = useGetAccountsQuery();

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const isExpanded = (nodeId: string) => expandedNodes.has(nodeId);
  const isSelected = (type: TreeNodeType, id: string) =>
    selectedNode?.type === type && selectedNode?.id === id;

  if (clientsLoading || portfoliosLoading || accountsLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded ml-4"></div>
          <div className="h-8 bg-gray-200 rounded ml-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Portfolio Hierarchy
        </h2>
        <div className="space-y-1">
          {clients.map((client) => (
            <ClientNode
              key={client.id}
              client={client}
              portfolios={portfolios.filter((p) => p.clientId === client.id)}
              accounts={accounts}
              isExpanded={isExpanded}
              isSelected={isSelected}
              toggleNode={toggleNode}
              onNodeSelect={onNodeSelect}
            />
          ))}
          {clients.length === 0 && (
            <div className="text-sm text-gray-500 italic">No clients yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ClientNodeProps {
  client: ClientDto;
  portfolios: PortfolioDto[];
  accounts: AccountDto[];
  isExpanded: (id: string) => boolean;
  isSelected: (type: TreeNodeType, id: string) => boolean;
  toggleNode: (id: string) => void;
  onNodeSelect: (node: SelectedNode | null) => void;
}

function ClientNode({
  client,
  portfolios,
  accounts,
  isExpanded,
  isSelected,
  toggleNode,
  onNodeSelect,
}: ClientNodeProps) {
  const expanded = isExpanded(`client-${client.id}`);
  const selected = isSelected('client', client.id);

  return (
    <div>
      <button
        onClick={() => {
          toggleNode(`client-${client.id}`);
          onNodeSelect({ type: 'client', id: client.id, data: client });
        }}
        className={`w-full flex items-center space-x-2 px-2 py-2 rounded-lg hover:bg-gray-200 transition-colors ${
          selected ? 'bg-blue-100 hover:bg-blue-200' : ''
        }`}
      >
        <span className="text-gray-500">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <Building2 className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-900 flex-1 text-left">{client.name}</span>
        <span className="text-xs text-gray-500">{portfolios.length}</span>
      </button>

      {expanded && (
        <div className="ml-4 mt-1 space-y-1">
          {portfolios.map((portfolio) => (
            <PortfolioNode
              key={portfolio.id}
              portfolio={portfolio}
              accounts={accounts.filter((a) => a.portfolioId === portfolio.id)}
              isExpanded={isExpanded}
              isSelected={isSelected}
              toggleNode={toggleNode}
              onNodeSelect={onNodeSelect}
            />
          ))}
          {portfolios.length === 0 && (
            <div className="text-xs text-gray-400 italic px-2 py-1">No portfolios</div>
          )}
        </div>
      )}
    </div>
  );
}

interface PortfolioNodeProps {
  portfolio: PortfolioDto;
  accounts: AccountDto[];
  isExpanded: (id: string) => boolean;
  isSelected: (type: TreeNodeType, id: string) => boolean;
  toggleNode: (id: string) => void;
  onNodeSelect: (node: SelectedNode | null) => void;
}

function PortfolioNode({
  portfolio,
  accounts,
  isExpanded,
  isSelected,
  toggleNode,
  onNodeSelect,
}: PortfolioNodeProps) {
  const expanded = isExpanded(`portfolio-${portfolio.id}`);
  const selected = isSelected('portfolio', portfolio.id);

  return (
    <div>
      <button
        onClick={() => {
          toggleNode(`portfolio-${portfolio.id}`);
          onNodeSelect({ type: 'portfolio', id: portfolio.id, data: portfolio });
        }}
        className={`w-full flex items-center space-x-2 px-2 py-2 rounded-lg hover:bg-gray-200 transition-colors ${
          selected ? 'bg-blue-100 hover:bg-blue-200' : ''
        }`}
      >
        <span className="text-gray-500">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <Briefcase className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-900 flex-1 text-left">
          {portfolio.name}
        </span>
        <span className="text-xs text-gray-500">{accounts.length}</span>
      </button>

      {expanded && (
        <div className="ml-4 mt-1 space-y-1">
          {accounts.map((account) => (
            <AccountNode
              key={account.id}
              account={account}
              isExpanded={isExpanded}
              isSelected={isSelected}
              toggleNode={toggleNode}
              onNodeSelect={onNodeSelect}
            />
          ))}
          {accounts.length === 0 && (
            <div className="text-xs text-gray-400 italic px-2 py-1">No accounts</div>
          )}
        </div>
      )}
    </div>
  );
}

interface AccountNodeProps {
  account: AccountDto;
  isExpanded: (id: string) => boolean;
  isSelected: (type: TreeNodeType, id: string) => boolean;
  toggleNode: (id: string) => void;
  onNodeSelect: (node: SelectedNode | null) => void;
}

function AccountNode({
  account,
  isExpanded,
  isSelected,
  toggleNode,
  onNodeSelect,
}: AccountNodeProps) {
  const expanded = isExpanded(`account-${account.id}`);
  const selected = isSelected('account', account.id);

  // Fetch holdings only when expanded to avoid unnecessary API calls
  const date = new Date().toISOString().split('T')[0];
  const { data: holdingsData, isLoading: holdingsLoading } = useGetAccountHoldingsQuery(
    { accountId: account.id, date },
    { skip: !expanded } // Only fetch when expanded
  );

  const holdings = holdingsData?.holdings || [];
  const hasHoldings = holdings.length > 0 || account.holdingCount > 0;

  return (
    <div>
      <button
        onClick={() => {
          toggleNode(`account-${account.id}`);
          onNodeSelect({ type: 'account', id: account.id, data: account });
        }}
        className={`w-full flex items-center space-x-2 px-2 py-2 rounded-lg hover:bg-gray-200 transition-colors ${
          selected ? 'bg-blue-100 hover:bg-blue-200' : ''
        }`}
      >
        <span className="text-gray-500">
          {hasHoldings ? (
            expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4" />
          )}
        </span>
        <Wallet className="w-4 h-4 text-green-600" />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900">{account.name}</div>
          <div className="text-xs text-gray-500">{account.accountNumber}</div>
        </div>
        <span className="text-xs text-gray-400">{account.currency}</span>
      </button>

      {expanded && hasHoldings && (
        <div className="ml-4 mt-1 space-y-1">
          {holdingsLoading ? (
            <div className="flex items-center space-x-2 px-2 py-1.5">
              <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span className="text-xs text-gray-500">Loading holdings...</span>
            </div>
          ) : holdings.length > 0 ? (
            <>
              {/* Show first 3 holdings */}
              {holdings.slice(0, 3).map((holding) => (
                <div key={holding.instrumentId} className="flex items-center space-x-2 px-2 py-1.5">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">{holding.ticker}</span>
                  <span className="text-xs text-gray-500">
                    {holding.units.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
              {holdings.length > 3 && (
                <div className="text-xs text-gray-400 italic px-2 py-1">
                  + {holdings.length - 3} more
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-400 italic px-2 py-1">No holdings</div>
          )}
        </div>
      )}
    </div>
  );
}
