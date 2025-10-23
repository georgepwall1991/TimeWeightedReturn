import React, { memo, useMemo } from "react";
import { ChevronRight, ChevronDown, User, Briefcase, FolderOpen } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import type {
  ClientNodeDto,
  PortfolioNodeDto,
  AccountNodeDto,
} from "../../types/api";

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

// Asset type breakdown component for accounts
const AssetTypeIndicators = memo<{
  cashValue?: number;
  securityValue?: number;
  totalValue: number;
}>(({ cashValue = 0, securityValue = 0, totalValue }) => {
  // Safe number validation
  const safeCashValue = typeof cashValue === 'number' && !isNaN(cashValue) ? cashValue : 0;
  const safeSecurityValue = typeof securityValue === 'number' && !isNaN(securityValue) ? securityValue : 0;
  const safeTotalValue = typeof totalValue === 'number' && !isNaN(totalValue) && totalValue > 0 ? totalValue : 0;

  const percentages = useMemo(() => {
    if (safeTotalValue === 0) return null;
    return {
      cash: Math.round((safeCashValue / safeTotalValue) * 100),
      security: Math.round((safeSecurityValue / safeTotalValue) * 100),
    };
  }, [safeCashValue, safeSecurityValue, safeTotalValue]);

  if (!percentages) return null;

  return (
    <div className="flex items-center space-x-1 ml-2">
      {safeCashValue > 0 && (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500 ml-1">{percentages.cash}%</span>
        </div>
      )}
      {safeSecurityValue > 0 && (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-500 ml-1">{percentages.security}%</span>
        </div>
      )}
    </div>
  );
});

// Base TreeNode component
const BaseNode = memo<TreeNodeProps & {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  rawValue?: number; // Add raw value for calculations
  assetBreakdown?: { cashValue?: number; securityValue?: number; };
  children?: React.ReactNode;
}>(({
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
  rawValue,
  assetBreakdown,
  children,
}) => {
  const indentWidth = useMemo(() => level * 20, [level]);

  return (
    <div>
      <div
        className={`flex items-center py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors ${
          isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
        }`}
        style={{ paddingLeft: `${12 + indentWidth}px` }}
        onClick={onSelect}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="w-4 h-4 flex items-center justify-center mr-2 text-gray-400 hover:text-gray-600"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )
          ) : (
            <div className="w-3 h-3" />
          )}
        </button>

        {/* Icon */}
        <div className="mr-3 text-gray-500">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {title}
              </div>
              {subtitle && (
                <div className="text-xs text-gray-500 truncate">{subtitle}</div>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {/* Asset type indicators for accounts */}
              {assetBreakdown && rawValue && (
                <AssetTypeIndicators
                  cashValue={assetBreakdown.cashValue}
                  securityValue={assetBreakdown.securityValue}
                  totalValue={rawValue}
                />
              )}
              {/* Value */}
              {value && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {value}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {children && isExpanded && <div>{children}</div>}
    </div>
  );
});

// Client Node
export const ClientNode = memo<ClientNodeProps>(({
  node,
  level,
  isExpanded,
  hasChildren,
  onToggle,
  onSelect,
  isSelected,
  children,
}) => {
  const subtitle = useMemo(
    () => `${node.portfoliosCount} ${node.portfoliosCount === 1 ? 'portfolio' : 'portfolios'}`,
    [node.portfoliosCount]
  );

  return (
    <BaseNode
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
      rawValue={Number(node.totalValueGBP)}
    >
      {children}
    </BaseNode>
  );
});

// Portfolio Node
export const PortfolioNode = memo<PortfolioNodeProps>(({
  node,
  level,
  isExpanded,
  hasChildren,
  onToggle,
  onSelect,
  isSelected,
  children,
}) => {
  const subtitle = useMemo(
    () => `${node.accountsCount} ${node.accountsCount === 1 ? 'account' : 'accounts'}`,
    [node.accountsCount]
  );

  return (
    <BaseNode
      level={level}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
      onToggle={onToggle}
      onSelect={onSelect}
      isSelected={isSelected}
      icon={<FolderOpen className="w-4 h-4" />}
      title={node.name}
      subtitle={subtitle}
      value={formatCurrency(node.totalValueGBP)}
      rawValue={Number(node.totalValueGBP)}
    >
      {children}
    </BaseNode>
  );
});

// Account Node
export const AccountNode = memo<AccountNodeProps>(({ node, ...props }) => {
  // Safe mock asset breakdown - in real app this would come from the API
  const safeTotalValue = typeof node.totalValueGBP === 'number' && !isNaN(node.totalValueGBP) ? node.totalValueGBP : 0;

  const mockAssetBreakdown = useMemo(() => {
    return safeTotalValue > 0 ? {
      cashValue: safeTotalValue * 0.2, // Assume 20% cash for demo
      securityValue: safeTotalValue * 0.8, // Assume 80% securities for demo
    } : undefined;
  }, [safeTotalValue]);

  return (
    <BaseNode
      level={props.level}
      isExpanded={props.isExpanded}
      hasChildren={props.hasChildren}
      onToggle={props.onToggle}
      onSelect={props.onSelect}
      isSelected={props.isSelected}
      icon={<Briefcase className="w-4 h-4" />}
      title={node.name}
      subtitle={node.accountNumber}
      value={formatCurrency(safeTotalValue)}
      rawValue={safeTotalValue}
      assetBreakdown={mockAssetBreakdown}
    />
  );
});
