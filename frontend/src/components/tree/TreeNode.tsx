import React from 'react';
import { ChevronRight, ChevronDown, User, Folder, Briefcase } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import type { ClientNodeDto, PortfolioNodeDto, AccountNodeDto } from '../../types/api';

interface TreeNodeProps {
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

interface ClientNodeProps extends TreeNodeProps {
  node: ClientNodeDto;
  children?: React.ReactNode;
}

interface PortfolioNodeProps extends TreeNodeProps {
  node: PortfolioNodeDto;
  children?: React.ReactNode;
}

interface AccountNodeProps extends TreeNodeProps {
  node: AccountNodeDto;
}

// Base TreeNode component
const TreeNodeBase: React.FC<{
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: string;
  children?: React.ReactNode;
}> = ({
  level,
  isExpanded,
  hasChildren,
  onToggle,
  onSelect,
  isSelected,
  icon,
  title,
  subtitle,
  value,
  children,
}) => {
  return (
    <div className="select-none">
      <div
        className={`
          flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors
          ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''}
        `}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={onSelect}
      >
        {/* Expand/Collapse Button */}
        <div className="w-5 h-5 flex items-center justify-center mr-2">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Icon */}
        <div className="w-5 h-5 flex items-center justify-center mr-3 text-gray-600">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{title}</div>
          <div className="text-sm text-gray-500 truncate">{subtitle}</div>
        </div>

        {/* Value */}
        <div className="ml-4 text-right">
          <div className="font-medium text-gray-900 currency">{value}</div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && children && (
        <div className="transition-all duration-200 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );
};

// Client Node
export const ClientNode: React.FC<ClientNodeProps> = ({
  node,
  level,
  isExpanded,
  hasChildren,
  onToggle,
  onSelect,
  isSelected,
  children,
}) => {
  const subtitle = `${node.portfoliosCount} ${node.portfoliosCount === 1 ? 'portfolio' : 'portfolios'}`;

  return (
    <TreeNodeBase
      level={level}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
      onToggle={onToggle}
      onSelect={onSelect}
      isSelected={isSelected}
      icon={<User className="w-4 h-4" />}
      title={node.name}
      subtitle={subtitle}
      value={formatCurrency(node.totalValueGBP)}
    >
      {children}
    </TreeNodeBase>
  );
};

// Portfolio Node
export const PortfolioNode: React.FC<PortfolioNodeProps> = ({
  node,
  level,
  isExpanded,
  hasChildren,
  onToggle,
  onSelect,
  isSelected,
  children,
}) => {
  const subtitle = `${node.accountsCount} ${node.accountsCount === 1 ? 'account' : 'accounts'}`;

  return (
    <TreeNodeBase
      level={level}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
      onToggle={onToggle}
      onSelect={onSelect}
      isSelected={isSelected}
      icon={<Folder className="w-4 h-4" />}
      title={node.name}
      subtitle={subtitle}
      value={formatCurrency(node.totalValueGBP)}
    >
      {children}
    </TreeNodeBase>
  );
};

// Account Node
export const AccountNode: React.FC<AccountNodeProps> = ({
  node,
  level,
  isExpanded,
  hasChildren,
  onToggle,
  onSelect,
  isSelected,
}) => {
  const subtitle = `${node.currency} • ${node.holdingsCount} ${node.holdingsCount === 1 ? 'holding' : 'holdings'}`;

  return (
    <TreeNodeBase
      level={level}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
      onToggle={onToggle}
      onSelect={onSelect}
      isSelected={isSelected}
      icon={<Briefcase className="w-4 h-4" />}
      title={node.name}
      subtitle={subtitle}
      value={formatCurrency(node.totalValueGBP)}
    />
  );
};
