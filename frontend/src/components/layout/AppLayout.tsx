import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Menu, X, TrendingUp, GripVertical, MoreVertical, RotateCcw } from 'lucide-react';
import PortfolioTree from '../tree/PortfolioTree';
import DetailPanel from './DetailPanel';
import { UserMenu } from './UserMenu';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';
import { api } from '../../services/api';
import type { ClientNodeDto, PortfolioNodeDto, AccountNodeDto } from '../../types/api';

interface NodeSelection {
  type: 'client' | 'portfolio' | 'account';
  id: string;
  name: string;
}

const AppLayout: React.FC = () => {
  // Set up automatic token refresh
  useTokenRefresh();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    // Load saved width from localStorage or use default
    const savedWidth = localStorage.getItem('portfolioSidebarWidth');
    return savedWidth ? parseInt(savedWidth, 10) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeSelection | null>(null);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);

  // Refs for resize functionality
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sidebar width constraints
  const MIN_SIDEBAR_WIDTH = 240; // Minimum width (15rem)
  const MAX_SIDEBAR_WIDTH = 600; // Maximum width (37.5rem)

  // Save sidebar width to localStorage
  useEffect(() => {
    localStorage.setItem('portfolioSidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  // Fetch portfolio tree data to get node details
  const { data: treeData } = api.useGetPortfolioTreeQuery({});

  const handleNodeSelect = (selection: NodeSelection | null) => {
    setSelectedNode(selection);
  };

  // Find the selected node data from the tree
  const getSelectedNodeData = (): ClientNodeDto | PortfolioNodeDto | AccountNodeDto | null => {
    if (!selectedNode || !treeData) return null;

    // Search through the tree structure
    for (const client of treeData.clients) {
      if (selectedNode.type === 'client' && client.id === selectedNode.id) {
        return client;
      }

      for (const portfolio of client.portfolios) {
        if (selectedNode.type === 'portfolio' && portfolio.id === selectedNode.id) {
          return portfolio;
        }

        for (const account of portfolio.accounts) {
          if (selectedNode.type === 'account' && account.id === selectedNode.id) {
            return account;
          }
        }
      }
    }

    return null;
  };

  const selectedNodeData = getSelectedNodeData();

  // Reset sidebar width
  const resetSidebarWidth = () => {
    setSidebarWidth(320);
    setShowSidebarMenu(false);
  };

  // Start resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;

    // Add event listeners to document for better drag experience
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + deltaX;

    // Apply constraints
    const constrainedWidth = Math.min(
      Math.max(newWidth, MIN_SIDEBAR_WIDTH),
      MAX_SIDEBAR_WIDTH
    );

    setSidebarWidth(constrainedWidth);
  }, [isResizing]);

  // Stop resizing
  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isResizing]);

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B: Toggle sidebar
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }

      // Ctrl+Shift+R: Reset sidebar width
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        setSidebarWidth(320);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSidebarMenu(false);
      }
    };

    if (showSidebarMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebarMenu]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-purple-950/20 dark:to-indigo-950/30">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="relative bg-gradient-to-b from-white via-purple-50/10 to-indigo-50/20 dark:from-gray-800 dark:via-purple-950/10 dark:to-indigo-950/20 border-r-2 border-purple-200 dark:border-purple-900/30 overflow-hidden transition-all duration-300 ease-in-out shadow-lg"
        style={{
          width: sidebarOpen ? `${sidebarWidth}px` : '0px',
        }}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-gradient-to-r from-purple-200 via-indigo-200 to-blue-200 dark:from-purple-800/30 dark:via-indigo-800/30 dark:to-blue-800/30 bg-gradient-to-r from-purple-50/50 via-indigo-50/50 to-blue-50/50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-lg shadow-lg mr-3 shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent truncate">
                Portfolio Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-1">
              {/* Sidebar Options Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowSidebarMenu(!showSidebarMenu)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                  title="Sidebar options"
                >
                  <MoreVertical className="w-4 h-4 dark:text-gray-300" />
                </button>

                {showSidebarMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={resetSidebarWidth}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center dark:text-gray-200"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Width
                      </button>
                      <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-600">
                        <div>Ctrl+B: Toggle sidebar</div>
                        <div>Ctrl+Shift+R: Reset width</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors lg:hidden shrink-0"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Portfolio Tree */}
          <div className="flex-1 overflow-hidden">
            <PortfolioTree onNodeSelect={handleNodeSelect} />
          </div>
        </div>

        {/* Resize Handle */}
        {sidebarOpen && (
          <div
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize group transition-all duration-300 ${
              isResizing ? 'bg-gradient-to-b from-purple-500 via-indigo-500 to-blue-500 shadow-glow' : 'bg-purple-200 dark:bg-purple-800/30 hover:bg-gradient-to-b hover:from-purple-400 hover:via-indigo-400 hover:to-blue-400'
            }`}
            onMouseDown={handleMouseDown}
            title="Drag to resize sidebar"
          >
            {/* Visual indicator */}
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2">
              <div className={`p-1 rounded-full transition-all duration-300 ${
                isResizing ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-glow-lg' : 'bg-purple-100 dark:bg-purple-900/50 group-hover:bg-gradient-to-br group-hover:from-purple-400 group-hover:to-indigo-500'
              }`}>
                <GripVertical
                  className={`w-3 h-6 transition-colors ${
                    isResizing ? 'text-white' : 'text-purple-600 dark:text-purple-400 group-hover:text-white'
                  }`}
                />
              </div>
            </div>

            {/* Hover area - wider for easier grabbing */}
            <div className="absolute top-0 right-0 w-3 h-full -translate-x-1" />

            {/* Subtle indicator line when not hovering */}
            {!isResizing && (
              <div className="absolute top-1/4 right-0 w-px h-1/2 bg-purple-300 dark:bg-purple-700 group-hover:bg-transparent transition-colors" />
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-white via-purple-50/20 to-indigo-50/30 dark:from-gray-800 dark:via-purple-950/20 dark:to-indigo-950/30 border-b-2 border-purple-200 dark:border-purple-900/30 px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 hover:from-purple-200 hover:to-indigo-200 dark:hover:from-purple-800/40 dark:hover:to-indigo-800/40 rounded-lg transition-all duration-300 mr-3 border border-purple-200 dark:border-purple-800/50"
              >
                <Menu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </button>
            )}

            <div>
              {selectedNode ? (
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    {selectedNode.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize font-medium">
                    {selectedNode.type} Analytics
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Portfolio Analytics
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Select a client, portfolio, or account to view details
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <UserMenu />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <DetailPanel
            selectedNode={selectedNode}
            nodeData={selectedNodeData}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </div>

      {/* Global resize overlay */}
      {isResizing && (
        <div className="fixed inset-0 z-50" style={{ cursor: 'col-resize' }} />
      )}
    </div>
  );
};

export default AppLayout;
