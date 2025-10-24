import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, ChevronDown, Sun, Moon, Monitor, Settings } from 'lucide-react';
import { selectCurrentUser, logout } from '../../store/authSlice';
import { useLogoutMutation } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local state and redirect, even if the API call fails
      dispatch(logout());
      navigate('/login');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={`User menu for ${user.fullName}`}
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-medium">
          {user.firstName.charAt(0)}
          {user.lastName.charAt(0)}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.fullName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">{user.roles[0] || 'User'}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-2">
            {/* User Info */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.fullName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
              {user.roles && user.roles.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Selection */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Theme</div>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center px-2 py-1.5 text-sm rounded transition-colors ${
                    theme === 'light'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center px-2 py-1.5 text-sm rounded transition-colors ${
                    theme === 'dark'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center px-2 py-1.5 text-sm rounded transition-colors ${
                    theme === 'system'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  System
                </button>
              </div>
            </div>

            {/* Menu Items */}
            {user.roles?.includes('Admin') && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Dashboard
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
