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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="relative bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          width: sidebarOpen ? `${sidebarWidth}px` : '0px',
        }}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center min-w-0">
              <TrendingUp className="w-6 h-6 text-primary dark:text-indigo-400 mr-2 shrink-0" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
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
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-blue-500 transition-colors ${
              isResizing ? 'bg-blue-500' : 'bg-gray-200 hover:bg-blue-400'
            }`}
            onMouseDown={handleMouseDown}
            title="Drag to resize sidebar"
          >
            {/* Visual indicator */}
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2">
              <GripVertical
                className={`w-3 h-6 text-gray-400 group-hover:text-white transition-colors ${
                  isResizing ? 'text-white' : ''
                }`}
              />
            </div>

            {/* Hover area - wider for easier grabbing */}
            <div className="absolute top-0 right-0 w-3 h-full -translate-x-1" />

            {/* Subtle indicator line when not hovering */}
            {!isResizing && (
              <div className="absolute top-1/4 right-0 w-px h-1/2 bg-gray-300 group-hover:bg-transparent transition-colors" />
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors mr-3"
              >
                <Menu className="w-5 h-5 dark:text-gray-300" />
              </button>
            )}

            <div>
              {selectedNode ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedNode.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {selectedNode.type} Analytics
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Portfolio Analytics
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
